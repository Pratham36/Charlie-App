// PhotosPage.jsx
import { useState, useEffect, useRef } from 'react';
import { photosAPI } from '../api/index.js';
import toast from 'react-hot-toast';
import { Upload, Trash2, ExternalLink, Play } from 'lucide-react';

export function PhotosPage() {
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileRef = useRef();

  const load = () => photosAPI.getAll()
    .then(res => setPhotos(res.data))
    .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('photo', file);
      await photosAPI.upload(formData);
      toast.success('Media uploaded to Google Drive ✅');
      load();
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (photo) => {
    if (!confirm('Delete this item?')) return;
    try {
      await photosAPI.delete({ driveId: photo.driveId });
      toast.success('Deleted');
      load();
    } catch {
      toast.error('Delete failed');
    }
  };

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-charlie-ink">Photos & Videos</h1>
        <div>
          <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleUpload} />
          <button onClick={() => fileRef.current.click()} disabled={uploading} className="btn-primary flex items-center gap-2">
            <Upload size={16} />
            {uploading ? 'Uploading...' : 'Upload Media'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-charlie-amber font-mono animate-pulse">Loading media...</div>
      ) : photos.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-gray-400 mb-4">No photos or videos yet</p>
          <button onClick={() => fileRef.current.click()} className="btn-primary">Upload First Item</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map(photo => {
            const isVideo = photo.mimeType?.startsWith('video/') || /\.(mp4|webm|ogg|mov|m4v)$/i.test(photo.name);
            return (
              <div 
                key={photo.driveId} 
                className="group relative rounded-xl overflow-hidden bg-gray-100 aspect-square"
                onMouseEnter={e => {
                  const video = e.currentTarget.querySelector('video');
                  if (video) video.play().catch(() => {});
                }}
                onMouseLeave={e => {
                  const video = e.currentTarget.querySelector('video');
                  if (video) {
                    video.pause();
                    video.currentTime = 0;
                  }
                }}
              >
                {isVideo ? (
                  <div className="w-full h-full relative">
                    <video
                      src={photo.driveUrl}
                      className="w-full h-full object-cover"
                      muted
                      loop
                      playsInline
                      preload="metadata"
                    />
                    <div className="absolute top-2 left-2 bg-black/50 text-white p-1.5 rounded-lg flex items-center justify-center pointer-events-none">
                      <Play size={12} fill="white" className="text-white" />
                    </div>
                  </div>
                ) : (
                  <img
                    src={photo.driveUrl}
                    alt={photo.name}
                    className="w-full h-full object-cover"
                    onError={e => { e.target.src = 'https://via.placeholder.com/300?text=Charlie+🐾'; }}
                  />
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <a href={photo.driveUrl} target="_blank" rel="noopener noreferrer"
                    className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-charlie-ink hover:bg-charlie-amber hover:text-white transition-colors">
                    <ExternalLink size={14} />
                  </a>
                  <button onClick={() => handleDelete(photo)}
                    className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default PhotosPage;


// MilestonesPage.jsx — separate export at bottom
