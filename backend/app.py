"""
ARHICA Backend API (Flask + SQLite)

Handles:
  * Stories / articles, events, videos  (CRUD, admin only for writes)
  * Media library: image + video uploads (images auto-resized + thumbnailed)
  * Newsletter, contact, partnership and donation-intent forms
  * Simple admin authentication (signed token)

Run (dev):   python app.py
Run (prod):  gunicorn -w 3 -b 0.0.0.0:5000 app:app
"""
import html
import os
import re
import shutil
import smtplib
import sqlite3
import subprocess
import uuid
from datetime import datetime, timezone
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from functools import wraps
from pathlib import Path

import requests
from dotenv import load_dotenv
from flask import Flask, g, jsonify, request, send_from_directory
from flask_cors import CORS
from itsdangerous import BadSignature, SignatureExpired, URLSafeTimedSerializer
from PIL import Image, ImageOps
from werkzeug.utils import secure_filename

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent

# Configurable database and upload locations.
# Render environment variables override these defaults.
DB_PATH = Path(os.getenv("DB_PATH", str(BASE_DIR / "arhica.db")))
UPLOAD_DIR = Path(os.getenv("UPLOAD_DIR", str(BASE_DIR / "uploads")))

# Create upload directories.
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
(UPLOAD_DIR / "thumbs").mkdir(parents=True, exist_ok=True)

SECRET_KEY = os.getenv("SECRET_KEY", "change-me-in-production")
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "****")  
TOKEN_MAX_AGE = 60 * 60 * 12  # 12hrs

CONTACT_EMAIL = os.getenv("CONTACT_EMAIL", "info@arhica.org")
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASS = os.getenv("SMTP_PASS", "")
JETSMAIL_API_KEY = os.getenv("JETSMAIL_API_KEY", "")
JETSMAIL_LIST_ID = os.getenv("JETSMAIL_LIST_ID", "")
JETSMAIL_BASE_URL = os.getenv("JETSMAIL_BASE_URL", "https://api.jetsmail.net/v1")

IMAGE_EXT = {"jpg", "jpeg", "png", "webp", "gif"}
VIDEO_EXT = {"mp4", "webm", "mov", "m4v"}
DOC_EXT = {"pdf"}
MAX_UPLOAD_MB = int(os.getenv("MAX_UPLOAD_MB", "512"))

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = MAX_UPLOAD_MB * 1024 * 1024
origins = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173,https://arhica.org,https://www.arhica.org",
).split(",")
CORS(app, origins=origins)
signer = URLSafeTimedSerializer(SECRET_KEY)


# ───────────────────────── Database ─────────────────────────
SCHEMA = """
CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT DEFAULT '',
  body TEXT DEFAULT '',
  category TEXT DEFAULT 'News',
  cover TEXT DEFAULT '',
  author TEXT DEFAULT 'ARHICA Team',
  featured INTEGER DEFAULT 0,
  status TEXT DEFAULT 'published',
  published_at TEXT,
  created_at TEXT
);
CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  location TEXT DEFAULT '',
  start_date TEXT,
  end_date TEXT,
  cover TEXT DEFAULT '',
  link TEXT DEFAULT '',
  status TEXT DEFAULT 'published',
  created_at TEXT
);
CREATE TABLE IF NOT EXISTS videos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  category TEXT DEFAULT 'Story',
  source TEXT DEFAULT 'youtube',      -- youtube | upload
  url TEXT NOT NULL,
  thumbnail TEXT DEFAULT '',
  featured INTEGER DEFAULT 0,
  status TEXT DEFAULT 'published',
  created_at TEXT
);
CREATE TABLE IF NOT EXISTS media (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  filename TEXT NOT NULL,
  url TEXT NOT NULL,
  thumb TEXT DEFAULT '',
  kind TEXT NOT NULL,                 -- image | video | document
  original_name TEXT,
  caption TEXT DEFAULT '',
  album TEXT DEFAULT 'General',
  size INTEGER DEFAULT 0,
  in_gallery INTEGER DEFAULT 1,
  created_at TEXT
);
CREATE TABLE IF NOT EXISTS subscribers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL, name TEXT DEFAULT '', created_at TEXT
);
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kind TEXT, name TEXT, email TEXT, organization TEXT,
  subject TEXT, message TEXT, is_read INTEGER DEFAULT 0, created_at TEXT
);
CREATE TABLE IF NOT EXISTS donations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name TEXT, email TEXT, phone TEXT, amount REAL,
  donation_type TEXT, message TEXT, status TEXT DEFAULT 'intent', created_at TEXT
);
"""


