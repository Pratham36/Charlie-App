import { Readable } from 'stream';
import { drive, FOLDER_ID } from '../config/googleDrive.js';
import DailyLog from '../models/DailyLog.js';

// Upload photo to Google Drive and save reference to log
export const uploadPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { logId, caption } = req.body;

    // Convert buffer to stream
    const bufferStream = new Readable();
    bufferStream.push(req.file.buffer);
    bufferStream.push(null);

    // Upload to Google Drive
    const driveResponse = await drive.files.create({
      requestBody: {
        name: `charlie_${Date.now()}_${req.file.originalname}`,
        mimeType: req.file.mimetype,
        parents: [FOLDER_ID],
      },
      media: {
        mimeType: req.file.mimetype,
        body: bufferStream,
      },
      fields: 'id, webViewLink, webContentLink',
    });

    // Make file publicly readable
    await drive.permissions.create({
      fileId: driveResponse.data.id,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    const photoData = {
      driveId: driveResponse.data.id,
      driveUrl: `/api/photos/view/${driveResponse.data.id}`,
      caption: caption || '',
      uploadedAt: new Date(),
    };

    // If logId provided, attach to that log
    if (logId) {
      await DailyLog.findByIdAndUpdate(logId, {
        $push: { photos: photoData }
      });
    }

    res.status(201).json({
      message: 'Photo uploaded successfully',
      photo: photoData,
    });
  } catch (error) {
    console.error('Drive upload error:', error);
    res.status(500).json({ message: 'Photo upload failed', error: error.message });
  }
};

// Delete photo from Google Drive
export const deletePhoto = async (req, res) => {
  try {
    const { driveId, logId } = req.body;

    await drive.files.delete({ fileId: driveId });

    if (logId) {
      await DailyLog.findByIdAndUpdate(logId, {
        $pull: { photos: { driveId } }
      });
    }

    res.json({ message: 'Photo deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all photos from Drive folder
export const getAllPhotos = async (req, res) => {
  try {
    const response = await drive.files.list({
      q: `'${FOLDER_ID}' in parents and trashed=false`,
      fields: 'files(id, name, createdTime, mimeType)',
      orderBy: 'createdTime desc',
      pageSize: 50,
    });

    const photos = response.data.files
      .filter(f => f.mimeType && (f.mimeType.startsWith('image/') || f.mimeType.startsWith('video/')))
      .map(f => ({
        driveId: f.id,
        driveUrl: `/api/photos/view/${f.id}`,
        name: f.name,
        createdTime: f.createdTime,
        mimeType: f.mimeType,
      }));

    res.json(photos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Stream photo/video directly from Google Drive
export const viewPhoto = async (req, res) => {
  try {
    const { driveId } = req.params;

    // Get file metadata to check mimeType and size
    const fileMetadata = await drive.files.get({
      fileId: driveId,
      fields: 'mimeType, size',
    });

    const mimeType = fileMetadata.data.mimeType || 'application/octet-stream';
    const fileSize = parseInt(fileMetadata.data.size, 10);

    const range = req.headers.range;

    if (range && !isNaN(fileSize)) {
      // Parse Range header e.g. "bytes=32324-" or "bytes=32324-45343"
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      if (start >= fileSize || end >= fileSize) {
        res.status(416).set('Content-Range', `bytes */${fileSize}`).end();
        return;
      }

      const chunksize = (end - start) + 1;

      const driveResponse = await drive.files.get(
        { fileId: driveId, alt: 'media' },
        { 
          responseType: 'stream',
          headers: { Range: `bytes=${start}-${end}` }
        }
      );

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': mimeType,
      });

      driveResponse.data
        .on('error', (err) => {
          console.error('Stream error:', err);
          if (!res.headersSent) res.status(500).end();
        })
        .pipe(res);
    } else {
      // No range header requested, send full file
      const driveResponse = await drive.files.get(
        { fileId: driveId, alt: 'media' },
        { responseType: 'stream' }
      );

      const headers = {
        'Content-Type': mimeType,
        'Accept-Ranges': 'bytes',
      };
      if (!isNaN(fileSize)) {
        headers['Content-Length'] = fileSize;
      }

      res.writeHead(200, headers);

      driveResponse.data
        .on('error', (err) => {
          console.error('Stream error:', err);
          if (!res.headersSent) res.status(500).end();
        })
        .pipe(res);
    }
  } catch (error) {
    console.error('Error viewing photo/video:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Error retrieving photo/video', error: error.message });
    }
  }
};
