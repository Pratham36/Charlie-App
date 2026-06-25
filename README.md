# Charlie Puppy Tracker 🐾

A full-stack MERN web app to track Charlie's daily logs, training, health records, and photos.

---

## Tech Stack

- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Node.js + Express
- **Database:** MongoDB Atlas
- **Auth:** JWT
- **Photos:** Google Drive API
- **Deploy:** Vercel (frontend) + Render (backend)

---

## Project Structure

```
charlie-app/
├── server/          ← Express backend
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── index.js
├── client/          ← React frontend
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   └── pages/
│   └── index.html
└── README.md
```

---

## Setup — Step by Step

### Step 1 — MongoDB Atlas

1. Go to https://mongodb.com/atlas
2. Create free account
3. Create a cluster (free M0 tier)
4. Database Access → Add user → set username + password
5. Network Access → Allow from anywhere (0.0.0.0/0)
6. Click Connect → Drivers → copy the connection string
7. Replace `<password>` with your password

### Step 2 — Google Drive API

1. Go to https://console.cloud.google.com
2. Create new project → name it "charlie-tracker"
3. Enable "Google Drive API"
4. Credentials → Create → OAuth 2.0 Client ID → Web application
5. Add `http://localhost:5000` to authorized origins
6. Download credentials JSON → copy Client ID and Client Secret
7. Get refresh token:
   - Go to https://developers.google.com/oauthplayground
   - Settings → Use your own OAuth credentials → paste Client ID + Secret
   - Scope: https://www.googleapis.com/auth/drive.file
   - Authorize → Exchange for tokens → copy refresh token
8. Create a folder in your Google Drive named "Charlie Photos"
9. Get folder ID from the URL when you open it

### Step 3 — Server Setup

```bash
cd server
npm install
cp .env.example .env
# Fill in your .env values
npm run dev
```

Your .env should look like:
```
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/charlie-db
JWT_SECRET=any_random_long_string_here
JWT_EXPIRES_IN=30d
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback
GOOGLE_REFRESH_TOKEN=your_refresh_token
GOOGLE_DRIVE_FOLDER_ID=your_folder_id
CLIENT_URL=http://localhost:5173
```

### Step 4 — Create Admin Account

Once server is running, run this in your terminal:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Pratham","email":"pratham@charlie.com","password":"0303srph","role":"admin"}'
```

### Step 5 — Client Setup

```bash
cd client
npm install
npm run dev
```

Open http://localhost:5173

---

## Adding Family Members

Once logged in as admin:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"FamilyName","email":"family@email.com","password":"password","role":"family"}'
```

---

## Deployment

### Backend → Render

1. Push server/ to GitHub
2. Go to render.com → New Web Service
3. Connect GitHub repo
4. Build command: `npm install`
5. Start command: `node index.js`
6. Add all .env variables in Environment tab
7. Deploy → copy your Render URL

### Frontend → Vercel

1. Update client/vite.config.js proxy target to your Render URL
2. Push client/ to GitHub
3. Go to vercel.com → Import project
4. Framework: Vite
5. Deploy → done

---

## API Endpoints

### Auth
- POST /api/auth/login
- POST /api/auth/register
- GET /api/auth/me

### Daily Logs
- GET /api/logs — all logs (paginated)
- GET /api/logs/today — today's log
- POST /api/logs — create log
- PUT /api/logs/:id — update log
- DELETE /api/logs/:id — delete log
- GET /api/logs/stats/summary — 7-day stats

### Health Records
- GET /api/health
- POST /api/health/vaccine
- PUT /api/health/vaccine/:id
- DELETE /api/health/vaccine/:id
- POST /api/health/deworming
- POST /api/health/medicine
- PUT /api/health/medicine/:id
- POST /api/health/milestone
- DELETE /api/health/milestone/:id

### Training
- GET /api/training
- PUT /api/training
- POST /api/training/command
- PUT /api/training/command/:id

### Photos
- GET /api/photos
- POST /api/photos/upload
- DELETE /api/photos

---

## Charlie's Data (Pre-loaded)

The training profile auto-creates with all of Charlie's commands on first load:
- Sit, Come, Wait, Stay, Look, No Bite, Heel, Bed/Place, Chal

Health records need to be added manually through the UI or API.

---

Built with ❤️ for Charlie · Lab Mix · Virar, Maharashtra 🐾