def now():
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def db():
    if "db" not in g:
        g.db = sqlite3.connect(DB_PATH)
        g.db.row_factory = sqlite3.Row
    return g.db


@app.teardown_appcontext
def close_db(_exc):
    conn = g.pop("db", None)
    if conn:
        conn.close()


def rows(sql, args=()):
    return [dict(r) for r in db().execute(sql, args).fetchall()]


def one(sql, args=()):
    r = db().execute(sql, args).fetchone()
    return dict(r) if r else None



def init_db():
    # Ensure the database's parent directory exists.
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)

    # Ensure upload folders exist.
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    (UPLOAD_DIR / "thumbs").mkdir(parents=True, exist_ok=True)

    conn = sqlite3.connect(str(DB_PATH))
    try:
        conn.executescript(SCHEMA)

        if conn.execute("SELECT COUNT(*) FROM posts").fetchone()[0] == 0:
            seed(conn)

        conn.commit()
    finally:
        conn.close()


def seed(conn):
    """Starter content taken from the current arhica.org so the site is never empty."""
    posts = [
        ("How Youth-Led Climate Action is Transforming Lake Victoria Communities", "Climate Action",
         "/images/blue economy.jpg", "2026-03-15",
         "Young change-makers from Kisumu are pioneering innovative approaches to climate resilience, combining traditional ecological knowledge with modern technology to protect the lake's ecosystem.", 1),
        ("Sustainable Aquaculture: Building Food Security at Lake Victoria", "Blue Economy",
         "/images/fishcage2.jpg", "2026-02-28",
         "Fish cage enterprises are creating new economic opportunities while helping restore fish populations in East Africa's largest lake.", 0),
        ("Women at the Forefront: Gender Equality in Climate Decision-Making", "GESI",
         "/images/gender equality.jpg", "2026-02-10",
         "ARHICA's GESI programme is breaking barriers and ensuring women's voices shape climate adaptation strategies across the region.", 0),
        ("SamakiLog: Digital Technology Revolutionizing Fisheries Data", "Innovation",
         "/images/samakilog.png", "2026-01-22",
         "Our mobile application is now tracking thousands of catch records, giving fishers and policymakers the data they need to protect fish stocks.", 0),
        ("Restoring the Shoreline: Community Conservation in Action", "Restoration",
         "/images/water hyacint.jpg", "2026-01-05",
         "Over 500 community members participated in ecosystem restoration drives, planting over 3,000 trees along Lake Victoria's shores.", 0),
    ]
    for title, cat, cover, date, excerpt, feat in posts:
        conn.execute(
            "INSERT INTO posts (slug,title,excerpt,body,category,cover,featured,status,published_at,created_at)"
            " VALUES (?,?,?,?,?,?,?, 'published', ?, ?)",
            (slugify(title), title, excerpt, excerpt, cat, cover, feat, date, now()),
        )
    conn.execute(
        "INSERT INTO videos (title,description,category,source,url,featured,created_at) VALUES (?,?,?,?,?,1,?)",
        ("ARHICA: Building Climate Resilience in the Heart of Africa",
         "An overview of ARHICA's mission, programmes and impact across the Lake Victoria Basin.",
         "Organization Story", "youtube", "https://youtu.be/N3-b7_uJGAU", now()),
    )


def slugify(text):
    s = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")[:70]
    return s or uuid.uuid4().hex[:8]


def unique_slug(table, title, exclude_id=None):
    base, slug, n = slugify(title), slugify(title), 2
    while True:
        r = one(f"SELECT id FROM {table} WHERE slug=?", (slug,))
        if not r or r["id"] == exclude_id:
            return slug
        slug = f"{base}-{n}"
        n += 1


# ───────────────────────── Auth ─────────────────────────
def is_admin():
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return False
    try:
        data = signer.loads(auth[7:], max_age=TOKEN_MAX_AGE)
        return data.get("role") == "admin"
    except (BadSignature, SignatureExpired):
        return False


def admin_required(fn):
    @wraps(fn)
    def wrapper(*a, **kw):
        if not is_admin():
            return jsonify({"error": "Unauthorized"}), 401
        return fn(*a, **kw)
    return wrapper


