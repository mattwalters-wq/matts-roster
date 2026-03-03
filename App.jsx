import { useState, useEffect, useCallback } from "react";

// ─── localStorage Storage ───
const STORAGE_KEY = "roster-hub-data";
const Storage = {
  get() {
    try { const d = localStorage.getItem(STORAGE_KEY); return d ? JSON.parse(d) : null; } catch { return null; }
  },
  set(value) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(value)); } catch (e) { console.error(e); }
  },
};

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-AU", { day: "numeric", month: "short" }) : "";
const isOverdue = (d) => d && new Date(d) < new Date(new Date().toDateString());

const ARTISTS = [
  { id: "emma", name: "Emma Donovan", color: "#E8634B", initials: "ED" },
  { id: "dustin", name: "Dustin Tebbutt", color: "#4A90D9", initials: "DT" },
  { id: "stamps", name: "The Stamps", color: "#5DAE4B", initials: "TS" },
  { id: "sarah", name: "Sarah Grace Buckley", color: "#E0A830", initials: "SG" },
];

const COLUMNS = [
  { id: "todo", label: "To Do", color: "#8892A0", emoji: "📋" },
  { id: "active", label: "In Progress", color: "#E0A830", emoji: "⚡" },
  { id: "done", label: "Done", color: "#5DAE4B", emoji: "✓" },
];

const PRIORITY = { high: "#E8634B", medium: "#E0A830", low: "#5DAE4B" };
const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "tasks", label: "Tasks" },
  { id: "releases", label: "Releases" },
  { id: "grants", label: "Grants" },
  { id: "tours", label: "Tours" },
];

const INITIAL_CARDS = [
  { id: uid(), artistId: "emma", title: "Creative Australia grant - new studio album", category: "grants", status: "active", priority: "high", dueDate: "2026-03-31", description: "Studio album with producer Alex Burnett. Budget, artistic statement, support materials." },
  { id: uid(), artistId: "emma", title: "Confirm Alex Burnett producer deal terms", category: "tasks", status: "active", priority: "high", dueDate: "2026-03-15", description: "Finalise producer agreement, points, and advance structure." },
  { id: uid(), artistId: "emma", title: "Take Me To The River - festival campaign", category: "releases", status: "active", priority: "medium", description: "Coordinate festival appearances and promo around the project." },
  { id: uid(), artistId: "emma", title: "New studio album - pre-production planning", category: "releases", status: "todo", priority: "medium", dueDate: "2026-05-01", description: "Song selection, session musicians, studio dates with Alex Burnett." },
  { id: uid(), artistId: "emma", title: "Sync pitching - music supervisors", category: "tasks", status: "todo", priority: "medium", description: "Prepare sync one-sheet and pitch catalogue to AU/US supervisors." },
  { id: uid(), artistId: "emma", title: "Update EPK and press assets", category: "tasks", status: "todo", priority: "low", description: "New bio, hi-res photos, updated discography." },
  { id: uid(), artistId: "dustin", title: "Creative Australia - A Bend In The Light", category: "grants", status: "active", priority: "high", dueDate: "2026-03-31", description: "Multisensory show grant. Budget for immersive production, AV, touring." },
  { id: uid(), artistId: "dustin", title: "A Bend In The Light - production development", category: "releases", status: "active", priority: "high", description: "Coordinate with AV/lighting designers on multisensory show concept." },
  { id: uid(), artistId: "dustin", title: "Identify venue partners for premiere run", category: "tours", status: "todo", priority: "medium", dueDate: "2026-04-30", description: "Arts centres and festivals suited to immersive format." },
  { id: uid(), artistId: "dustin", title: "New music - recording timeline", category: "tasks", status: "todo", priority: "medium", description: "Map out recording schedule aligned with show development." },
  { id: uid(), artistId: "dustin", title: "Review streaming strategy", category: "tasks", status: "todo", priority: "low", description: "Playlist pitching, DSP relationships, catalogue optimisation." },
  { id: uid(), artistId: "stamps", title: "Creative Australia grant - sophomore album", category: "grants", status: "active", priority: "high", dueDate: "2026-03-31", description: "Second album application with recording budget, producer fees, campaign costs." },
  { id: uid(), artistId: "stamps", title: "She Bangs the Drums - covers EP campaign", category: "releases", status: "active", priority: "high", description: "Press, playlisting, social content, radio campaign." },
  { id: uid(), artistId: "stamps", title: "EU/UK tour 2026 - logistics", category: "tours", status: "active", priority: "high", dueDate: "2026-06-01", description: "Visas, flights, backline, accommodation, per diems." },
  { id: uid(), artistId: "stamps", title: "EU/UK tour - visa applications", category: "tasks", status: "active", priority: "high", dueDate: "2026-04-01", description: "UK and Schengen visa applications for all members." },
  { id: uid(), artistId: "stamps", title: "Long Life Records - finalise contract", category: "tasks", status: "active", priority: "high", dueDate: "2026-03-20", description: "Royalty structure, advance terms, option periods." },
  { id: uid(), artistId: "stamps", title: "Canadian winter tour - explore", category: "tours", status: "todo", priority: "medium", dueDate: "2026-05-15", description: "Research agents, venues, routing for late 2026/early 2027." },
  { id: uid(), artistId: "stamps", title: "Sophomore album - producer shortlist", category: "tasks", status: "todo", priority: "medium", dueDate: "2026-04-15", description: "Shortlist producers, check availability and quotes." },
  { id: uid(), artistId: "stamps", title: "EU/UK tour - merch production", category: "tasks", status: "todo", priority: "medium", dueDate: "2026-05-01", description: "Design and order. Quotes from AU and EU suppliers." },
  { id: uid(), artistId: "sarah", title: "Solo rebrand - transition from The Buckleys", category: "tasks", status: "active", priority: "high", description: "Positioning, visual identity, rollout plan for solo launch." },
  { id: uid(), artistId: "sarah", title: "New solo material - recording plan", category: "releases", status: "todo", priority: "high", dueDate: "2026-05-01", description: "Demos, producer options, timeline for debut solo release." },
  { id: uid(), artistId: "sarah", title: "Build solo digital presence", category: "tasks", status: "todo", priority: "medium", dueDate: "2026-04-15", description: "Solo socials, website, content strategy." },
  { id: uid(), artistId: "sarah", title: "Identify support tour opportunities", category: "tours", status: "todo", priority: "medium", description: "Support slots for solo shows to build new audience." },
  { id: uid(), artistId: "sarah", title: "Songwriting sessions - co-writers", category: "tasks", status: "todo", priority: "medium", description: "Set up sessions in Melbourne and remotely." },
];

