import React, { useState, useEffect, useRef } from "react";

// ─── Palette & helpers ────────────────────────────────────────────────────────
const COLORS = {
  bg: "#0a0c14",
  surface: "#111520",
  card: "#161b2e",
  border: "#1e2740",
  accent: "#5b8dee",
  accentSoft: "#3d64c4",
  gold: "#f0a500",
  green: "#2dd4a0",
  rose: "#f26b7a",
  text: "#e8eaf6",
  muted: "#6b7499",
  tag: "#1a2340",
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${COLORS.bg}; color: ${COLORS.text}; font-family: 'DM Sans', sans-serif; }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: ${COLORS.bg}; }
  ::-webkit-scrollbar-thumb { background: ${COLORS.border}; border-radius: 3px; }
  input, select, textarea { outline: none; font-family: inherit; }
  button { cursor: pointer; font-family: inherit; border: none; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
  @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
  @keyframes ping { 0% { transform: scale(1); opacity: 0.8; } 100% { transform: scale(2); opacity: 0; } }
  .fade-up { animation: fadeUp 0.45s cubic-bezier(.22,1,.36,1) both; }
  .fade-up-2 { animation: fadeUp 0.45s 0.08s cubic-bezier(.22,1,.36,1) both; }
  .fade-up-3 { animation: fadeUp 0.45s 0.16s cubic-bezier(.22,1,.36,1) both; }
  .fade-up-4 { animation: fadeUp 0.45s 0.24s cubic-bezier(.22,1,.36,1) both; }
`;

// ─── Seed Data ────────────────────────────────────────────────────────────────
const SEED_MENTORS = [
  {
    id: "m1", role: "mentor", name: "Dr. Aisha Rahman",
    expertise: ["Computer Science", "AI/ML", "Data Science"],
    availability: "Weekdays 6-9 PM", price: 45,
    rating: 4.9, reviews: 128,
    bio: "10+ years in AI research at MIT & Google. Passionate about nurturing the next generation of tech leaders.",
    avatar: "AR", color: "#5b8dee",
    docs: ["PhD_Certificate.pdf", "Google_Reference.pdf"],
  },
  {
    id: "m2", role: "mentor", name: "Prof. Carlos Mendez",
    expertise: ["Medicine", "Biology", "Chemistry"],
    availability: "Weekends 10 AM-2 PM", price: 60,
    rating: 4.8, reviews: 94,
    bio: "Cardiologist & professor. Helped 200+ students get into top medical schools.",
    avatar: "CM", color: "#2dd4a0",
    docs: ["Medical_License.pdf"],
  },
  {
    id: "m3", role: "mentor", name: "Sarah Kim",
    expertise: ["Law", "Political Science", "Public Speaking"],
    availability: "Tue & Thu evenings", price: 50,
    rating: 4.7, reviews: 67,
    bio: "Harvard Law grad, specializing in constitutional law. Mentor for aspiring lawyers and policy makers.",
    avatar: "SK", color: "#f0a500",
    docs: ["Bar_Certificate.pdf", "Harvard_Diploma.pdf"],
  },
  {
    id: "m4", role: "mentor", name: "James Okonkwo",
    expertise: ["Engineering", "Mathematics", "Physics"],
    availability: "Flexible schedule", price: 35,
    rating: 4.6, reviews: 52,
    bio: "Aerospace engineer at NASA. Love making complex physics tangible for curious minds.",
    avatar: "JO", color: "#f26b7a",
    docs: ["NASA_ID.pdf"],
  },
];

const EXPERTISES = [
  "Computer Science", "AI/ML", "Data Science", "Medicine", "Biology", "Chemistry",
  "Law", "Political Science", "Engineering", "Mathematics", "Physics", "Business",
  "Economics", "Psychology", "Architecture", "Education", "Arts", "Literature", "History"
];

const DEPARTMENTS = [
  "Computer Science", "Medicine", "Law", "Engineering", "Business", "Psychology",
  "Architecture", "Mathematics", "Economics", "Biology", "Chemistry", "Physics",
  "Education", "Arts", "Literature", "History", "Political Science"
];

// ─── Reusable UI ──────────────────────────────────────────────────────────────
const Btn = ({ children, onClick, variant = "primary", style = {}, disabled }) => {
  const base = {
    padding: "10px 22px", borderRadius: 10, fontWeight: 600, fontSize: 14,
    transition: "all .2s", display: "inline-flex", alignItems: "center", gap: 7,
  };
  const variants = {
    primary: { background: COLORS.accent, color: "#fff" },
    ghost: { background: "transparent", color: COLORS.accent, border: `1px solid ${COLORS.border}` },
    danger: { background: COLORS.rose, color: "#fff" },
    gold: { background: COLORS.gold, color: "#000" },
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{ ...base, ...variants[variant], opacity: disabled ? 0.5 : 1, ...style }}
      onMouseOver={e => { if (!disabled) e.currentTarget.style.filter = "brightness(1.15)"; }}
      onMouseOut={e => { e.currentTarget.style.filter = ""; }}
    >
      {children}
    </button>
  );
};

const Field = ({ label, children, style = {} }) => (
  <div style={{ marginBottom: 16, ...style }}>
    {label && <label style={{ display: "block", fontSize: 13, color: COLORS.muted, marginBottom: 6, fontWeight: 500 }}>{label}</label>}
    {children}
  </div>
);

const Input = ({ value, onChange, placeholder, type = "text", style = {} }) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    style={{
      width: "100%", background: COLORS.surface, border: `1px solid ${COLORS.border}`,
      borderRadius: 9, padding: "10px 14px", color: COLORS.text, fontSize: 14,
      transition: "border-color .2s", ...style,
    }}
    onFocus={e => e.target.style.borderColor = COLORS.accent}
    onBlur={e => e.target.style.borderColor = COLORS.border}
  />
);

const Select = ({ value, onChange, children, style = {} }) => (
  <select
    value={value}
    onChange={onChange}
    style={{
      width: "100%", background: COLORS.surface, border: `1px solid ${COLORS.border}`,
      borderRadius: 9, padding: "10px 14px", color: value ? COLORS.text : COLORS.muted,
      fontSize: 14, cursor: "pointer", ...style,
    }}
    onFocus={e => e.target.style.borderColor = COLORS.accent}
    onBlur={e => e.target.style.borderColor = COLORS.border}
  >
    {children}
  </select>
);

const Stars = ({ rating, size = 14 }) => (
  <span style={{ color: COLORS.gold, fontSize: size }}>
    {[1, 2, 3, 4, 5].map(i => <span key={i}>{i <= Math.round(rating) ? "★" : "☆"}</span>)}
  </span>
);

const Tag = ({ text, color }) => (
  <span style={{
    background: color ? color + "22" : COLORS.tag,
    color: color || COLORS.accent,
    border: `1px solid ${color ? color + "44" : COLORS.border}`,
    borderRadius: 6, padding: "3px 10px", fontSize: 12, fontWeight: 500,
  }}>
    {text}
  </span>
);

const Avatar = ({ initials, color, size = 44 }) => (
  <div style={{
    width: size, height: size, borderRadius: "50%",
    background: `linear-gradient(135deg, ${color}88, ${color})`,
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "#fff", fontWeight: 700, fontSize: size * 0.35,
    flexShrink: 0, border: `2px solid ${color}44`,
  }}>
    {initials}
  </div>
);

const Modal = ({ open, onClose, children, title }) => {
  if (!open) return null;
  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "#000a", zIndex: 1000,
        display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 18,
          padding: 28, width: "100%", maxWidth: 540, maxHeight: "90vh", overflowY: "auto",
          animation: "fadeUp .3s cubic-bezier(.22,1,.36,1)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <h2 style={{ fontFamily: "'Playfair Display'", fontSize: 22 }}>{title}</h2>
          <button onClick={onClose} style={{ background: "none", color: COLORS.muted, fontSize: 22 }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
};

// ─── Mentor Card ──────────────────────────────────────────────────────────────
const MentorCard = ({ mentor, onView, matchScore }) => (
  <div
    className="fade-up"
    onClick={() => onView(mentor)}
    style={{
      background: COLORS.card, border: `1px solid ${COLORS.border}`,
      borderRadius: 16, padding: 22, cursor: "pointer", transition: "all .25s",
      position: "relative", overflow: "hidden",
    }}
    onMouseOver={e => { e.currentTarget.style.borderColor = mentor.color; e.currentTarget.style.transform = "translateY(-3px)"; }}
    onMouseOut={e => { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.transform = ""; }}
  >
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: mentor.color, opacity: 0.7 }} />
    {matchScore && (
      <div style={{
        position: "absolute", top: 14, right: 14, background: COLORS.green + "22",
        color: COLORS.green, border: `1px solid ${COLORS.green}44`, borderRadius: 20,
        padding: "2px 10px", fontSize: 11, fontWeight: 600,
      }}>
        ✦ {matchScore}% match
      </div>
    )}
    <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 14 }}>
      <Avatar initials={mentor.avatar} color={mentor.color} size={52} />
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 3 }}>{mentor.name}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Stars rating={mentor.rating} />
          <span style={{ color: COLORS.muted, fontSize: 12 }}>{mentor.rating} ({mentor.reviews} reviews)</span>
        </div>
      </div>
    </div>
    <p style={{ color: COLORS.muted, fontSize: 13, lineHeight: 1.6, marginBottom: 14 }}>
      {mentor.bio.slice(0, 90)}…
    </p>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
      {mentor.expertise.slice(0, 3).map(e => <Tag key={e} text={e} color={mentor.color} />)}
    </div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ color: COLORS.gold, fontWeight: 700, fontSize: 15 }}>${mentor.price}/hr</span>
      <span style={{ color: COLORS.muted, fontSize: 12 }}>📅 {mentor.availability}</span>
    </div>
  </div>
);

// ─── Register Flow ─────────────────────────────────────────────────────────────
function RegisterForm({ onRegister, onBack }) {
  const [role, setRole] = useState("");
  // Student fields
  const [name, setName] = useState("");
  const [school, setSchool] = useState("");
  const [level, setLevel] = useState("");
  const [grade, setGrade] = useState("");
  const [dept, setDept] = useState("");
  const [uniYear, setUniYear] = useState("");
  const [goalUni, setGoalUni] = useState("");
  const [goalDept, setGoalDept] = useState("");
  const [currentUni, setCurrentUni] = useState("");
  // Mentor fields
  const [mName, setMName] = useState("");
  const [expertise, setExpertise] = useState([]);
  const [availability, setAvailability] = useState("");
  const [price, setPrice] = useState("");
  const [mBio, setMBio] = useState("");
  const [docs, setDocs] = useState([]);

  const toggleExpertise = (e) => setExpertise(prev => prev.includes(e) ? prev.filter(x => x !== e) : [...prev, e]);

  const submit = () => {
    if (role === "student") {
      onRegister({
        id: "u" + Date.now(), role: "student", name, school, level, grade,
        dept, uniYear, goalUni, goalDept, currentUni,
        avatar: name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase(),
        color: COLORS.accent,
      });
    } else {
      onRegister({
        id: "u" + Date.now(), role: "mentor", name: mName, expertise,
        availability, price: Number(price), bio: mBio, docs,
        rating: 5.0, reviews: 0,
        avatar: mName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase(),
        color: "#" + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0"),
      });
    }
  };

  if (!role) {
    return (
      <div style={{ maxWidth: 480, margin: "60px auto", padding: 32 }}>
        <div className="fade-up" style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontFamily: "'Playfair Display'", fontSize: 36, marginBottom: 8 }}>Join MentorPath</div>
          <p style={{ color: COLORS.muted }}>Connect, grow, and achieve your goals</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {[
            { r: "student", icon: "🎓", title: "I'm a Student", sub: "Find expert mentors" },
            { r: "mentor", icon: "🏆", title: "I'm a Mentor", sub: "Share your expertise" },
          ].map(({ r, icon, title, sub }) => (
            <div
              key={r}
              className="fade-up-2"
              onClick={() => setRole(r)}
              style={{
                background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16,
                padding: 28, textAlign: "center", cursor: "pointer", transition: "all .25s",
              }}
              onMouseOver={e => { e.currentTarget.style.borderColor = COLORS.accent; e.currentTarget.style.transform = "scale(1.03)"; }}
              onMouseOut={e => { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.transform = ""; }}
            >
              <div style={{ fontSize: 40, marginBottom: 10 }}>{icon}</div>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{title}</div>
              <div style={{ color: COLORS.muted, fontSize: 13 }}>{sub}</div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 24 }}>
          <button onClick={onBack} style={{ background: "none", color: COLORS.muted, fontSize: 14 }}>← Back to Home</button>
        </div>
      </div>
    );
  }

  if (role === "student") {
    return (
      <div style={{ maxWidth: 520, margin: "40px auto", padding: 24 }}>
        <div className="fade-up" style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 18, padding: 32 }}>
          <h2 style={{ fontFamily: "'Playfair Display'", fontSize: 26, marginBottom: 6 }}>Student Registration</h2>
          <p style={{ color: COLORS.muted, marginBottom: 24, fontSize: 14 }}>Tell us about yourself so we can find your perfect mentor</p>

          <Field label="Full Name"><Input value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" /></Field>
          <Field label="Education Level">
            <Select value={level} onChange={e => { setLevel(e.target.value); setGrade(""); }}>
              <option value="">Select level…</option>
              <option value="elementary">Elementary (Grades 1–8)</option>
              <option value="highschool">High School (Grades 9–12)</option>
              <option value="university">University</option>
            </Select>
          </Field>

          {level === "elementary" && (
            <>
              <Field label="School Name"><Input value={school} onChange={e => setSchool(e.target.value)} placeholder="Your school name" /></Field>
              <Field label="Grade">
                <Select value={grade} onChange={e => setGrade(e.target.value)}>
                  <option value="">Select grade…</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(g => <option key={g} value={g}>Grade {g}</option>)}
                </Select>
              </Field>
              <Field label="Goal Department / Field">
                <Select value={goalDept} onChange={e => setGoalDept(e.target.value)}>
                  <option value="">Select field of interest…</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </Select>
              </Field>
            </>
          )}

          {level === "highschool" && (
            <>
              <Field label="High School Name"><Input value={school} onChange={e => setSchool(e.target.value)} placeholder="Your high school name" /></Field>
              <Field label="Grade">
                <Select value={grade} onChange={e => setGrade(e.target.value)}>
                  <option value="">Select grade…</option>
                  {[9, 10, 11, 12].map(g => <option key={g} value={g}>Grade {g}</option>)}
                </Select>
              </Field>
              <Field label="Goal University">
                <Input value={goalUni} onChange={e => setGoalUni(e.target.value)} placeholder="e.g. MIT, Harvard, Stanford…" />
              </Field>
              <Field label="Goal Department / Major">
                <Select value={goalDept} onChange={e => setGoalDept(e.target.value)}>
                  <option value="">Select department…</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </Select>
              </Field>
            </>
          )}

          {level === "university" && (
            <>
              <Field label="University Name"><Input value={currentUni} onChange={e => setCurrentUni(e.target.value)} placeholder="Your university name" /></Field>
              <Field label="Department / Major">
                <Select value={dept} onChange={e => setDept(e.target.value)}>
                  <option value="">Select your department…</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </Select>
              </Field>
              <Field label="Year">
                <Select value={uniYear} onChange={e => setUniYear(e.target.value)}>
                  <option value="">Select year…</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(y => <option key={y} value={y}>Year {y}</option>)}
                </Select>
              </Field>
            </>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <Btn variant="ghost" onClick={() => setRole("")}>← Back</Btn>
            <Btn onClick={submit} disabled={!name || !level} style={{ flex: 1 }}>Create Account 🎓</Btn>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 520, margin: "40px auto", padding: 24 }}>
      <div className="fade-up" style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 18, padding: 32 }}>
        <h2 style={{ fontFamily: "'Playfair Display'", fontSize: 26, marginBottom: 6 }}>Mentor Registration</h2>
        <p style={{ color: COLORS.muted, marginBottom: 24, fontSize: 14 }}>Share your expertise and inspire the next generation</p>

        <Field label="Full Name"><Input value={mName} onChange={e => setMName(e.target.value)} placeholder="Your full name" /></Field>
        <Field label="Bio / About You">
          <textarea
            value={mBio}
            onChange={e => setMBio(e.target.value)}
            placeholder="Tell students about your background and experience…"
            style={{
              width: "100%", minHeight: 90, background: COLORS.surface, border: `1px solid ${COLORS.border}`,
              borderRadius: 9, padding: "10px 14px", color: COLORS.text, fontSize: 14,
              resize: "vertical", fontFamily: "inherit",
            }}
          />
        </Field>
        <Field label="Expertise Areas (select all that apply)">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {EXPERTISES.map(e => (
              <span
                key={e}
                onClick={() => toggleExpertise(e)}
                style={{
                  padding: "5px 12px", borderRadius: 20, fontSize: 13, cursor: "pointer",
                  border: `1px solid ${expertise.includes(e) ? COLORS.accent : COLORS.border}`,
                  background: expertise.includes(e) ? COLORS.accent + "22" : COLORS.tag,
                  color: expertise.includes(e) ? COLORS.accent : COLORS.muted,
                  transition: "all .15s",
                }}
              >
                {e}
              </span>
            ))}
          </div>
        </Field>
        <Field label="Availability"><Input value={availability} onChange={e => setAvailability(e.target.value)} placeholder="e.g. Weekdays 6–9 PM, Flexible…" /></Field>
        <Field label="Hourly Price (USD)"><Input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="e.g. 50" /></Field>
        <Field label="Upload Credentials / Documents">
          <label style={{
            display: "block", background: COLORS.surface, border: `2px dashed ${COLORS.border}`,
            borderRadius: 10, padding: "18px", textAlign: "center", cursor: "pointer",
            color: COLORS.muted, fontSize: 13,
          }}>
            <input
              type="file"
              multiple
              style={{ display: "none" }}
              onChange={e => setDocs(Array.from(e.target.files).map(f => f.name))}
            />
            📎 Click to upload certificates, diplomas, references…
            <br /><span style={{ fontSize: 11 }}>Documents are verified by admins and not shown to students</span>
          </label>
          {docs.length > 0 && (
            <div style={{ marginTop: 8 }}>
              {docs.map(d => <div key={d} style={{ color: COLORS.green, fontSize: 12, marginTop: 3 }}>✓ {d}</div>)}
            </div>
          )}
        </Field>

        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          <Btn variant="ghost" onClick={() => setRole("")}>← Back</Btn>
          <Btn onClick={submit} disabled={!mName || expertise.length === 0} style={{ flex: 1 }}>Join as Mentor 🏆</Btn>
        </div>
      </div>
    </div>
  );
}

// ─── Chat / Contact Modal ─────────────────────────────────────────────────────
function ContactModal({ open, onClose, mentor, user }) {
  const [msgs, setMsgs] = useState([
    { from: "mentor", text: `Hi! I'm ${mentor?.name}. How can I help you reach your goals?`, time: "Now" }
  ]);
  const [input, setInput] = useState("");
  const [tab, setTab] = useState("chat");
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  const send = () => {
    if (!input.trim()) return;
    setMsgs(prev => [...prev, { from: "student", text: input, time: "Now" }]);
    setInput("");
    setTimeout(() => {
      setMsgs(prev => [...prev, {
        from: "mentor",
        text: "Great question! Let's schedule a session and work through this together.",
        time: "Now"
      }]);
    }, 1200);
  };

  if (!open || !mentor) return null;

  return (
    <div style={{
      position: "fixed", inset: 0, background: "#000b", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16
    }}>
      <div style={{
        background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 18,
        width: "100%", maxWidth: 560, height: "82vh", display: "flex", flexDirection: "column",
        animation: "fadeUp .3s cubic-bezier(.22,1,.36,1)",
      }}>
        {/* Header */}
        <div style={{ padding: "18px 22px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", gap: 14 }}>
          <Avatar initials={mentor.avatar} color={mentor.color} size={42} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700 }}>{mentor.name}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: COLORS.green }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: COLORS.green, display: "inline-block" }} />
              Online now
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", color: COLORS.muted, fontSize: 20 }}>✕</button>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: `1px solid ${COLORS.border}`, padding: "0 22px" }}>
          {[["chat", "💬 Chat"], ["materials", "📚 Materials"], ["video", "🎥 Video Call"]].map(([t, label]) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                background: "none", color: tab === t ? COLORS.accent : COLORS.muted,
                borderBottom: tab === t ? `2px solid ${COLORS.accent}` : "2px solid transparent",
                padding: "12px 16px", fontSize: 13, fontWeight: 600, transition: "all .15s",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "chat" && (
          <>
            <div style={{ flex: 1, overflowY: "auto", padding: "18px 22px", display: "flex", flexDirection: "column", gap: 12 }}>
              {msgs.map((m, i) => (
                <div key={i} style={{ display: "flex", justifyContent: m.from === "student" ? "flex-end" : "flex-start" }}>
                  <div style={{
                    maxWidth: "72%", padding: "10px 15px", borderRadius: 14,
                    background: m.from === "student" ? COLORS.accent : COLORS.surface,
                    color: COLORS.text, fontSize: 14, lineHeight: 1.5,
                    borderTopRightRadius: m.from === "student" ? 4 : 14,
                    borderTopLeftRadius: m.from === "mentor" ? 4 : 14,
                  }}>
                    {m.text}
                  </div>
                </div>
              ))}
              <div ref={endRef} />
            </div>
            <div style={{ padding: "14px 22px", borderTop: `1px solid ${COLORS.border}`, display: "flex", gap: 10 }}>
              <Input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Type a message…"
                style={{ flex: 1 }}
                onKeyDown={e => e.key === "Enter" && send()}
              />
              <Btn onClick={send}>Send</Btn>
            </div>
          </>
        )}

        {tab === "materials" && (
          <div style={{ flex: 1, padding: 22, overflowY: "auto" }}>
            <div style={{ color: COLORS.muted, fontSize: 14, marginBottom: 16 }}>Share study materials with your mentor</div>
            <label style={{
              display: "block", background: COLORS.surface, border: `2px dashed ${COLORS.border}`,
              borderRadius: 12, padding: 24, textAlign: "center", cursor: "pointer", color: COLORS.muted,
            }}>
              <input type="file" multiple style={{ display: "none" }} />
              <div style={{ fontSize: 32, marginBottom: 8 }}>📁</div>
              Drop files or click to upload<br />
              <span style={{ fontSize: 12 }}>PDFs, images, documents, notes…</span>
            </label>
            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: 13, color: COLORS.muted, marginBottom: 10 }}>Shared materials</div>
              {["Chapter_5_Notes.pdf", "Practice_Problems.pdf", "Essay_Draft.docx"].map(f => (
                <div key={f} style={{
                  background: COLORS.surface, border: `1px solid ${COLORS.border}`,
                  borderRadius: 10, padding: "12px 16px", display: "flex",
                  alignItems: "center", gap: 12, marginBottom: 8,
                }}>
                  <span>📄</span>
                  <span style={{ flex: 1, fontSize: 13 }}>{f}</span>
                  <Btn variant="ghost" style={{ padding: "5px 12px", fontSize: 12 }}>Open</Btn>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "video" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, gap: 16 }}>
            <div style={{ fontSize: 64 }}>🎥</div>
            <div style={{ fontWeight: 700, fontSize: 18 }}>Video Session</div>
            <p style={{ color: COLORS.muted, textAlign: "center", fontSize: 14, maxWidth: 320 }}>
              Start a live video call with {mentor.name} for real-time tutoring and guidance.
            </p>
            <Btn style={{ fontSize: 15, padding: "12px 28px" }}>📹 Start Video Call</Btn>
            <div style={{ color: COLORS.muted, fontSize: 12 }}>or schedule for later</div>
            <Btn variant="ghost" style={{ fontSize: 13 }}>📅 Schedule a Session</Btn>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Review Modal ─────────────────────────────────────────────────────────────
function ReviewModal({ open, onClose, mentor, onSubmit }) {
  const [stars, setStars] = useState(5);
  const [text, setText] = useState("");

  return (
    <Modal open={open} onClose={onClose} title={`Rate ${mentor?.name}`}>
      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        {[1, 2, 3, 4, 5].map(s => (
          <span
            key={s}
            onClick={() => setStars(s)}
            style={{
              fontSize: 30, cursor: "pointer",
              color: s <= stars ? COLORS.gold : COLORS.border,
              transition: "color .15s",
            }}
          >
            ★
          </span>
        ))}
      </div>
      <Field label="Your Review">
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Share your experience with this mentor…"
          style={{
            width: "100%", minHeight: 110, background: COLORS.surface,
            border: `1px solid ${COLORS.border}`, borderRadius: 9,
            padding: "10px 14px", color: COLORS.text, fontSize: 14,
            fontFamily: "inherit", resize: "vertical",
          }}
        />
      </Field>
      <Btn onClick={() => { onSubmit({ stars, text }); onClose(); }} disabled={!text}>
        Submit Review ✦
      </Btn>
    </Modal>
  );
}

// ─── Mentor Detail ────────────────────────────────────────────────────────────
function MentorDetail({ mentor, user, onBack, onContact, allReviews }) {
  const [showReview, setShowReview] = useState(false);
  const [reviews, setReviews] = useState(allReviews[mentor?.id] || [
    { name: "Alex T.", stars: 5, text: "Absolutely brilliant. Got me into my dream university!", date: "May 2026" },
    { name: "Priya K.", stars: 5, text: "Clear explanations, patient, and very encouraging.", date: "Apr 2026" },
  ]);

  if (!mentor) return null;

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "28px 20px" }}>
      <button onClick={onBack} style={{ background: "none", color: COLORS.muted, fontSize: 14, marginBottom: 20 }}>← Back</button>

      <div className="fade-up" style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 18, padding: 28, marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 18, alignItems: "flex-start", marginBottom: 20 }}>
          <Avatar initials={mentor.avatar} color={mentor.color} size={72} />
          <div>
            <h1 style={{ fontFamily: "'Playfair Display'", fontSize: 28, marginBottom: 4 }}>{mentor.name}</h1>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <Stars rating={mentor.rating} size={16} />
              <span style={{ color: COLORS.muted }}>{mentor.rating} · {mentor.reviews} reviews</span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {mentor.expertise.map(e => <Tag key={e} text={e} color={mentor.color} />)}
            </div>
          </div>
        </div>
        <p style={{ color: COLORS.muted, lineHeight: 1.7, marginBottom: 20 }}>{mentor.bio}</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 22 }}>
          {[
            ["💰 Rate", `$${mentor.price}/hour`],
            ["📅 Availability", mentor.availability],
            ["🏆 Sessions", `${mentor.reviews * 3}+ completed`],
            ["✅ Verified", "Credentials checked"],
          ].map(([k, v]) => (
            <div key={k} style={{ background: COLORS.surface, borderRadius: 10, padding: "12px 16px" }}>
              <div style={{ fontSize: 12, color: COLORS.muted, marginBottom: 3 }}>{k}</div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Btn onClick={() => onContact(mentor)} style={{ flex: 1 }}>💬 Contact & Book</Btn>
          {user?.role === "student" && <Btn variant="ghost" onClick={() => setShowReview(true)}>⭐ Review</Btn>}
        </div>
      </div>

      {/* Reviews */}
      <div className="fade-up-2">
        <h3 style={{ fontFamily: "'Playfair Display'", fontSize: 20, marginBottom: 16 }}>Student Reviews</h3>
        {reviews.map((r, i) => (
          <div key={i} style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 18, marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ fontWeight: 600 }}>{r.name}</div>
              <span style={{ color: COLORS.muted, fontSize: 12 }}>{r.date}</span>
            </div>
            <Stars rating={r.stars} />
            <p style={{ color: COLORS.muted, marginTop: 8, fontSize: 14, lineHeight: 1.6 }}>{r.text}</p>
          </div>
        ))}
      </div>

      <ReviewModal
        open={showReview}
        onClose={() => setShowReview(false)}
        mentor={mentor}
        onSubmit={(r) => setReviews(prev => [{ name: user?.name || "You", ...r, date: "Jun 2026" }, ...prev])}
      />
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function Dashboard({ user, mentors, onContact, onViewMentor }) {
  const [search, setSearch] = useState("");
  const [filterExp, setFilterExp] = useState("");

  const getMatchScore = (mentor) => {
    if (!user || user.role !== "student") return null;
    const target = (user.goalDept || user.dept || "").toLowerCase();
    if (!target) return null;
    const match = mentor.expertise.some(e => e.toLowerCase().includes(target) || target.includes(e.toLowerCase()));
    return match ? Math.floor(85 + Math.random() * 14) : Math.floor(40 + Math.random() * 30);
  };

  const filtered = mentors
    .filter(m => {
      const q = search.toLowerCase();
      return (!q || m.name.toLowerCase().includes(q) || m.expertise.some(e => e.toLowerCase().includes(q))) &&
        (!filterExp || m.expertise.includes(filterExp));
    })
    .sort((a, b) => b.rating - a.rating);

  const recommended = user?.role === "student"
    ? [...filtered].sort((a, b) => (getMatchScore(b) || 0) - (getMatchScore(a) || 0)).slice(0, 3)
    : [];

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 20px" }}>
      {/* Hero */}
      <div className="fade-up" style={{ marginBottom: 32, textAlign: "center" }}>
        <h1 style={{ fontFamily: "'Playfair Display'", fontSize: 40, lineHeight: 1.2, marginBottom: 10 }}>
          {user ? `Welcome back, ${user.name.split(" ")[0]} 👋` : "Find Your Perfect Mentor"}
        </h1>
        <p style={{ color: COLORS.muted, fontSize: 16 }}>
          {user?.role === "student"
            ? `Let's find the right guidance for your ${user.goalDept || user.dept || "journey"}.`
            : "Explore top-rated mentors across every discipline."}
        </p>
      </div>

      {/* Search */}
      <div className="fade-up-2" style={{ display: "flex", gap: 12, marginBottom: 28 }}>
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search by name or subject…" style={{ flex: 1 }} />
        <Select value={filterExp} onChange={e => setFilterExp(e.target.value)} style={{ width: 200 }}>
          <option value="">All subjects</option>
          {EXPERTISES.map(e => <option key={e} value={e}>{e}</option>)}
        </Select>
      </div>

      {/* Recommended */}
      {recommended.length > 0 && (
        <>
          <div className="fade-up-3" style={{ marginBottom: 12 }}>
            <h2 style={{ fontFamily: "'Playfair Display'", fontSize: 22, display: "flex", alignItems: "center", gap: 8 }}>
              ✦ Recommended for You
              <span style={{
                background: COLORS.accent + "22", color: COLORS.accent, fontSize: 12,
                fontWeight: 600, padding: "2px 10px", borderRadius: 20,
                border: `1px solid ${COLORS.accent}44`
              }}>
                Based on your profile
              </span>
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 18, marginBottom: 36 }}>
            {recommended.map(m => <MentorCard key={m.id} mentor={m} onView={onViewMentor} matchScore={getMatchScore(m)} />)}
          </div>
        </>
      )}

      {/* All */}
      <div className="fade-up-3" style={{ marginBottom: 14 }}>
        <h2 style={{ fontFamily: "'Playfair Display'", fontSize: 22 }}>⭐ Top-Rated Mentors</h2>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 18 }}>
        {filtered.map(m => <MentorCard key={m.id} mentor={m} onView={onViewMentor} />)}
        {filtered.length === 0 && (
          <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 60, color: COLORS.muted }}>
            No mentors match your search yet.
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Mentor Dashboard ─────────────────────────────────────────────────────────
function MentorDashboard({ user }) {
  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "28px 20px" }}>
      <div className="fade-up" style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Playfair Display'", fontSize: 34 }}>Your Mentor Hub</h1>
        <p style={{ color: COLORS.muted, marginTop: 6 }}>Manage your sessions, materials and availability</p>
      </div>

      <div className="fade-up-2" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 28 }}>
        {[["Students", user.reviews || 0, "👥"], ["Sessions", (user.reviews || 0) * 3, "📚"], ["Rating", user.rating?.toFixed(1) || "5.0", "⭐"]].map(([label, val, icon]) => (
          <div key={label} style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 20, textAlign: "center" }}>
            <div style={{ fontSize: 28 }}>{icon}</div>
            <div style={{ fontFamily: "'Playfair Display'", fontSize: 28, fontWeight: 700, color: COLORS.accent }}>{val}</div>
            <div style={{ color: COLORS.muted, fontSize: 13 }}>{label}</div>
          </div>
        ))}
      </div>

      <div className="fade-up-3" style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 22, marginBottom: 20 }}>
        <h3 style={{ marginBottom: 14, fontWeight: 700 }}>📎 Your Credentials (Private)</h3>
        {(user.docs || []).map(d => (
          <div key={d} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: COLORS.surface, borderRadius: 10, marginBottom: 8 }}>
            <span>📄</span><span style={{ flex: 1, fontSize: 13 }}>{d}</span>
            <Tag text="Verified" color={COLORS.green} />
          </div>
        ))}
        {(!user.docs || user.docs.length === 0) && <p style={{ color: COLORS.muted, fontSize: 14 }}>No documents uploaded yet.</p>}
        <label style={{ display: "block", marginTop: 14, background: COLORS.surface, border: `2px dashed ${COLORS.border}`, borderRadius: 10, padding: 14, textAlign: "center", cursor: "pointer", color: COLORS.muted, fontSize: 13 }}>
          <input type="file" style={{ display: "none" }} />+ Upload More Documents
        </label>
      </div>

      <div className="fade-up-4" style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 22 }}>
        <h3 style={{ marginBottom: 14, fontWeight: 700 }}>🎯 Your Expertise</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {user.expertise?.map(e => <Tag key={e} text={e} color={COLORS.accent} />)}
        </div>
        <div style={{ marginTop: 16, color: COLORS.muted, fontSize: 13 }}>📅 Availability: {user.availability}</div>
        <div style={{ color: COLORS.muted, fontSize: 13, marginTop: 6 }}>💰 Rate: ${user.price}/hour</div>
      </div>
    </div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar({ user, page, setPage, onLogout }) {
  return (
    <nav style={{
      background: COLORS.surface + "ee", borderBottom: `1px solid ${COLORS.border}`,
      padding: "0 24px", display: "flex", alignItems: "center", height: 60,
      position: "sticky", top: 0, zIndex: 100, backdropFilter: "blur(12px)",
    }}>
      <div onClick={() => setPage("home")} style={{ fontFamily: "'Playfair Display'", fontSize: 22, cursor: "pointer", flex: 1 }}>
        Mentor<span style={{ color: COLORS.accent }}>Path</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {user ? (
          <>
            {user.role === "mentor" && (
              <button onClick={() => setPage("mentor-hub")} style={{
                background: "none", color: page === "mentor-hub" ? COLORS.accent : COLORS.muted,
                fontWeight: 600, fontSize: 14,
              }}>
                My Hub
              </button>
            )}
            <button onClick={() => setPage("profile")} style={{
              background: "none", color: page === "profile" ? COLORS.accent : COLORS.muted,
              fontWeight: 600, fontSize: 14,
            }}>
              Profile
            </button>
            <Avatar initials={user.avatar} color={user.color} size={34} />
            <span style={{ fontSize: 14, fontWeight: 600 }}>{user.name.split(" ")[0]}</span>
            <Btn variant="ghost" onClick={onLogout} style={{ padding: "6px 14px", fontSize: 13 }}>Sign Out</Btn>
          </>
        ) : (
          <>
            <Btn variant="ghost" onClick={() => setPage("login")} style={{ padding: "7px 18px" }}>Sign In</Btn>
            <Btn onClick={() => setPage("register")} style={{ padding: "7px 18px" }}>Join Free</Btn>
          </>
        )}
      </div>
    </nav>
  );
}

