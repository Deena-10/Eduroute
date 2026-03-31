// Admin: post events/jobs into career_events (uses same API as curl). Bookmark /admin/post — not linked in nav.
import React, { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";

const STORAGE_KEY = "eduroute_admin_key";

const AdminPost = () => {
  const [adminKey, setAdminKey] = useState(() => sessionStorage.getItem(STORAGE_KEY) || "");
  const [rememberKey, setRememberKey] = useState(true);
  const [type, setType] = useState("event");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [domain, setDomain] = useState("");
  const [level, setLevel] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = "Post event / job — EduRoute";
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    if (!adminKey.trim()) {
      setError("Admin key is required (set ADMIN_API_KEY on the backend; paste the same value here).");
      return;
    }
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    setSubmitting(true);
    try {
      if (rememberKey) sessionStorage.setItem(STORAGE_KEY, adminKey.trim());
      else sessionStorage.removeItem(STORAGE_KEY);

      const res = await axiosInstance.post(
        "/admin/events",
        {
          type: type.trim(),
          title: title.trim(),
          description: description.trim() || undefined,
          url: url.trim() || undefined,
          domain: domain.trim() || undefined,
          level: level.trim() || undefined,
          event_date: eventDate || undefined,
        },
        { headers: { "x-admin-key": adminKey.trim() } }
      );
      if (res.data?.success) {
        setMessage(
          `Created. Notified ${res.data.notified_users ?? 0} user(s). ID: ${res.data.event?.id ?? "—"}`
        );
        setTitle("");
        setDescription("");
        setUrl("");
      } else {
        setError(res.data?.message || "Request failed");
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Request failed";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "100px 20px 48px",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        background: "#F4F9F5",
        color: "#1A2E1A",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Fraunces:opsz,wght@9..144,600&display=swap');
        @keyframes spin { to { transform: rotate(360deg) } }
        .ap-in { width:100%; padding:10px 14px; border-radius:10px; border:1.5px solid #D4E8D7; background:#fff; font-size:14px; box-sizing:border-box; }
        .ap-in:focus { outline:none; border-color:#40916C; box-shadow:0 0 0 3px rgba(64,145,108,0.12); }
        .ap-lbl { display:block; font-size:11px; font-weight:700; color:#3D5A3E; text-transform:uppercase; letter-spacing:0.1em; margin-bottom:6px; }
      `}</style>

      <div style={{ maxWidth: 520, margin: "0 auto" }}>
        <h1
          style={{
            fontFamily: "'Fraunces', serif",
            fontSize: "clamp(1.5rem,3vw,2rem)",
            fontWeight: 600,
            marginBottom: 8,
          }}
        >
          Post event or job
        </h1>
        <p style={{ fontSize: 14, color: "#6B8F71", lineHeight: 1.6, marginBottom: 24 }}>
          Uses your backend <code style={{ fontSize: 12 }}>/api/admin/events</code>. Entries show on the Events page
          for users. Use type <strong>job</strong>, <strong>event</strong>, or <strong>webinar</strong>.
        </p>

        <div
          style={{
            background: "#fff",
            border: "1px solid #D4E8D7",
            borderRadius: 18,
            padding: 24,
            boxShadow: "0 12px 40px rgba(26,46,26,0.08)",
          }}
        >
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label className="ap-lbl">Admin API key</label>
              <input
                className="ap-in"
                type="password"
                autoComplete="off"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                placeholder="Matches ADMIN_API_KEY on Render"
              />
              <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, fontSize: 12, color: "#6B8F71" }}>
                <input
                  type="checkbox"
                  checked={rememberKey}
                  onChange={(e) => setRememberKey(e.target.checked)}
                />
                Remember in this browser tab (session only)
              </label>
            </div>

            <div>
              <label className="ap-lbl">Type</label>
              <select className="ap-in" value={type} onChange={(e) => setType(e.target.value)}>
                <option value="event">event</option>
                <option value="webinar">webinar</option>
                <option value="job">job</option>
              </select>
            </div>

            <div>
              <label className="ap-lbl">Title</label>
              <input className="ap-in" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Short headline" />
            </div>

            <div>
              <label className="ap-lbl">Description (optional)</label>
              <textarea
                className="ap-in"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ resize: "vertical" }}
              />
            </div>

            <div>
              <label className="ap-lbl">Link URL (optional)</label>
              <input className="ap-in" type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" />
            </div>

            <div>
              <label className="ap-lbl">Domain filter (optional)</label>
              <input
                className="ap-in"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="e.g. Python — only notify matching users; leave empty for all"
              />
            </div>

            <div>
              <label className="ap-lbl">Level (optional)</label>
              <input className="ap-in" value={level} onChange={(e) => setLevel(e.target.value)} placeholder="beginner / intermediate / advanced" />
            </div>

            <div>
              <label className="ap-lbl">Date (optional)</label>
              <input className="ap-in" type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
            </div>

            {error && (
              <div
                style={{
                  padding: "12px 14px",
                  background: "#FFF5F5",
                  border: "1px solid #FED7D7",
                  borderRadius: 10,
                  fontSize: 13,
                  color: "#C53030",
                }}
              >
                {error}
              </div>
            )}
            {message && (
              <div
                style={{
                  padding: "12px 14px",
                  background: "#F0FAF3",
                  border: "1px solid #B7E4C7",
                  borderRadius: 10,
                  fontSize: 13,
                  color: "#22543D",
                }}
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              style={{
                marginTop: 4,
                padding: "14px 20px",
                background: submitting ? "#9AB89D" : "#2D6A4F",
                color: "#fff",
                border: "none",
                borderRadius: 12,
                fontWeight: 800,
                fontSize: 14,
                cursor: submitting ? "not-allowed" : "pointer",
                boxShadow: "0 6px 24px rgba(45,106,79,0.22)",
              }}
            >
              {submitting ? "Posting…" : "Publish"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminPost;