const INITIAL_CONTACTS = [
  { id: uid(), artistId: "emma", name: "Alex Burnett", role: "Producer", company: "", email: "", phone: "", notes: "Producing Emma's new studio album" },
  { id: uid(), artistId: "stamps", name: "Long Life Records", role: "Label", company: "Long Life Records", email: "", phone: "", notes: "Negotiating deal for The Stamps" },
  { id: uid(), artistId: "", name: "Creative Australia", role: "Funding Body", company: "Creative Australia", email: "", phone: "", notes: "Multiple grant applications across roster" },
];

// ─── Components ───
function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300, padding: 16 }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 14, width: "100%", maxWidth: 480, maxHeight: "85vh", overflow: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid #E8E8E8" }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: "#1a1a1a" }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#999", fontSize: 18, cursor: "pointer" }}>✕</button>
        </div>
        <div style={{ padding: "16px 20px" }}>{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return <div style={{ marginBottom: 14 }}><label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#888", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</label>{children}</div>;
}

function Badge({ text, color }) {
  return <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 5, fontSize: 10, fontWeight: 600, textTransform: "capitalize", background: color + "15", color, border: `1px solid ${color}25` }}>{text}</span>;
}

const inp = { width: "100%", padding: "9px 11px", background: "#FAFAFA", border: "1.5px solid #E0E0E0", borderRadius: 8, color: "#1a1a1a", fontSize: 13, fontFamily: "'DM Sans', -apple-system, sans-serif", outline: "none", boxSizing: "border-box" };
const saveBtn = { background: "#4A90D9", color: "#fff", border: "none", padding: "10px 20px", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 600, fontFamily: "'DM Sans', -apple-system, sans-serif", width: "100%" };
const iconBtn = { background: "none", border: "none", color: "#bbb", cursor: "pointer", fontSize: 13, padding: "2px 4px" };
const pill = { display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 20, cursor: "pointer", fontSize: 12, fontWeight: 500, fontFamily: "'DM Sans', -apple-system, sans-serif", border: "1.5px solid #E0E0E0", background: "#fff", color: "#777", whiteSpace: "nowrap", transition: "all 0.15s" };
const pillActive = { background: "#E8ECF1", color: "#333", borderColor: "#C8CCD3" };

