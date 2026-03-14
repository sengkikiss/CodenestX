// src/pages/Videos.jsx
import { useState, useRef } from "react";
import Modal from "../components/ui/Modal";
import { Field, FormGrid, FormActions, SearchBar, Btn, Card, PageHeader } from "../components/ui/Form";
import api from "../services/api";

const API = "http://localhost:5000";
const BLANK = { title: "", courseId: "", description: "", tags: "", videoUrl: "" };

const selectStyle = { background: "var(--input)", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 12px", fontSize: 13, color: "var(--text)", width: "100%", outline: "none" };
const labelStyle  = { fontSize: 12, fontWeight: 600, color: "var(--sub)", marginBottom: 5, display: "block", textTransform: "uppercase", letterSpacing: ".5px" };

const isYoutube = url => url && (url.includes("youtube.com") || url.includes("youtu.be"));
const getYtId   = url => { const m = url?.match(/(?:v=|youtu\.be\/)([^&?/]+)/); return m?.[1]; };
const isExtUrl  = url => url && (url.startsWith("http://") || url.startsWith("https://"));

const VideosPage = ({ videos, setVideos, courses, role, user }) => {
  const [q, setQ]                     = useState("");
  const [filterCourse, setFilterCourse] = useState("");
  const [modal, setModal]             = useState(false);
  const [playing, setPlaying]         = useState(null);
  const [form, setForm]               = useState(BLANK);
  const [uploadType, setUploadType]   = useState("url");
  const [videoFile, setVideoFile]     = useState(null);
  const [thumbFile, setThumbFile]     = useState(null);
  const [thumbPreview, setThumbPreview] = useState(null);
  const [saving, setSaving]           = useState(false);
  const videoRef = useRef();
  const thumbRef = useRef();

  const set = k => v => setForm(f => ({ ...f, [k]: v }));
  const canPost = role === "Admin" || role === "Teacher";

  const myCourses = role === "Teacher"
    ? courses.filter(c => String(c.teacher_id) === String(user?.teacherId) || String(c.teacherId) === String(user?.teacherId))
    : courses;

  const filtered = videos.filter(v => {
    const matchQ = `${v.title} ${v.description||""} ${v.teacherName||""} ${v.tags||""}`.toLowerCase().includes(q.toLowerCase());
    const matchC = !filterCourse || String(v.course_id) === String(filterCourse);
    return matchQ && matchC;
  });

  const openAdd = () => { setForm(BLANK); setVideoFile(null); setThumbFile(null); setThumbPreview(null); setUploadType("url"); setModal(true); };

  const handleThumb = e => {
    const f = e.target.files[0];
    if (!f) return;
    setThumbFile(f);
    setThumbPreview(URL.createObjectURL(f));
  };

  const save = async () => {
    if (!form.title || !form.courseId) { alert("Title and course are required."); return; }
    if (uploadType === "url" && !form.videoUrl) { alert("Please enter a video URL."); return; }
    if (uploadType === "file" && !videoFile)    { alert("Please select a video file."); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("title",       form.title);
      fd.append("courseId",    form.courseId);
      fd.append("description", form.description || "");
      fd.append("tags",        form.tags || "");
      if (uploadType === "url") fd.append("videoUrl", form.videoUrl);
      else                      fd.append("video", videoFile);
      if (thumbFile) fd.append("thumbnail", thumbFile);
      await api.post("/videos", fd, { headers: { "Content-Type": "multipart/form-data" } });
      const r = await api.get("/videos");
      setVideos(r.data);
      setModal(false);
    } catch (err) { alert("Error: " + (err.response?.data?.error || err.message)); }
    setSaving(false);
  };

  const remove = async id => {
    if (!window.confirm("Delete this video?")) return;
    await api.delete(`/videos/${id}`);
    setVideos(videos.filter(v => v.id !== id));
  };

  const getThumbnail = v => {
    if (v.thumbnail_url) return API + v.thumbnail_url;
    if (isYoutube(v.file_path)) return `https://img.youtube.com/vi/${getYtId(v.file_path)}/mqdefault.jpg`;
    return null;
  };

  const VideoPlayer = ({ v }) => {
    const src = v.file_path;
    if (isYoutube(src)) {
      const ytId = getYtId(src);
      return <iframe width="100%" height="400" src={`https://www.youtube.com/embed/${ytId}?autoplay=1`} frameBorder="0" allow="autoplay; fullscreen" allowFullScreen style={{ borderRadius: 10 }} />;
    }
    if (src && isExtUrl(src)) {
      return <iframe width="100%" height="400" src={src} frameBorder="0" allowFullScreen style={{ borderRadius: 10 }} />;
    }
    if (src && src.startsWith("/uploads")) {
      return (
        <video controls autoPlay width="100%" style={{ borderRadius: 10, maxHeight: 420, background: "#000" }}>
          <source src={API + src} type="video/mp4" />
          <source src={API + src} type="video/webm" />
          Your browser does not support the video tag.
        </video>
      );
    }
    return <div style={{ padding: 40, textAlign: "center", color: "var(--sub)" }}>Video not available</div>;
  };

  return (
    <div>
      <PageHeader title="Video Learning" sub={`${videos.length} videos`}
        action={canPost ? <Btn onClick={openAdd} icon="plus" label="Upload Video" /> : null} />

      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 200 }}><SearchBar value={q} onChange={setQ} placeholder="Search videos…" /></div>
        <select value={filterCourse} onChange={e => setFilterCourse(e.target.value)} style={{ ...selectStyle, minWidth: 180, width: "auto" }}>
          <option value="">All Courses</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: 60, color: "var(--sub)", border: "2px dashed var(--border)", borderRadius: 12 }}>
          <div style={{ fontSize: 48, marginBottom: 10 }}></div>
          <div style={{ fontWeight: 600 }}>No videos yet</div>
          <div style={{ fontSize: 13, marginTop: 4 }}>{canPost ? "Upload the first video for your students." : "Your teacher hasn't uploaded any videos yet."}</div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px,1fr))", gap: 16 }}>
        {filtered.map(v => {
          const thumb = getThumbnail(v);
          return (
            <div key={v.id} style={{ border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden", background: "var(--card)", cursor: "pointer", transition: "transform .15s, box-shadow .15s" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,.12)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
              onClick={() => setPlaying(v)}>
              {/* THUMBNAIL */}
              <div style={{ position: "relative", background: "#111", height: 168, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                {thumb
                  ? <img src={thumb} alt={v.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg,#1e1b4b,#4338ca)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: 52, opacity: .4 }}></span>
                    </div>
                }
                {/* PLAY BUTTON OVERLAY */}
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,.25)", transition: "background .15s" }}>
                  <div style={{ width: 52, height: 52, background: "rgba(255,255,255,.92)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(0,0,0,.3)" }}>
                    <span style={{ fontSize: 20, marginLeft: 4 }}>▶</span>
                  </div>
                </div>
              </div>
              {/* INFO */}
              <div style={{ padding: "12px 14px" }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text)", marginBottom: 4, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{v.title}</div>
                {v.description && <p style={{ fontSize: 12, color: "var(--sub)", margin: "0 0 8px", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{v.description}</p>}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {v.courseName && <span style={{ fontSize: 10, background: "var(--hover)", color: "var(--sub)", padding: "2px 8px", borderRadius: 99 }}>📚 {v.courseName}</span>}
                  </div>
                  {canPost && (
                    <div onClick={e => e.stopPropagation()}>
                      <Btn onClick={() => remove(v.id)} icon="trash" label="" small variant="danger" />
                    </div>
                  )}
                </div>
                <div style={{ fontSize: 11, color: "var(--sub)", marginTop: 6 }}> {v.teacherName || "Unknown"}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* UPLOAD MODAL */}
      <Modal open={modal} onClose={() => setModal(false)} title="Upload Video" size="md">
        <FormGrid>
          <Field label="Video Title" value={form.title} onChange={set("title")} required />
          <div>
            <label style={labelStyle}>Course (Required)</label>
            <select value={form.courseId} onChange={e => set("courseId")(e.target.value)} style={selectStyle}>
              <option value="">-- Select Course --</option>
              {myCourses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <Field label="Description" value={form.description} onChange={set("description")} placeholder="What is this video about?" />
          <Field label="Tags" value={form.tags} onChange={set("tags")} placeholder="e.g. intro, chapter1" />
        </FormGrid>

        {/* THUMBNAIL UPLOAD */}
        <div style={{ margin: "16px 0 4px" }}>
          <label style={labelStyle}>Thumbnail Image (optional)</label>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div onClick={() => thumbRef.current.click()} style={{ width: 100, height: 60, borderRadius: 8, border: "2px dashed var(--border)", overflow: "hidden", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--hover)", flexShrink: 0 }}>
              {thumbPreview
                ? <img src={thumbPreview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <span style={{ fontSize: 22 }}></span>
              }
            </div>
            <div>
              <Btn onClick={() => thumbRef.current.click()} label={thumbFile ? "Change" : "Upload Thumbnail"} small variant="ghost" />
              {thumbFile && <div style={{ fontSize: 11, color: "var(--sub)", marginTop: 4 }}>✅ {thumbFile.name}</div>}
              <div style={{ fontSize: 11, color: "var(--sub)", marginTop: 2 }}>JPG, PNG, WEBP · max 5MB</div>
            </div>
          </div>
          <input ref={thumbRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleThumb} />
        </div>

        {/* VIDEO SOURCE TOGGLE */}
        <div style={{ margin: "16px 0 12px" }}>
          <label style={labelStyle}>Video Source</label>
          <div style={{ display: "flex", gap: 8 }}>
            {["url", "file"].map(t => (
              <button key={t} onClick={() => setUploadType(t)}
                style={{ flex: 1, padding: "9px 0", borderRadius: 8, border: `1px solid ${uploadType === t ? "var(--text)" : "var(--border)"}`,
                  background: uploadType === t ? "var(--text)" : "var(--hover)",
                  color: uploadType === t ? "var(--card)" : "var(--text)", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                {t === "url" ? " YouTube / URL" : " Upload File"}
              </button>
            ))}
          </div>
        </div>

        {uploadType === "url" && (
          <Field label="Video URL (YouTube or direct link)" value={form.videoUrl} onChange={set("videoUrl")} placeholder="https://youtube.com/watch?v=…" />
        )}
        {uploadType === "file" && (
          <div>
            <label style={labelStyle}>Video File (MP4, MOV, AVI · max 2GB)</label>
            <input ref={videoRef} type="file" accept="video/*"
              onChange={e => setVideoFile(e.target.files[0])}
              style={{ ...selectStyle, padding: "6px 12px", cursor: "pointer" }} />
            {videoFile && <div style={{ fontSize: 11, color: "var(--sub)", marginTop: 4 }}>📎 {videoFile.name} ({(videoFile.size/1024/1024).toFixed(1)} MB)</div>}
          </div>
        )}

        <FormActions onCancel={() => setModal(false)} onSave={save} saveLabel={saving ? "Uploading…" : "Upload Video"} />
      </Modal>

      {/* PLAYER MODAL */}
      <Modal open={!!playing} onClose={() => setPlaying(null)} title={playing?.title || ""} size="lg">
        {playing && (
          <div>
            <VideoPlayer v={playing} />
            {playing.description && <p style={{ marginTop: 14, fontSize: 14, color: "var(--sub)", lineHeight: 1.7 }}>{playing.description}</p>}
            <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
              {playing.courseName && <span style={{ fontSize: 11, background: "var(--hover)", color: "var(--sub)", padding: "3px 10px", borderRadius: 99 }}>📚 {playing.courseName}</span>}
              {playing.teacherName && <span style={{ fontSize: 11, background: "var(--hover)", color: "var(--sub)", padding: "3px 10px", borderRadius: 99 }}>👤 {playing.teacherName}</span>}
              {playing.tags && playing.tags.split(",").map(t => <span key={t} style={{ fontSize: 11, background: "#e0e7ff", color: "#6366f1", padding: "3px 10px", borderRadius: 99 }}>{t.trim()}</span>)}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default VideosPage;