@app.post("/api/auth/login")
def login():
    d = request.get_json(silent=True) or {}
    if d.get("username") == ADMIN_USERNAME and d.get("password") == ADMIN_PASSWORD:
        return jsonify({"token": signer.dumps({"role": "admin"}), "expires_in": TOKEN_MAX_AGE})
    return jsonify({"error": "Invalid credentials"}), 401


@app.get("/api/auth/me")
@admin_required
def me():
    return jsonify({"ok": True})


# ───────────────────────── Media uploads ─────────────────────────
def ext_of(name):
    return name.rsplit(".", 1)[-1].lower() if "." in name else ""


def save_upload(f, album="General", caption="", in_gallery=1):
    original = secure_filename(f.filename or "file")
    ext = ext_of(original)
    if ext in IMAGE_EXT:
        kind = "image"
    elif ext in VIDEO_EXT:
        kind = "video"
    elif ext in DOC_EXT:
        kind = "document"
    else:
        raise ValueError(f"File type .{ext} not allowed")

    name = f"{uuid.uuid4().hex}.{ext}"
    path = UPLOAD_DIR / name
    thumb = ""

    if kind == "image":
        try:
            img = Image.open(f.stream)
            img = ImageOps.exif_transpose(img)
            if ext != "gif":
                img.thumbnail((2200, 2200))
                if ext in ("jpg", "jpeg") and img.mode != "RGB":
                    img = img.convert("RGB")
                img.save(path, quality=86, optimize=True)
            else:
                f.stream.seek(0)
                f.save(path)
            t = img.copy()
            t.thumbnail((640, 640))
            if t.mode not in ("RGB", "RGBA"):
                t = t.convert("RGB")
            t.save(UPLOAD_DIR / "thumbs" / f"{Path(name).stem}.webp", "WEBP", quality=78)
            thumb = f"/media/thumbs/{Path(name).stem}.webp"
        except Exception as e:  # corrupt image
            raise ValueError(f"Could not read image: {e}")
    else:
        f.save(path)
        if kind == "video" and shutil.which("ffmpeg"):  # optional poster frame
            poster = UPLOAD_DIR / "thumbs" / f"{Path(name).stem}.jpg"
            try:
                subprocess.run(
                    ["ffmpeg", "-y", "-ss", "1", "-i", str(path), "-frames:v", "1", "-vf", "scale=640:-2", str(poster)],
                    capture_output=True, timeout=60, check=True)
                thumb = f"/media/thumbs/{poster.name}"
            except Exception:
                pass

    cur = db().execute(
        "INSERT INTO media (filename,url,thumb,kind,original_name,caption,album,size,in_gallery,created_at)"
        " VALUES (?,?,?,?,?,?,?,?,?,?)",
        (name, f"/media/{name}", thumb, kind, original, caption, album or "General",
         path.stat().st_size, in_gallery, now()),
    )
    db().commit()
    return one("SELECT * FROM media WHERE id=?", (cur.lastrowid,))


@app.get("/media/<path:filename>")
def serve_media(filename):
    resp = send_from_directory(UPLOAD_DIR, filename, conditional=True)
    resp.headers["Cache-Control"] = "public, max-age=2592000, immutable"
    return resp


@app.post("/api/media")
@admin_required
def upload_media():
    files = request.files.getlist("files") or request.files.getlist("file")
    if not files:
        return jsonify({"error": "No files received"}), 400
    album = request.form.get("album", "General")
    caption = request.form.get("caption", "")
    in_gallery = 0 if request.form.get("in_gallery") == "0" else 1
    saved, errors = [], []
    for f in files:
        try:
            saved.append(save_upload(f, album, caption, in_gallery))
        except ValueError as e:
            errors.append({"file": f.filename, "error": str(e)})
    return jsonify({"uploaded": saved, "errors": errors}), (201 if saved else 400)


@app.get("/api/media")
def list_media():
    where, args = ["1=1"], []
    if request.args.get("kind"):
        where.append("kind=?"); args.append(request.args["kind"])
    if request.args.get("album"):
        where.append("album=?"); args.append(request.args["album"])
    if not is_admin() or request.args.get("gallery") == "1":
        where.append("in_gallery=1")
    items = rows(f"SELECT * FROM media WHERE {' AND '.join(where)} ORDER BY id DESC LIMIT 500", args)
    albums = [r["album"] for r in rows("SELECT DISTINCT album FROM media ORDER BY album")]
    return jsonify({"items": items, "albums": albums})