function CardForm({ initial, onSave, artists, defaultStatus }) {
  const [form, setForm] = useState({
    artistId: initial?.artistId || "", title: initial?.title || "",
    category: initial?.category || "tasks", priority: initial?.priority || "medium",
    status: initial?.status || defaultStatus || "todo", dueDate: initial?.dueDate || "",
    description: initial?.description || "",
  });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  return (
    <div>
      <Field label="Artist">
        <select value={form.artistId} onChange={e => set("artistId", e.target.value)} style={inp}>
          <option value="">Select artist...</option>
          {artists.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
      </Field>
      <Field label="Title"><input value={form.title} onChange={e => set("title", e.target.value)} style={inp} placeholder="What needs to be done?" /></Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Field label="Category">
          <select value={form.category} onChange={e => set("category", e.target.value)} style={inp}>
            <option value="tasks">Task</option><option value="releases">Release</option>
            <option value="grants">Grant</option><option value="tours">Tour</option>
          </select>
        </Field>
        <Field label="Priority">
          <select value={form.priority} onChange={e => set("priority", e.target.value)} style={inp}>
            <option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option>
          </select>
        </Field>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Field label="Status">
          <select value={form.status} onChange={e => set("status", e.target.value)} style={inp}>
            {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </Field>
        <Field label="Due Date"><input type="date" value={form.dueDate} onChange={e => set("dueDate", e.target.value)} style={inp} /></Field>
      </div>
      <Field label="Notes"><textarea value={form.description} onChange={e => set("description", e.target.value)} style={{ ...inp, height: 70, resize: "vertical" }} placeholder="Any details..." /></Field>
      <button onClick={() => { if (form.title) onSave(form); }} style={saveBtn}>Save</button>
    </div>
  );
}

function ContactForm({ initial, onSave, artists }) {
  const [form, setForm] = useState({
    artistId: initial?.artistId || "", name: initial?.name || "", role: initial?.role || "",
    company: initial?.company || "", email: initial?.email || "", phone: initial?.phone || "", notes: initial?.notes || "",
  });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  return (
    <div>
      <Field label="Artist (optional)"><select value={form.artistId} onChange={e => set("artistId", e.target.value)} style={inp}><option value="">General</option>{artists.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</select></Field>
      <Field label="Name"><input value={form.name} onChange={e => set("name", e.target.value)} style={inp} /></Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Field label="Role"><input value={form.role} onChange={e => set("role", e.target.value)} style={inp} placeholder="e.g. Agent, Producer" /></Field>
        <Field label="Company"><input value={form.company} onChange={e => set("company", e.target.value)} style={inp} /></Field>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Field label="Email"><input value={form.email} onChange={e => set("email", e.target.value)} style={inp} type="email" /></Field>
        <Field label="Phone"><input value={form.phone} onChange={e => set("phone", e.target.value)} style={inp} type="tel" /></Field>
      </div>
      <Field label="Notes"><textarea value={form.notes} onChange={e => set("notes", e.target.value)} style={{ ...inp, height: 60, resize: "vertical" }} /></Field>
      <button onClick={() => { if (form.name) onSave(form); }} style={saveBtn}>Save</button>
    </div>
  );
}

// ─── Kanban Column ───
function KanbanCol({ col, cards, artists, onEdit, onDelete, onDrop, onAdd }) {
  const [dragOver, setDragOver] = useState(false);
  return (
    <div
      style={{ background: dragOver ? "#EDF0F4" : "#EDEEF1", borderRadius: 12, padding: 10, minHeight: 200, transition: "background 0.15s", borderTop: `3px solid ${col.color}` }}
      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={e => { e.preventDefault(); setDragOver(false); onDrop(e.dataTransfer.getData("text/plain"), col.id); }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 6px 10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 14 }}>{col.emoji}</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#444" }}>{col.label}</span>
          <span style={{ background: "#D8DAE0", color: "#666", fontSize: 11, fontWeight: 600, padding: "1px 7px", borderRadius: 10 }}>{cards.length}</span>
        </div>
        <button onClick={onAdd} style={{ background: "none", border: "1.5px dashed #C0C4CC", color: "#999", width: 26, height: 26, borderRadius: 6, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }} title="Add card">+</button>
      </div>
      <button onClick={onAdd} style={{ width: "100%", padding: "10px", background: "#fff", border: "1.5px dashed #D0D3D9", borderRadius: 8, cursor: "pointer", fontSize: 12, color: "#999", fontFamily: "inherit", marginBottom: 6, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>+ Add a card</button>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {cards.map(card => {
          const a = artists.find(x => x.id === card.artistId);
          const overdue = isOverdue(card.dueDate) && card.status !== "done";
          return (
            <div key={card.id} draggable onDragStart={e => e.dataTransfer.setData("text/plain", card.id)}
              className="kanban-card"
              style={{ background: "#fff", border: "1.5px solid #E8E8E8", borderRadius: 10, padding: "10px 12px", cursor: "grab", transition: "all 0.15s", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 6 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {a && <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: a.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 11, color: a.color, fontWeight: 600 }}>{a.name}</span>
                  </div>}
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a", lineHeight: 1.35, marginBottom: 6 }}>{card.title}</div>
                </div>
                <div className="card-actions" style={{ display: "flex", gap: 2, flexShrink: 0, opacity: 0, transition: "opacity 0.15s" }}>
                  <button onClick={e => { e.stopPropagation(); onEdit(card); }} style={iconBtn}>✎</button>
                  <button onClick={e => { e.stopPropagation(); onDelete(card.id); }} style={{ ...iconBtn, color: "#E8634B" }}>✕</button>
                </div>
              </div>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap", alignItems: "center" }}>
                <Badge text={card.category} color="#8892A0" />
                <Badge text={card.priority} color={PRIORITY[card.priority]} />
                {card.dueDate && <span style={{ fontSize: 11, fontWeight: 500, color: overdue ? "#E8634B" : "#aaa" }}>{overdue ? "⚠ " : "📅 "}{fmtDate(card.dueDate)}</span>}
              </div>
              {card.description && <div style={{ fontSize: 12, color: "#999", marginTop: 5, lineHeight: 1.4 }}>{card.description.length > 90 ? card.description.slice(0, 90) + "..." : card.description}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main App ───
export default function RosterHub() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("board");
  const [artistFilter, setArtistFilter] = useState("all");
  const [catFilter, setCatFilter] = useState("all");
  const [artists, setArtists] = useState(ARTISTS);
  const [cards, setCards] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState("card");
  const [editItem, setEditItem] = useState(null);
  const [defaultStatus, setDefaultStatus] = useState("todo");
  const [showArtistMgr, setShowArtistMgr] = useState(false);
  const [editArtist, setEditArtist] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth <= 768);
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const data = Storage.get();
    if (data) {
      setArtists(data.artists || ARTISTS);
      setCards(data.cards || []);
      setContacts(data.contacts || []);
    } else {
      setCards(INITIAL_CARDS);
      setContacts(INITIAL_CONTACTS);
      Storage.set({ artists: ARTISTS, cards: INITIAL_CARDS, contacts: INITIAL_CONTACTS });
    }
    setLoading(false);
  }, []);

  const save = useCallback((updates) => {
    const state = { artists, cards, contacts, ...updates };
    Storage.set(state);
  }, [artists, cards, contacts]);

  const updateCards = (v) => { setCards(v); save({ cards: v }); };
  const updateContacts = (v) => { setContacts(v); save({ contacts: v }); };
  const updateArtists = (v) => { setArtists(v); save({ artists: v }); };

  const openAddCard = (status = "todo") => { setEditItem(null); setDefaultStatus(status); setModalType("card"); setModalOpen(true); };
  const openEditCard = (card) => { setEditItem(card); setModalType("card"); setModalOpen(true); };
  const openAddContact = () => { setEditItem(null); setModalType("contact"); setModalOpen(true); };
  const openEditContact = (c) => { setEditItem(c); setModalType("contact"); setModalOpen(true); };

  const handleSave = (formData) => {
    if (modalType === "card") {
      if (editItem) updateCards(cards.map(c => c.id === editItem.id ? { ...c, ...formData } : c));
      else updateCards([...cards, { ...formData, id: uid() }]);
    } else {
      if (editItem) updateContacts(contacts.map(c => c.id === editItem.id ? { ...c, ...formData } : c));
      else updateContacts([...contacts, { ...formData, id: uid() }]);
    }
    setModalOpen(false);
    setEditItem(null);
  };

  const filteredCards = cards.filter(c => {
    if (artistFilter !== "all" && c.artistId !== artistFilter) return false;
    if (catFilter !== "all" && c.category !== catFilter) return false;
    return true;
  });

  const handleDrop = (cardId, newStatus) => {
    updateCards(cards.map(c => c.id === cardId ? { ...c, status: newStatus } : c));
  };

  const renderBoard = () => (
    <div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
        <button onClick={() => setArtistFilter("all")} style={{ ...pill, ...(artistFilter === "all" ? pillActive : {}) }}>All Artists</button>
        {artists.map(a => (
          <button key={a.id} onClick={() => setArtistFilter(artistFilter === a.id ? "all" : a.id)}
            style={{ ...pill, ...(artistFilter === a.id ? { background: a.color + "15", color: a.color, borderColor: a.color + "40" } : {}) }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: a.color, flexShrink: 0 }} />
            {a.name.split(" ")[0]}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 18 }}>
        {CATEGORIES.map(c => (
          <button key={c.id} onClick={() => setCatFilter(catFilter === c.id ? "all" : c.id)}
            style={{ ...pill, ...(catFilter === c.id ? pillActive : {}) }}>{c.label}</button>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 14, alignItems: "start" }}>
        {COLUMNS.map(col => {
          const colCards = filteredCards.filter(c => c.status === col.id).sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] || 1) - ({ high: 0, medium: 1, low: 2 }[b.priority] || 1));
          return <KanbanCol key={col.id} col={col} cards={colCards} artists={artists} onEdit={openEditCard} onDelete={(id) => updateCards(cards.filter(c => c.id !== id))} onDrop={handleDrop} onAdd={() => openAddCard(col.id)} />;
        })}
      </div>
    </div>
  );

  const renderContacts = () => {
    const fil = artistFilter === "all" ? contacts : contacts.filter(c => c.artistId === artistFilter);
    return (
      <div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
          <button onClick={() => setArtistFilter("all")} style={{ ...pill, ...(artistFilter === "all" ? pillActive : {}) }}>All</button>
          {artists.map(a => (
            <button key={a.id} onClick={() => setArtistFilter(artistFilter === a.id ? "all" : a.id)}
              style={{ ...pill, ...(artistFilter === a.id ? { background: a.color + "15", color: a.color, borderColor: a.color + "40" } : {}) }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: a.color }} />{a.name.split(" ")[0]}
            </button>
          ))}
        </div>
        <button onClick={openAddContact} style={{ width: "100%", padding: "10px", background: "#fff", border: "1.5px dashed #D0D3D9", borderRadius: 10, cursor: "pointer", fontSize: 13, color: "#999", fontFamily: "inherit", marginBottom: 12, fontWeight: 500 }}>+ Add Contact</button>
        {fil.length === 0 ? <div style={{ textAlign: "center", padding: 40, color: "#ccc" }}>No contacts yet</div> : fil.map(c => {
          const a = artists.find(x => x.id === c.artistId);
          return (
            <div key={c.id} style={{ background: "#fff", border: "1.5px solid #E8E8E8", borderRadius: 10, padding: "10px 12px", marginBottom: 8, boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  {a && <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}><span style={{ width: 7, height: 7, borderRadius: "50%", background: a.color }} /><span style={{ fontSize: 11, color: a.color, fontWeight: 600 }}>{a.name}</span></div>}
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#1a1a1a", marginBottom: 4 }}>{c.name}</div>
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 3 }}>
                    {c.role && <Badge text={c.role} color="#4A90D9" />}
                    {c.company && <span style={{ fontSize: 12, color: "#888" }}>{c.company}</span>}
                  </div>
                  <div style={{ fontSize: 12, color: "#777" }}>
                    {c.email && <div>{c.email}</div>}
                    {c.phone && <div>{c.phone}</div>}
                  </div>
                  {c.notes && <div style={{ fontSize: 11, color: "#aaa", marginTop: 3 }}>{c.notes}</div>}
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  <button onClick={() => openEditContact(c)} style={iconBtn}>✎</button>
                  <button onClick={() => updateContacts(contacts.filter(x => x.id !== c.id))} style={{ ...iconBtn, color: "#E8634B" }}>✕</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  function ArtistManager() {
    return (
      <Modal open={showArtistMgr} onClose={() => { setShowArtistMgr(false); setEditArtist(null); }} title="Manage Roster">
        {artists.map(a => (
          <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid #f0f0f0" }}>
            <span style={{ width: 12, height: 12, borderRadius: "50%", background: a.color }} />
            <span style={{ flex: 1, color: "#333", fontSize: 14, fontWeight: 500 }}>{a.name}</span>
            <button onClick={() => setEditArtist(a)} style={iconBtn}>✎</button>
            <button onClick={() => { if (window.confirm(`Remove ${a.name}?`)) updateArtists(artists.filter(x => x.id !== a.id)); }} style={{ ...iconBtn, color: "#E8634B" }}>✕</button>
          </div>
        ))}
        <ArtistForm key={editArtist?.id || "new"} initial={editArtist}
          onSave={(data) => {
            if (editArtist) { updateArtists(artists.map(a => a.id === editArtist.id ? { ...editArtist, ...data } : a)); setEditArtist(null); }
            else updateArtists([...artists, { ...data, id: uid() }]);
          }}
          onCancel={editArtist ? () => setEditArtist(null) : null}
        />
      </Modal>
    );
  }

  function ArtistForm({ initial, onSave, onCancel }) {
    const [name, setName] = useState(initial?.name || "");
    const [color, setColor] = useState(initial?.color || "#4A90D9");
    const [initials, setInitials] = useState(initial?.initials || "");
    return (
      <div style={{ borderTop: "1px solid #eee", paddingTop: 14, marginTop: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#666", marginBottom: 10 }}>{initial ? "Edit Artist" : "Add New Artist"}</div>
        <Field label="Name"><input value={name} onChange={e => { setName(e.target.value); if (!initial) setInitials(e.target.value.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)); }} style={inp} /></Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Field label="Initials"><input value={initials} onChange={e => setInitials(e.target.value)} style={inp} maxLength={3} /></Field>
          <Field label="Color"><input type="color" value={color} onChange={e => setColor(e.target.value)} style={{ ...inp, height: 38, padding: 3, cursor: "pointer" }} /></Field>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => { if (name) onSave({ name, color, initials: initials || name.slice(0, 2).toUpperCase() }); }} style={{ ...saveBtn, flex: 1 }}>{initial ? "Update" : "Add"}</button>
          {onCancel && <button onClick={onCancel} style={{ background: "#f0f0f0", color: "#666", border: "none", padding: "9px 16px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>Cancel</button>}
        </div>
      </div>
    );
  }

  if (loading) return <div style={{ background: "#F6F7F9", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#aaa", fontFamily: "'DM Sans', sans-serif" }}>Loading...</div>;

  const modalTitle = modalType === "card" ? (editItem ? "Edit Card" : "Add Card") : (editItem ? "Edit Contact" : "Add Contact");

  return (
    <div style={{ fontFamily: "'DM Sans', -apple-system, sans-serif", background: "#F6F7F9", minHeight: "100vh", fontSize: 13 }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style>{`.kanban-card:hover .card-actions { opacity: 1 !important; } .kanban-card:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.08) !important; border-color: #D0D3D9 !important; }`}</style>

      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: isMobile ? "12px 14px" : "12px 24px", background: "#fff", borderBottom: "1px solid #E8E8E8", position: "sticky", top: 0, zIndex: 100 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: "#1a1a1a", margin: 0 }}>🎵 Roster</h1>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ display: "flex", background: "#F0F1F3", borderRadius: 8, padding: 2 }}>
            {[{ id: "board", label: "Board", icon: "▦" }, { id: "contacts", label: "Contacts", icon: "👤" }].map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                display: "flex", alignItems: "center", gap: 5, padding: isMobile ? "7px 10px" : "7px 14px",
                border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "inherit",
                background: activeTab === t.id ? "#fff" : "transparent", color: activeTab === t.id ? "#1a1a1a" : "#999",
                boxShadow: activeTab === t.id ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
              }}>{t.icon} {!isMobile && t.label}</button>
            ))}
          </div>
          <button onClick={() => setShowArtistMgr(true)} style={{ background: "#F0F1F3", border: "none", width: 34, height: 34, borderRadius: 8, cursor: "pointer", fontSize: 14, color: "#666" }}>⚙</button>
          <button onClick={() => { activeTab === "contacts" ? openAddContact() : openAddCard(); }}
            style={{ background: "#4A90D9", color: "#fff", border: "none", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "inherit" }}>+ Add</button>
        </div>
      </header>

      <main style={{ padding: isMobile ? "14px" : "20px 24px", maxWidth: 1200, margin: "0 auto" }}>
        {activeTab === "board" && renderBoard()}
        {activeTab === "contacts" && renderContacts()}
      </main>

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditItem(null); }} title={modalTitle}>
        {modalType === "card" ? <CardForm initial={editItem} onSave={handleSave} artists={artists} defaultStatus={defaultStatus} /> : <ContactForm initial={editItem} onSave={handleSave} artists={artists} />}
      </Modal>
      <ArtistManager />
    </div>
  );
}
