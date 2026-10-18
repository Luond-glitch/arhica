# ARHICA website (React + Python)

```
arhica/
  backend/   Flask + SQLite API: stories, events, videos, media uploads, forms, admin auth
  frontend/  React (Vite) site + /admin dashboard
```

## Run locally
```bash
# 1) backend
cd backend && pip install -r requirements.txt
cp .env.example .env         
python app.py               

# 2) frontend (new terminal)
cd frontend && npm install && npm run dev   # http://localhost:5173
```
Admin: http://localhost:5173/admin (username/password from `.env`).

## Your images
Copy your existing photos (the `videos/images/*` folder, logo.jpeg) into `frontend/public/images/`.
Put favicons / apple-touch-icon / android-chrome-* PNGs into `frontend/public/`.
File names are referenced as before (e.g. `fishcage1.jpg`).
New content uploaded through the admin is stored in `backend/uploads/` and served from `/media/...`.

## Updating content
- Stories, events, videos, gallery photos/videos: **/admin** (drag-and-drop uploads, YouTube links or video files, drafts, featured flags).
- Board, management, teams: `frontend/src/data/people.js`. Programmes, stats, nav, contacts: `frontend/src/data/site.js`.
- Management names are placeholders ("To be announced") from your original management.html.

## Deploy
- Frontend: `npm run build`, serve `dist/` (set `VITE_API_URL` at build time if the API is on another domain).
- Backend: `gunicorn -w 3 -b 0.0.0.0:5000 app:app` behind nginx; proxy `/api` and `/media` to it and set
  `client_max_body_size 600m;` for video uploads. Add your domain to `CORS_ORIGINS`.
- Back up `backend/arhica.db` and `backend/uploads/`. Optional: install `ffmpeg` for video poster frames.

## Notes
- The old Jetsmail key in script.js was client-side; subscriptions now go to the backend (stored, with optional Jetsmail sync).
- The donation form records an intent and emails the team; payment still completes via M-Pesa Paybill 522533.
- Email fields are HTML-escaped (the old backend put raw input into emails).