@app.patch("/api/media/<int:mid>")
@admin_required
def update_media(mid):
    d = request.get_json(silent=True) or {}
    cur = one("SELECT * FROM media WHERE id=?", (mid,))
    if not cur:
        return jsonify({"error": "Not found"}), 404
    db().execute("UPDATE media SET caption=?, album=?, in_gallery=? WHERE id=?",
                 (d.get("caption", cur["caption"]), d.get("album", cur["album"]),
                  int(d.get("in_gallery", cur["in_gallery"])), mid))
    db().commit()
    return jsonify(one("SELECT * FROM media WHERE id=?", (mid,)))


@app.delete("/api/media/<int:mid>")
@admin_required
def delete_media(mid):
    m = one("SELECT * FROM media WHERE id=?", (mid,))
    if not m:
        return jsonify({"error": "Not found"}), 404
    for p in (UPLOAD_DIR / m["filename"],
              UPLOAD_DIR / "thumbs" / f"{Path(m['filename']).stem}.webp",
              UPLOAD_DIR / "thumbs" / f"{Path(m['filename']).stem}.jpg"):
        p.unlink(missing_ok=True)
    db().execute("DELETE FROM media WHERE id=?", (mid,))
    db().commit()
    return jsonify({"ok": True})


# ───────────────────────── Generic CRUD (posts / events / videos) ─────────────────────────
RESOURCES = {
    "posts": {
        "fields": ["title", "excerpt", "body", "category", "cover", "author", "featured", "status", "published_at"],
        "order": "COALESCE(published_at, created_at) DESC, id DESC",
        "slug": True,
    },
    "events": {
        "fields": ["title", "description", "location", "start_date", "end_date", "cover", "link", "status"],
        "order": "start_date DESC, id DESC",
        "slug": True,
    },
    "videos": {
        "fields": ["title", "description", "category", "source", "url", "thumbnail", "featured", "status"],
        "order": "featured DESC, id DESC",
        "slug": False,
    },
}


def register_crud(table, cfg):
    fields = cfg["fields"]

    def list_items():
        admin = is_admin() and request.args.get("all") == "1"
        where, args = [], []
        if not admin:
            where.append("status='published'")
        if request.args.get("category") and "category" in fields:
            where.append("category=?"); args.append(request.args["category"])
        if request.args.get("q"):
            where.append("title LIKE ?"); args.append(f"%{request.args['q']}%")
        if table == "events" and request.args.get("when") == "upcoming":
            where.append("start_date >= date('now')")
        if table == "events" and request.args.get("when") == "past":
            where.append("start_date < date('now')")
        limit = min(int(request.args.get("limit", 100)), 200)
        sql = f"SELECT * FROM {table}" + (f" WHERE {' AND '.join(where)}" if where else "")
        return jsonify(rows(sql + f" ORDER BY {cfg['order']} LIMIT ?", args + [limit]))

    def get_item(key):
        col = "id" if str(key).isdigit() else "slug"
        item = one(f"SELECT * FROM {table} WHERE {col}=?", (key,))
        if not item or (item.get("status") != "published" and not is_admin()):
            return jsonify({"error": "Not found"}), 404
        return jsonify(item)

    def clean(d):
        out = {k: d[k] for k in fields if k in d}
        if "featured" in out:
            out["featured"] = 1 if out["featured"] else 0
        if out.get("status") not in (None, "published", "draft"):
            out["status"] = "draft"
        return out

    @admin_required
    def create_item():
        d = clean(request.get_json(silent=True) or {})
        if not d.get("title"):
            return jsonify({"error": "Title is required"}), 400
        if table == "videos" and not d.get("url"):
            return jsonify({"error": "Video URL is required"}), 400
        if cfg["slug"]:
            d["slug"] = unique_slug(table, d["title"])
        if table == "posts" and not d.get("published_at"):
            d["published_at"] = now()[:10]
        d["created_at"] = now()
        cols = ",".join(d)
        cur = db().execute(f"INSERT INTO {table} ({cols}) VALUES ({','.join('?' * len(d))})", list(d.values()))
        db().commit()
        return jsonify(one(f"SELECT * FROM {table} WHERE id=?", (cur.lastrowid,))), 201

    @admin_required
    def update_item(iid):
        cur = one(f"SELECT * FROM {table} WHERE id=?", (iid,))
        if not cur:
            return jsonify({"error": "Not found"}), 404
        d = clean(request.get_json(silent=True) or {})
        if not d:
            return jsonify(cur)
        sets = ",".join(f"{k}=?" for k in d)
        db().execute(f"UPDATE {table} SET {sets} WHERE id=?", list(d.values()) + [iid])
        db().commit()
        return jsonify(one(f"SELECT * FROM {table} WHERE id=?", (iid,)))

    @admin_required
    def delete_item(iid):
        db().execute(f"DELETE FROM {table} WHERE id=?", (iid,))
        db().commit()
        return jsonify({"ok": True})

    app.add_url_rule(f"/api/{table}", f"{table}_list", list_items, methods=["GET"])
    app.add_url_rule(f"/api/{table}", f"{table}_create", create_item, methods=["POST"])
    app.add_url_rule(f"/api/{table}/<key>", f"{table}_get", get_item, methods=["GET"])
    app.add_url_rule(f"/api/{table}/<int:iid>", f"{table}_update", update_item, methods=["PUT", "PATCH"])
    app.add_url_rule(f"/api/{table}/<int:iid>", f"{table}_delete", delete_item, methods=["DELETE"])