// ─── Login ────────────────────────────────────────────────────────────────────
function Login({ onLogin, onBack }) {
  const demo = [
    { name: "Demo Student", role: "student", level: "highschool", goalDept: "Computer Science", goalUni: "MIT", school: "Lincoln HS", grade: "11", avatar: "DS", color: COLORS.accent },
    ...SEED_MENTORS.slice(0, 2),
  ];

  return (
    <div style={{ maxWidth: 420, margin: "80px auto", padding: 24 }}>
      <div className="fade-up" style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 18, padding: 32 }}>
        <h2 style={{ fontFamily: "'Playfair Display'", fontSize: 26, marginBottom: 6 }}>Sign In</h2>
        <p style={{ color: COLORS.muted, marginBottom: 24, fontSize: 14 }}>Quick demo — pick an account:</p>
        {demo.map(u => (
          <div
            key={u.id || u.name}
            onClick={() => onLogin(u)}
            style={{
              display: "flex", alignItems: "center", gap: 14, padding: "14px 18px",
              background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12,
              cursor: "pointer", marginBottom: 10, transition: "all .2s",
            }}
            onMouseOver={e => e.currentTarget.style.borderColor = COLORS.accent}
            onMouseOut={e => e.currentTarget.style.borderColor = COLORS.border}
          >
            <Avatar initials={u.avatar} color={u.color} size={40} />
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{u.name}</div>
              <div style={{ color: COLORS.muted, fontSize: 12 }}>
                {u.role === "mentor" ? `Mentor · ${u.expertise?.[0]}` : `Student · ${u.level}`}
              </div>
            </div>
          </div>
        ))}
        <div style={{ marginTop: 16, textAlign: "center" }}>
          <button onClick={onBack} style={{ background: "none", color: COLORS.muted, fontSize: 13 }}>← Back</button>
        </div>
      </div>
    </div>
  );
}