for _t, _c in RESOURCES.items():
    register_crud(_t, _c)


# ───────────────────────── Email + forms ─────────────────────────
def send_email(to, subject, body_html):
    if not SMTP_USER or not SMTP_PASS:
        print(f"[EMAIL SKIPPED] to={to} subject={subject}")
        return True
    msg = MIMEMultipart("alternative")
    msg["Subject"], msg["From"], msg["To"] = subject, f"ARHICA <{SMTP_USER}>", to
    msg.attach(MIMEText(body_html, "html"))
    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=15) as s:
            s.starttls(); s.login(SMTP_USER, SMTP_PASS)
            s.sendmail(SMTP_USER, to, msg.as_string())
        return True
    except Exception as e:
        print(f"[EMAIL ERROR] {e}")
        return False


def esc(v):
    return html.escape(str(v or ""))


def valid_email(e):
    return bool(re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", e or ""))


def wrap_email(title, inner):
    return (f'<div style="font-family:sans-serif;max-width:600px;margin:auto">'
            f'<div style="background:#0b5e3e;color:#fff;padding:24px"><h2 style="margin:0">{esc(title)}</h2></div>'
            f'<div style="padding:24px;background:#f8faf7">{inner}</div>'
            f'<div style="padding:14px;background:#073d27;color:#9bb;text-align:center;font-size:12px">'
            f'ARHICA · Kisumu City, Lake Victoria Basin, Kenya</div></div>')


@app.post("/api/subscribe")
def subscribe():
    d = request.get_json(silent=True) or {}
    email = (d.get("email") or "").strip().lower()
    name = (d.get("name") or "").strip()
    if not valid_email(email):
        return jsonify({"success": False, "message": "Please enter a valid email address."}), 400
    if one("SELECT id FROM subscribers WHERE email=?", (email,)):
        return jsonify({"success": True, "message": "You are already subscribed. Thank you!"})
    db().execute("INSERT INTO subscribers (email,name,created_at) VALUES (?,?,?)", (email, name, now()))
    db().commit()
    if JETSMAIL_API_KEY:  # optional sync to Jetsmail
        try:
            requests.post(f"{JETSMAIL_BASE_URL}/subscribers",
                          headers={"Authorization": f"Bearer {JETSMAIL_API_KEY}"},
                          json={"email": email, "list_id": JETSMAIL_LIST_ID, "status": "active",
                                "merge_fields": {"FNAME": name, "SOURCE": "ARHICA Website"}}, timeout=10)
        except Exception as e:
            print("[JETSMAIL]", e)
    send_email(email, "Welcome to ARHICA!", wrap_email(
        "Welcome to the ARHICA community",
        f"<p>Thank you for subscribing{', ' + esc(name) if name else ''}. You'll receive updates on our work "
        f"across the Lake Victoria Basin.</p><p><a href='https://arhica.org'>Visit arhica.org</a></p>"))
    return jsonify({"success": True, "message": "Subscribed! Welcome to the ARHICA community."}), 201


@app.post("/api/contact")
def contact():
    return handle_message("contact")


@app.post("/api/partner")
def partner():
    return handle_message("partner")


def handle_message(kind):
    d = request.get_json(silent=True) or {}
    name, email = (d.get("name") or "").strip(), (d.get("email") or "").strip()
    org, message = (d.get("organization") or "").strip(), (d.get("message") or "").strip()
    subject = (d.get("subject") or d.get("interest") or "Website enquiry").strip()
    if not name or not valid_email(email) or (kind == "contact" and not message):
        return jsonify({"success": False, "message": "Name, a valid email and a message are required."}), 400
    db().execute(
        "INSERT INTO messages (kind,name,email,organization,subject,message,created_at) VALUES (?,?,?,?,?,?,?)",
        (kind, name, email, org, subject, message, now()))
    db().commit()
    send_email(CONTACT_EMAIL, f"[ARHICA {kind.title()}] {subject} — {name}", wrap_email(
        f"New {kind} message",
        f"<p><b>Name:</b> {esc(name)}<br><b>Email:</b> {esc(email)}<br><b>Organization:</b> {esc(org) or '—'}<br>"
        f"<b>Subject:</b> {esc(subject)}</p><p>{esc(message).replace(chr(10), '<br>')}</p>"))
    send_email(email, "ARHICA: we've received your message", wrap_email(
        f"Thank you, {name}!", "<p>We've received your message and will respond within 2 business days.</p>"))
    return jsonify({"success": True, "message": "Message sent! We'll be in touch soon."})


@app.post("/api/donations")
def donation_intent():
    d = request.get_json(silent=True) or {}
    name, email, phone = (d.get("fullName") or "").strip(), (d.get("email") or "").strip(), (d.get("phone") or "").strip()
    try:
        amount = float(d.get("amount") or 0)
    except ValueError:
        amount = 0
    if not name or not valid_email(email) or not phone or amount < 10:
        return jsonify({"success": False, "message": "Name, email, phone and an amount of at least KES 10 are required."}), 400
    db().execute(
        "INSERT INTO donations (full_name,email,phone,amount,donation_type,message,created_at) VALUES (?,?,?,?,?,?,?)",
        (name, email, phone, amount, d.get("donationType", "one-time"), (d.get("message") or "")[:1000], now()))
    db().commit()
    send_email(CONTACT_EMAIL, f"Donation intent — {name} · KES {amount:,.0f}", wrap_email(
        "New donation intent",
        f"<p><b>{esc(name)}</b> ({esc(email)}, {esc(phone)}) intends to give <b>KES {amount:,.0f}</b> "
        f"({esc(d.get('donationType'))}).</p><p>{esc(d.get('message'))}</p>"))
    return jsonify({"success": True, "message": "Donation intent recorded. Complete payment via M-Pesa."}), 201


# ───────────────────────── Admin dashboards ─────────────────────────
@app.get("/api/admin/stats")
@admin_required
def stats():
    count = lambda t, w="1=1": one(f"SELECT COUNT(*) c FROM {t} WHERE {w}")["c"]
    return jsonify({
        "posts": count("posts"), "events": count("events"), "videos": count("videos"),
        "images": count("media", "kind='image'"), "videoFiles": count("media", "kind='video'"),
        "subscribers": count("subscribers"), "messages": count("messages"),
        "unread": count("messages", "is_read=0"), "donations": count("donations"),
        "donationTotal": one("SELECT COALESCE(SUM(amount),0) s FROM donations")["s"],
    })


@app.get("/api/admin/<table>")
@admin_required
def admin_table(table):
    if table not in ("messages", "subscribers", "donations"):
        return jsonify({"error": "Unknown table"}), 404
    return jsonify(rows(f"SELECT * FROM {table} ORDER BY id DESC LIMIT 500"))


@app.post("/api/admin/messages/<int:mid>/read")
@admin_required
def mark_read(mid):
    db().execute("UPDATE messages SET is_read=1 WHERE id=?", (mid,))
    db().commit()
    return jsonify({"ok": True})


@app.get("/api/health")
def health():
    return jsonify({"status": "ARHICA API running", "version": "2.0"})


@app.errorhandler(413)
def too_large(_e):
    return jsonify({"error": f"File too large (max {MAX_UPLOAD_MB} MB)"}), 413


init_db()

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    print(f"\n🌿 ARHICA API on http://localhost:{port}  (admin: {ADMIN_USERNAME})")
    app.run(host="0.0.0.0", port=port, debug=os.getenv("FLASK_DEBUG", "true") == "true")