// ─── App Root ─────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");
  const [user, setUser] = useState(null);
  const [mentors, setMentors] = useState(SEED_MENTORS);
  const [viewMentor, setViewMentor] = useState(null);
  const [contactMentor, setContactMentor] = useState(null);
  const [reviews, setReviews] = useState({});
  const [activeProfile, setActiveProfile] = useState(null);

  const handleUpdateProfile = (updatedUser) => {
    setUser(updatedUser);
    if (updatedUser.role === "mentor") {
      setMentors(prev => prev.map(m => m.id === updatedUser.id ? updatedUser : m));
    }
  };

  const handleRegister = (newUser) => {
    if (newUser.role === "mentor") setMentors(prev => [...prev, newUser]);
    setUser(newUser);
    setPage("home");
  };

  const handleViewMentor = (m) => {
    setViewMentor(m);
    setPage("mentor-detail");
  };

  const handleContact = (m) => {
    setContactMentor(m);
  };

  return (
    <>
      <style>{css}</style>
      <div style={{ minHeight: "100vh", background: COLORS.bg }}>
        <Navbar
          user={user}
          page={page}
          setPage={(p) => {
            setViewMentor(null);
            setPage(p);
          }}
          onLogout={() => {
            setUser(null);
            setPage("home");
          }}
        />
        <div style={{ paddingBottom: 60 }}>
          {page === "home" && (
            <Dashboard
              user={user}
              mentors={mentors}
              onContact={handleContact}
              onViewMentor={handleViewMentor}
            />
          )}
          {page === "register" && (
            <RegisterForm onRegister={handleRegister} onBack={() => setPage("home")} />
          )}
          {page === "login" && (
            <Login onLogin={(u) => { setUser(u); setPage("home"); }} onBack={() => setPage("home")} />
          )}
          {page === "mentor-detail" && viewMentor && (
            <MentorDetail
              mentor={viewMentor}
              user={user}
              onBack={() => setPage("home")}
              onContact={handleContact}
              allReviews={reviews}
            />
          )}
          {page === "mentor-hub" && user?.role === "mentor" && (
            <MentorDashboard user={user} />
          )}
          {page === "profile" && user && (
            user.role === "student" ? (
              <StudentProfile user={user} onUpdate={handleUpdateProfile} />
            ) : (
              <MentorProfile user={user} onUpdate={handleUpdateProfile} />
            )
          )}
        </div>
        <ContactModal
          open={!!contactMentor}
          mentor={contactMentor}
          user={user}
          onClose={() => setContactMentor(null)}
        />
      </div>
    </>
  );
}
// ─── Student Profile Page ─────────────────────────────────────────────────────
function StudentProfile({ user, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(user);

  const handleSave = () => {
    onUpdate(editedUser);
    setIsEditing(false);
  };

  const stats = {
    sessionsCompleted: Math.floor(Math.random() * 50) + 10,
    hoursLearned: Math.floor(Math.random() * 200) + 50,
    coursesEnrolled: user.goalDept ? 3 : 1,
    upcomingSessions: Math.floor(Math.random() * 5) + 1,
  };

  if (!user) return null;

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 20px" }}>
      {/* Cover Image */}
      <div style={{
        height: "200px",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        borderRadius: "20px",
        marginBottom: "-60px",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute",
          bottom: "20px",
          right: "20px",
          background: "rgba(255,255,255,0.2)",
          padding: "8px 16px",
          borderRadius: "20px",
          fontSize: "12px",
        }}>
          Student since {new Date().getFullYear()}
        </div>
      </div>

      {/* Profile Content */}
      <div style={{
        background: COLORS.card,
        borderRadius: "20px",
        padding: "30px",
        border: `1px solid ${COLORS.border}`,
      }}>
        {/* Header with Avatar */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: "20px", marginBottom: "30px", flexWrap: "wrap" }}>
          <div style={{ marginTop: "-70px" }}>
            <Avatar initials={user.avatar} color={user.color} size={100} />
            {isEditing && (
              <button
                onClick={() => document.getElementById('avatar-input').click()}
                style={{
                  background: COLORS.accent,
                  padding: "5px 10px",
                  borderRadius: "20px",
                  fontSize: "11px",
                  marginTop: "10px",
                  width: "100%",
                }}
              >
                Change Photo
              </button>
            )}
            <input id="avatar-input" type="file" style={{ display: "none" }} />
          </div>

          <div style={{ flex: 1 }}>
            {!isEditing ? (
              <>
                <h1 style={{ fontSize: "32px", marginBottom: "8px", fontFamily: "'Playfair Display'" }}>
                  {user.name}
                </h1>
                <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                  <span style={{ color: COLORS.muted }}>🎓 {user.level || "Student"}</span>
                  {user.goalDept && <span style={{ color: COLORS.accent }}>📚 Goal: {user.goalDept}</span>}
                  {user.goalUni && <span style={{ color: COLORS.gold }}>🎯 Target: {user.goalUni}</span>}
                </div>
              </>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <Input
                  value={editedUser.name}
                  onChange={e => setEditedUser({ ...editedUser, name: e.target.value })}
                  placeholder="Full Name"
                />
                <Select
                  value={editedUser.level}
                  onChange={e => setEditedUser({ ...editedUser, level: e.target.value })}
                >
                  <option value="highschool">High School Student</option>
                  <option value="university">University Student</option>
                  <option value="graduate">Graduate Student</option>
                </Select>
                <Input
                  value={editedUser.goalDept}
                  onChange={e => setEditedUser({ ...editedUser, goalDept: e.target.value })}
                  placeholder="Goal Department"
                />
              </div>
            )}
          </div>

          <div>
            {!isEditing ? (
              <Btn onClick={() => setIsEditing(true)} variant="ghost">
                ✏️ Edit Profile
              </Btn>
            ) : (
              <div style={{ display: "flex", gap: "10px" }}>
                <Btn onClick={() => setIsEditing(false)} variant="ghost">Cancel</Btn>
                <Btn onClick={handleSave}>Save Changes</Btn>
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
          marginBottom: "30px",
        }}>
          {[
            { label: "Sessions Completed", value: stats.sessionsCompleted, icon: "📚" },
            { label: "Hours Learned", value: stats.hoursLearned, icon: "⏱️" },
            { label: "Courses Enrolled", value: stats.coursesEnrolled, icon: "📖" },
            { label: "Upcoming Sessions", value: stats.upcomingSessions, icon: "📅" },
          ].map(stat => (
            <div key={stat.label} style={{
              background: COLORS.surface,
              borderRadius: "16px",
              padding: "20px",
              textAlign: "center",
              border: `1px solid ${COLORS.border}`,
            }}>
              <div style={{ fontSize: "32px", marginBottom: "8px" }}>{stat.icon}</div>
              <div style={{ fontSize: "28px", fontWeight: "bold", color: COLORS.accent }}>{stat.value}</div>
              <div style={{ fontSize: "12px", color: COLORS.muted }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Learning Goals */}
        <div style={{ marginBottom: "30px" }}>
          <h3 style={{ marginBottom: "16px", fontSize: "20px" }}>🎯 Learning Goals</h3>
          <div style={{
            background: COLORS.surface,
            borderRadius: "16px",
            padding: "20px",
            border: `1px solid ${COLORS.border}`,
          }}>
            <div style={{ marginBottom: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span>Academic Progress</span>
                <span style={{ color: COLORS.accent }}>65%</span>
              </div>
              <div style={{
                height: "8px",
                background: COLORS.border,
                borderRadius: "4px",
                overflow: "hidden",
              }}>
                <div style={{
                  width: "65%",
                  height: "100%",
                  background: `linear-gradient(90deg, ${COLORS.accent}, ${COLORS.gold})`,
                  borderRadius: "4px",
                }} />
              </div>
            </div>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              {user.goalDept && <Tag text={`Goal: ${user.goalDept}`} color={COLORS.accent} />}
              {user.goalUni && <Tag text={`Target: ${user.goalUni}`} color={COLORS.gold} />}
              <Tag text={`${stats.sessionsCompleted} Sessions Done`} color={COLORS.green} />
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h3 style={{ marginBottom: "16px", fontSize: "20px" }}>📋 Recent Activity</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[
              { action: "Completed session with Dr. Aisha Rahman", date: "2 days ago", icon: "✅" },
              { action: "Submitted project for review", date: "5 days ago", icon: "📝" },
              { action: "Enrolled in AI/ML course", date: "1 week ago", icon: "🎓" },
              { action: "Booked session with Prof. Carlos Mendez", date: "2 weeks ago", icon: "📅" },
            ].map((activity, i) => (
              <div key={i} style={{
                background: COLORS.surface,
                borderRadius: "12px",
                padding: "16px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                border: `1px solid ${COLORS.border}`,
              }}>
                <div style={{ fontSize: "24px" }}>{activity.icon}</div>
                <div style={{ flex: 1 }}>
                  <div>{activity.action}</div>
                  <div style={{ fontSize: "12px", color: COLORS.muted }}>{activity.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Mentor Profile Page (Professional) ───────────────────────────────────────
function MentorProfile({ user, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(user);
  const [showVerification, setShowVerification] = useState(false);

  const stats = {
    totalStudents: user.reviews || 24,
    totalHours: (user.reviews || 24) * 3,
    rating: user.rating || 4.9,
    responseTime: "< 2 hours",
  };

  if (!user) return null;

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 20px" }}>
      {/* Verified Banner */}
      <div style={{
        background: "linear-gradient(135deg, #2dd4a0, #059669)",
        borderRadius: "12px",
        padding: "12px 20px",
        marginBottom: "20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "10px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "24px" }}>✓</span>
          <span>Verified Professional Mentor</span>
        </div>
        <button
          onClick={() => setShowVerification(true)}
          style={{
            background: "rgba(255,255,255,0.2)",
            border: "none",
            padding: "6px 12px",
            borderRadius: "20px",
            color: "white",
            cursor: "pointer",
          }}
        >
          View Credentials
        </button>
      </div>

      {/* Profile Content */}
      <div style={{
        background: COLORS.card,
        borderRadius: "20px",
        padding: "30px",
        border: `1px solid ${COLORS.border}`,
      }}>
        {/* Header */}
        <div style={{ display: "flex", gap: "24px", marginBottom: "30px", flexWrap: "wrap" }}>
          <Avatar initials={user.avatar} color={user.color} size={100} />
          
          <div style={{ flex: 1 }}>
            {!isEditing ? (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", marginBottom: "8px" }}>
                  <h1 style={{ fontSize: "32px", fontFamily: "'Playfair Display'" }}>{user.name}</h1>
                  <span style={{
                    background: COLORS.green + "22",
                    color: COLORS.green,
                    padding: "4px 12px",
                    borderRadius: "20px",
                    fontSize: "12px",
                  }}>
                    ★ {user.rating} Rating
                  </span>
                </div>
                <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginBottom: "16px" }}>
                  <span style={{ color: COLORS.muted }}>💰 ${user.price}/hour</span>
                  <span style={{ color: COLORS.muted }}>📅 {user.availability}</span>
                  <span style={{ color: COLORS.muted }}>👥 {stats.totalStudents} students</span>
                  <span style={{ color: COLORS.muted }}>⏱️ {stats.responseTime} response</span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {user.expertise?.map(e => <Tag key={e} text={e} color={user.color} />)}
                </div>
              </>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <Input
                  value={editedUser.name}
                  onChange={e => setEditedUser({ ...editedUser, name: e.target.value })}
                  placeholder="Full Name"
                />
                <Input
                  value={editedUser.bio}
                  onChange={e => setEditedUser({ ...editedUser, bio: e.target.value })}
                  placeholder="Bio"
                  as="textarea"
                />
                <Input
                  value={editedUser.price}
                  onChange={e => setEditedUser({ ...editedUser, price: e.target.value })}
                  placeholder="Hourly Rate"
                  type="number"
                />
                <Input
                  value={editedUser.availability}
                  onChange={e => setEditedUser({ ...editedUser, availability: e.target.value })}
                  placeholder="Availability"
                />
              </div>
            )}
          </div>

          <div>
            {!isEditing ? (
              <Btn onClick={() => setIsEditing(true)} variant="ghost">
                ✏️ Edit Profile
              </Btn>
            ) : (
              <div style={{ display: "flex", gap: "10px" }}>
                <Btn onClick={() => setIsEditing(false)} variant="ghost">Cancel</Btn>
                <Btn onClick={() => { onUpdate(editedUser); setIsEditing(false); }}>Save</Btn>
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
          marginBottom: "30px",
        }}>
          {[
            { label: "Total Students", value: stats.totalStudents, icon: "👥", color: COLORS.accent },
            { label: "Teaching Hours", value: stats.totalHours, icon: "⏰", color: COLORS.gold },
            { label: "Response Time", value: stats.responseTime, icon: "⚡", color: COLORS.green },
            { label: "Completion Rate", value: "98%", icon: "📈", color: COLORS.rose },
          ].map(stat => (
            <div key={stat.label} style={{
              background: COLORS.surface,
              borderRadius: "16px",
              padding: "20px",
              textAlign: "center",
              border: `1px solid ${stat.color}44`,
            }}>
              <div style={{ fontSize: "32px", marginBottom: "8px" }}>{stat.icon}</div>
              <div style={{ fontSize: "28px", fontWeight: "bold", color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: "12px", color: COLORS.muted }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Bio Section */}
        <div style={{ marginBottom: "30px" }}>
          <h3 style={{ marginBottom: "12px", fontSize: "20px" }}>📝 About Me</h3>
          <div style={{
            background: COLORS.surface,
            borderRadius: "16px",
            padding: "20px",
            lineHeight: "1.8",
            color: COLORS.text,
          }}>
            {user.bio || "Experienced professional passionate about mentoring the next generation of leaders."}
          </div>
        </div>

        {/* Expertise & Specialties */}
        <div style={{ marginBottom: "30px" }}>
          <h3 style={{ marginBottom: "12px", fontSize: "20px" }}>🎯 Areas of Expertise</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {user.expertise?.map(e => (
              <span key={e} style={{
                background: `linear-gradient(135deg, ${user.color}22, ${user.color}11)`,
                padding: "8px 16px",
                borderRadius: "30px",
                border: `1px solid ${user.color}44`,
                fontSize: "14px",
              }}>
                {e}
              </span>
            ))}
          </div>
        </div>

        {/* Credentials & Documents */}
        <div>
          <h3 style={{ marginBottom: "12px", fontSize: "20px" }}>📜 Credentials</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {(user.docs || []).map(doc => (
              <div key={doc} style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: COLORS.surface,
                padding: "12px 16px",
                borderRadius: "12px",
                border: `1px solid ${COLORS.border}`,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span>📄</span>
                  <span>{doc}</span>
                  <Tag text="Verified" color={COLORS.green} />
                </div>
                <button style={{
                  background: "none",
                  color: COLORS.accent,
                  cursor: "pointer",
                }}>View</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Verification Modal */}
      {showVerification && (
        <Modal open={showVerification} onClose={() => setShowVerification(false)} title="Verified Credentials">
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>✓</div>
            <h3 style={{ marginBottom: "16px" }}>Professional Verification</h3>
            <p style={{ color: COLORS.muted, marginBottom: "24px" }}>
              This mentor's credentials have been verified by MentorPath's team.
              All documents are authentic and up-to-date.
            </p>
            <div style={{ background: COLORS.surface, padding: "16px", borderRadius: "12px", marginBottom: "24px" }}>
              <div>Verified Documents:</div>
              {(user.docs || []).map(doc => <div key={doc}>✓ {doc}</div>)}
            </div>
            <Btn onClick={() => setShowVerification(false)}>Close</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
