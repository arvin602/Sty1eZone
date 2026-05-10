import { useState, useRef, useEffect, useCallback, useMemo } from "react";

// ─── SEED DATA ────────────────────────────────────────────────────────────────
const SEED_ITEMS = [
  { id:"s1",  title:"Camel Trench Coat",        brand:"Burberry",     price:"$1,890", category:"Outerwear",   tags:["#trench","#camel","#outerwear","#classic"],     imageUrl:"https://images.unsplash.com/photo-1548624313-0396c75e4b1a?w=600&q=80",  user:"monique_v",  likes:1842, saved:false, liked:false, desc:"Double-breasted gabardine trench. An eternal wardrobe investment." },
  { id:"s2",  title:"Navy Structured Blazer",   brand:"Totême",       price:"$720",   category:"Tops",        tags:["#blazer","#navy","#tailored","#minimalist"],     imageUrl:"https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80",  user:"alex_fits",  likes:2104, saved:false, liked:true,  desc:"Single-breasted wool-blend blazer with clean structured shoulders." },
  { id:"s3",  title:"Ivory Linen Set",          brand:"Arket",        price:"$240",   category:"Sets",        tags:["#linen","#ivory","#co-ord","#summer"],           imageUrl:"https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80",  user:"rue_style",  likes:5210, saved:true,  liked:false, desc:"Relaxed linen co-ord in warm ivory. Effortlessly minimal." },
  { id:"s4",  title:"Black Leather Jacket",     brand:"Acne Studios", price:"$1,250", category:"Outerwear",   tags:["#leather","#black","#jacket","#edgy"],           imageUrl:"https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80",  user:"minimal_co", likes:6500, saved:false, liked:false, desc:"Slim-fit lambskin leather. Antique brass hardware." },
  { id:"s5",  title:"Forest Green Midi Dress",  brand:"Reformation",  price:"$278",   category:"Dresses",     tags:["#midi","#green","#dress","#feminine"],           imageUrl:"https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&q=80",  user:"luxe_daily", likes:3280, saved:false, liked:false, desc:"Bias-cut crepe midi dress in deep forest green." },
  { id:"s6",  title:"Cream Oversized Knit",     brand:"Sézane",       price:"$195",   category:"Tops",        tags:["#knit","#cream","#oversized","#cozy"],           imageUrl:"https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&q=80",  user:"monique_v",  likes:3280, saved:true,  liked:false, desc:"Cable-knit oversized sweater in warm ecru. Impossibly soft." },
  { id:"s7",  title:"Wide-Leg Trousers",        brand:"COS",          price:"$120",   category:"Bottoms",     tags:["#widelegs","#tailored","#neutral","#elegant"],   imageUrl:"https://images.unsplash.com/photo-1594938298603-c8148c4b4239?w=600&q=80",  user:"theo_wear",  likes:1870, saved:false, liked:true,  desc:"High-rise wide-leg in pressed suiting fabric. Clean and architectural." },
  { id:"s8",  title:"Cognac Leather Tote",      brand:"Totême",       price:"$560",   category:"Accessories", tags:["#tote","#leather","#cognac","#handbag"],         imageUrl:"https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80",  user:"alex_fits",  likes:3240, saved:false, liked:false, desc:"Full-grain leather tote with polished brass hardware." },
  { id:"s9",  title:"White Linen Shirt",        brand:"Lemaire",      price:"$340",   category:"Tops",        tags:["#linen","#white","#shirt","#minimal"],           imageUrl:"https://images.unsplash.com/photo-1603252109303-2751441dd157?w=600&q=80",  user:"rue_style",  likes:1120, saved:false, liked:false, desc:"Relaxed-fit washed linen shirt with band collar." },
  { id:"s10", title:"Tan Penny Loafers",        brand:"Tod's",        price:"$650",   category:"Shoes",       tags:["#loafers","#tan","#leather","#classic"],         imageUrl:"https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&q=80",  user:"luxe_daily", likes:1890, saved:false, liked:false, desc:"Hand-stitched gommino moccasin in smooth calfskin." },
  { id:"s11", title:"Cashmere Camel Scarf",     brand:"Loro Piana",   price:"$895",   category:"Accessories", tags:["#cashmere","#camel","#scarf","#luxury"],         imageUrl:"https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=600&q=80",  user:"monique_v",  likes:2560, saved:false, liked:false, desc:"Pure Grade-A cashmere with hand-knotted fringe." },
  { id:"s12", title:"Silk Slip Dress",          brand:"Vince",        price:"$395",   category:"Dresses",     tags:["#silk","#slip","#dress","#minimal"],             imageUrl:"https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&q=80",  user:"theo_wear",  likes:4170, saved:false, liked:false, desc:"Bias-cut satin charmeuse slip. Effortless and elevated." },
];

const CATS = ["All","Tops","Bottoms","Dresses","Sets","Outerwear","Shoes","Accessories"];

const DEMO_ACCOUNTS = [
  { username:"monique_v",  password:"demo123", displayName:"Monique V.", bio:"Quiet luxury addict. Paris → NY.",    styleTag:"Soft Luxe Minimalist",     avatar:"https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&q=80" },
  { username:"alex_fits",  password:"demo123", displayName:"Alex F.",    bio:"Scandi-influenced. Clean lines only.", styleTag:"Scandinavian Minimalist",   avatar:"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80" },
];

// ─── STORAGE ──────────────────────────────────────────────────────────────────
function loadState(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch { return fallback; }
}
function saveState(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

// ─── AI ───────────────────────────────────────────────────────────────────────
async function callAI(messages, system) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1024, system, messages }),
  });
  const d = await res.json();
  return d.content?.[0]?.text || "I couldn't respond — try again.";
}

function makeSystem(items, user) {
  const list = items.map(it =>
    `• ID:${it.id} | "${it.title}" by ${it.brand} — ${it.price} [${it.category}] @${it.user} ${it.tags.join(" ")}`
  ).join("\n");
  return `You are Sty, the AI fashion stylist for Sty1eZone — a Pinterest-style fashion discovery platform.

CURRENT USER: ${user?.displayName || "Guest"} (@${user?.username || "guest"}) — style: "${user?.styleTag || "Minimalist"}".

ITEMS ON THE BOARD:
${list}

RULES:
- Always reference specific board items by name and brand: **"Title"** by Brand — Price [ID:xxx]
- Wrap referenced item IDs in <item:ID> tags so the UI shows their photos inline
- Suggest outfit combinations using board items
- Max 5 sentences unless listing items
- Warm, editorial tone — never pushy, never upgrade prompts`;
}

// shared style objects (module-level constants are fine in Vite)
const labelStyle = {
  fontSize: 11, fontWeight: 600, color: "var(--ink3)",
  display: "block", marginBottom: 6,
  textTransform: "uppercase", letterSpacing: "0.07em",
};
const inputStyle = {
  width: "100%", border: "1.5px solid var(--border)", borderRadius: "var(--r)",
  padding: "10px 14px", fontSize: 13, color: "var(--ink)", outline: "none",
  background: "var(--bg)", transition: "border-color .2s", fontFamily: "var(--fb)",
};

// ─── LOGO ─────────────────────────────────────────────────────────────────────
function Logo({ size = 27 }) {
  return (
    <span style={{ fontFamily:"var(--fd)", fontWeight:700, fontSize:size, letterSpacing:"-0.02em", display:"inline-flex", alignItems:"baseline", userSelect:"none", lineHeight:1 }}>
      <span style={{ background:"linear-gradient(135deg,var(--ink) 20%,var(--gold))", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Sty</span>
      <span style={{ fontFamily:"var(--fd)", fontWeight:900, fontSize:size, lineHeight:1, background:"linear-gradient(135deg,var(--gold),var(--gold2))", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>1</span>
      <span style={{ background:"linear-gradient(135deg,var(--ink) 20%,var(--gold))", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>eZone</span>
    </span>
  );
}

// ─── SMALL COMPONENTS ─────────────────────────────────────────────────────────
function Toast({ msg }) {
  if (!msg) return null;
  return (
    <div style={{ position:"fixed", bottom:28, left:"50%", transform:"translateX(-50%)", background:"var(--ink)", color:"#fff", padding:"10px 24px", borderRadius:"var(--rp)", fontSize:13, fontWeight:500, zIndex:9999, animation:"fadeUp .25s ease", whiteSpace:"nowrap", maxWidth:"92vw", textAlign:"center", boxShadow:"var(--s3)", pointerEvents:"none" }}>
      {msg}
    </div>
  );
}

function Pill({ children, active, onClick }) {
  return (
    <button onClick={onClick} style={{ padding:"7px 18px", borderRadius:"var(--rp)", fontSize:12, fontWeight:600, border:"1.5px solid", borderColor:active?"var(--gold)":"var(--border)", background:active?"rgba(184,137,42,.1)":"none", color:active?"var(--gold)":"var(--ink3)", cursor:"pointer", transition:"all .2s", whiteSpace:"nowrap" }}>
      {children}
    </button>
  );
}

function Tog({ on, onChange }) {
  return (
    <div onClick={() => onChange(!on)} style={{ width:42, height:24, borderRadius:12, background:on?"var(--gold)":"var(--border2)", position:"relative", cursor:"pointer", transition:"background .25s", flexShrink:0 }}>
      <div style={{ position:"absolute", width:18, height:18, borderRadius:"50%", background:"#fff", top:3, left:on?21:3, transition:"left .25s", boxShadow:"0 1px 4px rgba(0,0,0,.2)" }} />
    </div>
  );
}

function Spinner() {
  return <div style={{ width:18, height:18, border:"2.5px solid var(--border)", borderTopColor:"var(--gold)", borderRadius:"50%", animation:"spin .7s linear infinite", flexShrink:0 }} />;
}

function ImgWithFallback({ src, alt, style: s }) {
  const [err, setErr] = useState(false);
  if (err || !src) return (
    <div style={{ ...s, background:"var(--bg3)", display:"flex", alignItems:"center", justifyContent:"center", color:"var(--ink3)", fontSize:12 }}>No image</div>
  );
  return <img src={src} alt={alt || ""} style={{ ...s, objectFit:"cover" }} onError={() => setErr(true)} />;
}

// ─── AUTH SCREEN ──────────────────────────────────────────────────────────────
function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ username:"", password:"", displayName:"", bio:"", avatarUrl:"" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const avatarRef = useRef(null);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleAvatarFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => set("avatarUrl", ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    setErr("");
    if (!form.username.trim() || !form.password.trim()) { setErr("Username and password are required."); return; }
    if (mode === "signup" && !form.displayName.trim()) { setErr("Display name is required."); return; }
    setLoading(true);
    setTimeout(() => {
      const defaultAccounts = DEMO_ACCOUNTS.reduce((acc, a) => { acc[a.username] = a; return acc; }, {});
      const accounts = loadState("sz_accounts", defaultAccounts);
      if (mode === "login") {
        const acc = accounts[form.username.toLowerCase()];
        if (!acc || acc.password !== form.password) { setErr("Invalid username or password."); setLoading(false); return; }
        saveState("sz_session", form.username.toLowerCase());
        onAuth(acc);
      } else {
        const uname = form.username.toLowerCase().replace(/\s+/g, "_");
        if (accounts[uname]) { setErr("Username already taken."); setLoading(false); return; }
        const newAcc = { username:uname, password:form.password, displayName:form.displayName.trim(), bio:form.bio.trim(), styleTag:"Minimalist", avatar:form.avatarUrl||null };
        accounts[uname] = newAcc;
        saveState("sz_accounts", accounts);
        saveState("sz_session", uname);
        onAuth(newAcc);
      }
      setLoading(false);
    }, 400);
  };

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ width:"100%", maxWidth:420, animation:"fadeUp .35s ease" }}>
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <Logo size={36} />
          <div style={{ fontFamily:"var(--fd)", fontSize:15, color:"var(--ink3)", marginTop:6, fontStyle:"italic" }}>Fashion discovery, curated by AI</div>
        </div>
        <div style={{ background:"var(--white)", borderRadius:"var(--rl)", padding:"28px 30px 32px", boxShadow:"var(--s2)" }}>
          {/* Toggle */}
          <div style={{ display:"flex", borderRadius:"var(--rp)", background:"var(--bg2)", padding:3, marginBottom:24 }}>
            {["login","signup"].map(m => (
              <button key={m} onClick={() => { setMode(m); setErr(""); }} style={{ flex:1, padding:"8px", borderRadius:"var(--rp)", fontSize:13, fontWeight:600, background:mode===m?"var(--white)":"none", color:mode===m?"var(--ink)":"var(--ink3)", boxShadow:mode===m?"var(--s1)":"none", transition:"all .2s", border:"none", cursor:"pointer" }}>
                {m === "login" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          {/* Demo hint */}
          {mode === "login" && (
            <div style={{ background:"rgba(184,137,42,.08)", border:"1px solid rgba(184,137,42,.2)", borderRadius:"var(--r)", padding:"10px 14px", marginBottom:18, fontSize:12, color:"var(--ink2)", lineHeight:1.6 }}>
              <strong>Demo:</strong> username <code style={{background:"var(--bg2)",padding:"1px 5px",borderRadius:4}}>monique_v</code> or <code style={{background:"var(--bg2)",padding:"1px 5px",borderRadius:4}}>alex_fits</code>, password <code style={{background:"var(--bg2)",padding:"1px 5px",borderRadius:4}}>demo123</code>
            </div>
          )}

          {mode === "signup" && (
            <div style={{ marginBottom:14 }}>
              <label style={labelStyle}>Display Name *</label>
              <input value={form.displayName} onChange={e => set("displayName", e.target.value)} placeholder="e.g. Monique V." style={inputStyle}
                onFocus={e => e.target.style.borderColor="var(--gold)"} onBlur={e => e.target.style.borderColor="var(--border)"} />
            </div>
          )}
          <div style={{ marginBottom:14 }}>
            <label style={labelStyle}>Username *</label>
            <input value={form.username} onChange={e => set("username", e.target.value)} placeholder="@username" style={inputStyle}
              onFocus={e => e.target.style.borderColor="var(--gold)"} onBlur={e => e.target.style.borderColor="var(--border)"} />
          </div>
          <div style={{ marginBottom: mode==="signup"?14:20 }}>
            <label style={labelStyle}>Password *</label>
            <input type="password" value={form.password} onChange={e => set("password", e.target.value)} placeholder="••••••••" style={inputStyle}
              onFocus={e => e.target.style.borderColor="var(--gold)"} onBlur={e => e.target.style.borderColor="var(--border)"}
              onKeyDown={e => e.key==="Enter" && handleSubmit()} />
          </div>

          {mode === "signup" && (
            <>
              <div style={{ marginBottom:14 }}>
                <label style={labelStyle}>Bio</label>
                <input value={form.bio} onChange={e => set("bio", e.target.value)} placeholder="A short bio about your style…" style={inputStyle}
                  onFocus={e => e.target.style.borderColor="var(--gold)"} onBlur={e => e.target.style.borderColor="var(--border)"} />
              </div>
              <div style={{ marginBottom:20 }}>
                <label style={labelStyle}>Profile Photo</label>
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  {form.avatarUrl
                    ? <img src={form.avatarUrl} alt="" style={{ width:52, height:52, borderRadius:"50%", objectFit:"cover", border:"2px solid var(--gold)" }} />
                    : <div style={{ width:52, height:52, borderRadius:"50%", background:"var(--bg3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, border:"1.5px dashed var(--border2)" }}>👤</div>
                  }
                  <input type="file" ref={avatarRef} accept="image/*" style={{ display:"none" }} onChange={handleAvatarFile} />
                  <button onClick={() => avatarRef.current?.click()} style={{ fontSize:12, fontWeight:600, color:"var(--gold)", background:"none", border:"1.5px solid var(--gold)", borderRadius:"var(--rp)", padding:"6px 14px", cursor:"pointer" }}>
                    Upload Photo
                  </button>
                </div>
              </div>
            </>
          )}

          {err && <div style={{ color:"var(--rust)", fontSize:12, marginBottom:14, fontWeight:500 }}>{err}</div>}
          <button onClick={handleSubmit} disabled={loading} style={{ width:"100%", padding:"12px", borderRadius:"var(--rp)", background:"linear-gradient(135deg,var(--gold),var(--gold2))", color:"#fff", fontWeight:700, fontSize:14, border:"none", cursor:"pointer", letterSpacing:"0.04em", opacity:loading?.7:1, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
            {loading && <Spinner />}
            {mode==="login" ? "Sign In" : "Create Account"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── PIN CARD ─────────────────────────────────────────────────────────────────
function PinCard({ item, onLike, onSave, onOpen, delay=0 }) {
  const [hover, setHover] = useState(false);
  const [popLike, setPopLike] = useState(false);
  const doLike = (e) => {
    e.stopPropagation();
    if (!item.liked) { setPopLike(true); setTimeout(() => setPopLike(false), 500); }
    onLike(item.id);
  };
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} onClick={() => onOpen(item)}
      style={{ borderRadius:"var(--rl)", overflow:"hidden", background:"var(--white)", boxShadow:hover?"var(--s2)":"var(--s1)", transition:"box-shadow .22s, transform .22s", transform:hover?"translateY(-4px)":"none", cursor:"pointer", marginBottom:14, animationDelay:`${delay}s` }}>
      <div style={{ position:"relative", overflow:"hidden" }}>
        <ImgWithFallback src={item.imageUrl} alt={item.title}
          style={{ width:"100%", aspectRatio:"3/4", display:"block", transition:"transform .4s", transform:hover?"scale(1.04)":"scale(1)" }} />
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top,rgba(26,23,16,.62) 0%,transparent 50%)", opacity:hover?1:0, transition:"opacity .25s", display:"flex", flexDirection:"column", justifyContent:"space-between", alignItems:"flex-end", padding:10 }}>
          <button onClick={e => { e.stopPropagation(); onSave(item.id); }} style={{ width:34, height:34, borderRadius:"50%", background:item.saved?"var(--gold)":"rgba(249,247,244,.92)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, border:"none", cursor:"pointer", transition:"all .2s" }}>
            {item.saved?"★":"☆"}
          </button>
          <button onClick={doLike} style={{ display:"flex", alignItems:"center", gap:4, background:"rgba(249,247,244,.92)", borderRadius:"var(--rp)", padding:"5px 11px", fontSize:12, fontWeight:600, border:"none", cursor:"pointer", color:item.liked?"var(--rust)":"var(--ink)", animation:popLike?"pop .5s ease":"none" }}>
            {item.liked?"♥":"♡"} {item.likes.toLocaleString()}
          </button>
        </div>
      </div>
      <div style={{ padding:"10px 13px 13px" }}>
        <div style={{ fontSize:13, fontWeight:600, color:"var(--ink)", lineHeight:1.35, marginBottom:3 }}>{item.title}</div>
        <div style={{ fontSize:11, color:"var(--ink3)" }}>{item.brand} · <span style={{ color:"var(--gold)", fontWeight:600 }}>{item.price}</span></div>
        <div style={{ fontSize:10, color:"var(--ink3)", marginTop:2 }}>@{item.user}</div>
      </div>
    </div>
  );
}

// ─── MASONRY BOARD ────────────────────────────────────────────────────────────
function MasonryBoard({ items, onLike, onSave, onOpen, cols=3 }) {
  const columns = useMemo(() => {
    const c = Array.from({ length:cols }, () => []);
    items.forEach((it, i) => c[i % cols].push(it));
    return c;
  }, [items, cols]);
  return (
    <div style={{ display:"grid", gridTemplateColumns:`repeat(${cols},1fr)`, gap:14, padding:"18px 20px 100px" }}>
      {columns.map((col, ci) => (
        <div key={ci} style={{ display:"flex", flexDirection:"column" }}>
          {col.map((item, ii) => <PinCard key={item.id} item={item} onLike={onLike} onSave={onSave} onOpen={onOpen} delay={ii*.04+ci*.02} />)}
        </div>
      ))}
    </div>
  );
}

// ─── ADD ITEM MODAL ───────────────────────────────────────────────────────────
function AddModal({ user, onClose, onAdd }) {
  const [form, setForm] = useState({ title:"", brand:"", price:"", category:"Tops", desc:"", tags:"" });
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const valid = form.title && form.brand && form.price && (imagePreview || imageUrl);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = ev => { setImagePreview(ev.target.result); setUploading(false); };
    reader.readAsDataURL(file);
  };

  const handleAdd = () => {
    if (!valid) return;
    const tags = form.tags.split(",").map(t => t.trim().replace(/^#?/,"#")).filter(Boolean);
    if (!tags.length) tags.push(`#${form.category.toLowerCase()}`);
    onAdd({ id:`u_${Date.now()}`, title:form.title, brand:form.brand, price:form.price, category:form.category, desc:form.desc, tags, imageUrl:imagePreview||imageUrl, user:user.username, likes:0, saved:false, liked:false });
    onClose();
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(26,23,16,.6)", zIndex:700, display:"flex", alignItems:"center", justifyContent:"center", padding:16, animation:"fadeIn .2s" }} onClick={onClose}>
      <div style={{ background:"var(--white)", borderRadius:"var(--rl)", width:"100%", maxWidth:540, maxHeight:"92vh", overflowY:"auto", boxShadow:"var(--s3)", animation:"fadeUp .25s" }} onClick={e => e.stopPropagation()}>
        <div style={{ padding:"22px 26px 0", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ fontFamily:"var(--fd)", fontSize:22, fontWeight:700 }}>Add New Item</div>
          <button onClick={onClose} style={{ fontSize:22, color:"var(--ink3)" }}>✕</button>
        </div>
        <div style={{ padding:"18px 26px 28px", display:"flex", flexDirection:"column", gap:16 }}>
          {/* Image upload */}
          <div>
            <label style={labelStyle}>Item Photo *</label>
            <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
              {imagePreview ? (
                <div style={{ position:"relative", flexShrink:0 }}>
                  <img src={imagePreview} alt="" style={{ width:110, height:130, objectFit:"cover", borderRadius:"var(--r)", border:"1.5px solid var(--border)" }} />
                  <button onClick={() => { setImagePreview(""); setImageUrl(""); }} style={{ position:"absolute", top:-8, right:-8, width:22, height:22, borderRadius:"50%", background:"var(--rust)", color:"#fff", fontSize:12, display:"flex", alignItems:"center", justifyContent:"center", border:"none", cursor:"pointer" }}>✕</button>
                </div>
              ) : (
                <div onClick={() => fileRef.current?.click()}
                  style={{ width:110, height:130, borderRadius:"var(--r)", border:"2px dashed var(--border2)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:6, cursor:"pointer", background:"var(--bg2)", flexShrink:0, transition:"border-color .2s" }}
                  onMouseOver={e => e.currentTarget.style.borderColor="var(--gold)"}
                  onMouseOut={e => e.currentTarget.style.borderColor="var(--border2)"}>
                  {uploading ? <Spinner /> : <><span style={{ fontSize:24 }}>📸</span><span style={{ fontSize:10, color:"var(--ink3)", textAlign:"center", lineHeight:1.4 }}>Upload photo</span></>}
                </div>
              )}
              <div style={{ flex:1, display:"flex", flexDirection:"column", gap:8 }}>
                <input type="file" ref={fileRef} accept="image/*" style={{ display:"none" }} onChange={handleFile} />
                <button onClick={() => fileRef.current?.click()} style={{ padding:"9px 14px", borderRadius:"var(--r)", border:"1.5px solid var(--border)", background:"none", fontSize:12, fontWeight:600, color:"var(--ink2)", cursor:"pointer" }}>
                  📁 Choose File
                </button>
                <div style={{ fontSize:11, color:"var(--ink3)" }}>— or paste an image URL —</div>
                <input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://…"
                  style={{ ...inputStyle, fontSize:12, padding:"8px 12px" }}
                  onFocus={e => e.target.style.borderColor="var(--gold)"} onBlur={e => e.target.style.borderColor="var(--border)"} />
                {imageUrl && !imagePreview && (
                  <button onClick={() => setImagePreview(imageUrl)} style={{ fontSize:11, color:"var(--gold)", background:"none", border:"none", cursor:"pointer", textAlign:"left" }}>Preview ↗</button>
                )}
              </div>
            </div>
          </div>
          {[["title","Item Name *"],["brand","Brand *"],["price","Price (e.g. $120) *"]].map(([k,lb]) => (
            <div key={k}>
              <label style={labelStyle}>{lb}</label>
              <input value={form[k]} onChange={e => set(k,e.target.value)} style={inputStyle}
                onFocus={e => e.target.style.borderColor="var(--gold)"} onBlur={e => e.target.style.borderColor="var(--border)"} />
            </div>
          ))}
          <div>
            <label style={labelStyle}>Description</label>
            <textarea value={form.desc} onChange={e => set("desc",e.target.value)} rows={2}
              style={{ ...inputStyle, resize:"none" }} onFocus={e => e.target.style.borderColor="var(--gold)"} onBlur={e => e.target.style.borderColor="var(--border)"} />
          </div>
          <div>
            <label style={labelStyle}>Tags (comma separated)</label>
            <input value={form.tags} onChange={e => set("tags",e.target.value)} placeholder="#minimal, #trench, #classic"
              style={inputStyle} onFocus={e => e.target.style.borderColor="var(--gold)"} onBlur={e => e.target.style.borderColor="var(--border)"} />
          </div>
          <div>
            <label style={labelStyle}>Category</label>
            <select value={form.category} onChange={e => set("category",e.target.value)} style={inputStyle}>
              {CATS.filter(c => c!=="All").map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <button onClick={handleAdd} disabled={!valid} style={{ padding:"12px", borderRadius:"var(--rp)", background:valid?"linear-gradient(135deg,var(--gold),var(--gold2))":"var(--bg3)", color:valid?"#fff":"var(--ink3)", fontWeight:700, fontSize:14, border:"none", cursor:valid?"pointer":"not-allowed", letterSpacing:"0.04em", transition:"all .2s" }}>
            Publish to Board
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── DETAIL MODAL ─────────────────────────────────────────────────────────────
function DetailModal({ item, onClose, onLike, onSave, onAskAI }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(26,23,16,.65)", zIndex:600, display:"flex", alignItems:"center", justifyContent:"center", padding:20, animation:"fadeIn .2s" }} onClick={onClose}>
      <div style={{ background:"var(--white)", borderRadius:"var(--rl)", width:"100%", maxWidth:500, maxHeight:"92vh", overflowY:"auto", boxShadow:"var(--s3)", animation:"fadeUp .25s" }} onClick={e => e.stopPropagation()}>
        <div style={{ position:"relative" }}>
          <ImgWithFallback src={item.imageUrl} alt={item.title} style={{ width:"100%", maxHeight:380, display:"block", borderRadius:"var(--rl) var(--rl) 0 0" }} />
          <button onClick={onClose} style={{ position:"absolute", top:14, right:14, width:34, height:34, borderRadius:"50%", background:"rgba(249,247,244,.9)", fontSize:16, display:"flex", alignItems:"center", justifyContent:"center", border:"none", cursor:"pointer", boxShadow:"var(--s1)" }}>✕</button>
        </div>
        <div style={{ padding:"20px 24px 28px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6 }}>
            <div>
              <div style={{ fontFamily:"var(--fd)", fontSize:24, fontWeight:700, lineHeight:1.2 }}>{item.title}</div>
              <div style={{ fontSize:13, color:"var(--ink3)", marginTop:3 }}>{item.brand}</div>
            </div>
            <div style={{ fontFamily:"var(--fd)", fontSize:24, fontWeight:700, color:"var(--gold)", flexShrink:0, marginLeft:12 }}>{item.price}</div>
          </div>
          {item.desc && <div style={{ fontSize:13, color:"var(--ink2)", lineHeight:1.7, margin:"10px 0 14px" }}>{item.desc}</div>}
          <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:18 }}>
            {item.tags.map(t => <span key={t} style={{ fontSize:11, color:"var(--gold)", fontWeight:600, background:"rgba(184,137,42,.08)", padding:"3px 10px", borderRadius:"var(--rp)" }}>{t}</span>)}
          </div>
          <div style={{ display:"flex", gap:10, marginBottom:12 }}>
            <button onClick={() => onLike(item.id)} style={{ flex:1, padding:"10px", borderRadius:"var(--rp)", border:`1.5px solid ${item.liked?"var(--rust)":"var(--border2)"}`, background:item.liked?"rgba(184,80,48,.06)":"none", color:item.liked?"var(--rust)":"var(--ink2)", fontWeight:600, fontSize:13, cursor:"pointer", transition:"all .2s" }}>
              {item.liked?"♥ Liked":"♡ Like"} · {item.likes.toLocaleString()}
            </button>
            <button onClick={() => onSave(item.id)} style={{ flex:1, padding:"10px", borderRadius:"var(--rp)", border:`1.5px solid ${item.saved?"var(--gold)":"var(--border2)"}`, background:item.saved?"rgba(184,137,42,.08)":"none", color:item.saved?"var(--gold)":"var(--ink2)", fontWeight:600, fontSize:13, cursor:"pointer", transition:"all .2s" }}>
              {item.saved?"★ Saved":"☆ Save"}
            </button>
          </div>
          <button onClick={() => { onAskAI(item); onClose(); }} style={{ width:"100%", padding:"11px", borderRadius:"var(--rp)", background:"var(--ink)", color:"var(--bg)", fontWeight:700, fontSize:13, border:"none", cursor:"pointer", letterSpacing:"0.04em" }}>
            ✦ Ask Sty About This
          </button>
          <div style={{ marginTop:10, fontSize:11, color:"var(--ink3)", textAlign:"center" }}>Posted by @{item.user}</div>
        </div>
      </div>
    </div>
  );
}

// ─── ITEM THUMBNAIL (AI chat) ─────────────────────────────────────────────────
function ItemThumb({ item }) {
  return (
    <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:"var(--r)", padding:"6px 10px 6px 6px", maxWidth:240 }}>
      <ImgWithFallback src={item.imageUrl} alt={item.title} style={{ width:44, height:52, borderRadius:6, flexShrink:0 }} />
      <div>
        <div style={{ fontSize:11, fontWeight:700, color:"var(--ink)", lineHeight:1.3 }}>{item.title}</div>
        <div style={{ fontSize:10, color:"var(--ink3)" }}>{item.brand}</div>
        <div style={{ fontSize:11, color:"var(--gold)", fontWeight:600 }}>{item.price}</div>
      </div>
    </div>
  );
}

// ─── AI PANEL ─────────────────────────────────────────────────────────────────
function AIPanel({ items, user, initMsg, onClose }) {
  const storageKey = `sz_chat_${user.username}`;
  const [msgs, setMsgs] = useState(() => loadState(storageKey, [{
    role:"assistant",
    content:`Hello ${user.displayName}! I'm **Sty** ✦\n\nI can see all ${items.length} items on the board and will show their photos inline when I reference them.\n\nWhat are we styling today?`,
    itemRefs:[]
  }]));
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatRef = useRef(null);
  const sentInit = useRef(false);

  useEffect(() => { saveState(storageKey, msgs); }, [msgs, storageKey]);
  useEffect(() => { chatRef.current?.scrollTo({ top:chatRef.current.scrollHeight, behavior:"smooth" }); }, [msgs, loading]);
  useEffect(() => {
    if (initMsg && !sentInit.current) { sentInit.current = true; send(initMsg, true); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const parseMsg = (text) => {
    const itemRefs = [];
    const clean = text.replace(/<item:([^>]+)>/g, (_, id) => {
      const it = items.find(i => i.id === id);
      if (it && !itemRefs.find(r => r.id === id)) itemRefs.push(it);
      return "";
    });
    return { clean: clean.trim(), itemRefs };
  };

  const send = async (text, silent=false) => {
    const t = (text || input).trim();
    if (!t || loading) return;
    setInput("");
    const userMsg = { role:"user", content:t, itemRefs:[] };
    const newMsgs = silent ? [...msgs] : [...msgs, userMsg];
    if (!silent) setMsgs(newMsgs);
    setLoading(true);
    try {
      const history = (silent ? [...msgs, userMsg] : newMsgs).map(m => ({ role:m.role, content:m.content }));
      const raw = await callAI(history, makeSystem(items, user));
      const { clean, itemRefs } = parseMsg(raw);
      setMsgs(p => [...p, ...(silent ? [userMsg] : []), { role:"assistant", content:clean, itemRefs }]);
    } catch {
      setMsgs(p => [...p, { role:"assistant", content:"Something went wrong — please try again.", itemRefs:[] }]);
    } finally { setLoading(false); }
  };

  const renderText = (text) =>
    text.split("\n").map((line, i) => (
      <div key={i} style={{ marginBottom:line===""?8:0, lineHeight:1.75 }}>
        {line.split(/(\*\*[^*]+\*\*)/g).map((p, j) =>
          p.startsWith("**") && p.endsWith("**")
            ? <strong key={j} style={{ fontWeight:700, color:"var(--gold)" }}>{p.slice(2,-2)}</strong>
            : <span key={j}>{p}</span>
        )}
      </div>
    ));

  const CHIPS = ["Build a full outfit","What's under $300?","Minimalist picks","Pair the leather jacket","Casual weekend look","Best investment pieces"];

  return (
    <div style={{ position:"fixed", bottom:0, right:0, width:420, height:"74vh", background:"var(--white)", borderRadius:"var(--rl) var(--rl) 0 0", boxShadow:"var(--s3)", zIndex:500, display:"flex", flexDirection:"column", border:"1px solid var(--border)", animation:"fadeUp .28s cubic-bezier(.4,0,.2,1)" }}>
      {/* Header */}
      <div style={{ padding:"14px 18px", borderBottom:"1px solid var(--border)", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0, background:"linear-gradient(135deg,var(--ink),var(--ink2))", borderRadius:"var(--rl) var(--rl) 0 0" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:34, height:34, borderRadius:"50%", background:"linear-gradient(135deg,var(--gold),var(--gold2))", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:700, color:"#fff" }}>✦</div>
          <div>
            <div style={{ fontFamily:"var(--fd)", fontSize:16, fontWeight:700, color:"#fff" }}>Sty — AI Stylist</div>
            <div style={{ fontSize:10, color:"rgba(249,247,244,.5)" }}>Chat saved · @{user.username} · {items.length} items</div>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <button onClick={() => { if (window.confirm("Clear chat history?")) { const fresh=[{role:"assistant",content:`Chat cleared. Ready to style you, ${user.displayName}!`,itemRefs:[]}]; setMsgs(fresh); saveState(storageKey,fresh); } }} style={{ fontSize:11, color:"rgba(249,247,244,.45)", background:"none", border:"none", cursor:"pointer" }}>Clear</button>
          <button onClick={onClose} style={{ color:"rgba(249,247,244,.6)", fontSize:20, background:"none", border:"none", cursor:"pointer" }}>✕</button>
        </div>
      </div>

      {/* Chat */}
      <div ref={chatRef} style={{ flex:1, overflowY:"auto", padding:"14px 16px", display:"flex", flexDirection:"column", gap:14 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ alignSelf:m.role==="user"?"flex-end":"flex-start", maxWidth:"88%", animation:"fadeUp .22s ease" }}>
            {m.role==="assistant" && (
              <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:5 }}>
                <div style={{ width:20, height:20, borderRadius:"50%", background:"linear-gradient(135deg,var(--gold),var(--gold2))", display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, color:"#fff", fontWeight:700 }}>✦</div>
                <span style={{ fontSize:10, fontWeight:700, color:"var(--ink3)", letterSpacing:"0.05em" }}>STY</span>
              </div>
            )}
            <div style={{ padding:"9px 13px", fontSize:13, lineHeight:1.65, borderRadius:m.role==="user"?"16px 16px 4px 16px":"4px 16px 16px 16px", background:m.role==="user"?"linear-gradient(135deg,var(--ink),var(--ink2))":"var(--bg2)", color:m.role==="user"?"#fff":"var(--ink2)", border:m.role==="assistant"?"1px solid var(--border)":"none" }}>
              {renderText(m.content)}
            </div>
            {m.itemRefs && m.itemRefs.length > 0 && (
              <div style={{ display:"flex", flexDirection:"column", gap:6, marginTop:6 }}>
                {m.itemRefs.map(it => <ItemThumb key={it.id} item={it} />)}
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div style={{ alignSelf:"flex-start", animation:"fadeIn .2s" }}>
            <div style={{ padding:"10px 14px", background:"var(--bg2)", borderRadius:"4px 16px 16px 16px", border:"1px solid var(--border)", display:"flex", gap:5 }}>
              {[0,1,2].map(j => <div key={j} style={{ width:7, height:7, borderRadius:"50%", background:"var(--border2)", animation:`pulse 1.2s ease-in-out ${j*.2}s infinite` }} />)}
            </div>
          </div>
        )}
      </div>

      {/* Chips */}
      <div style={{ display:"flex", gap:7, padding:"8px 14px", overflowX:"auto", scrollbarWidth:"none", flexShrink:0, borderTop:"1px solid var(--border)" }}>
        {CHIPS.map(c => (
          <button key={c} onClick={() => send(c)} style={{ flexShrink:0, background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:"var(--rp)", padding:"5px 12px", fontSize:11, fontWeight:500, color:"var(--ink2)", cursor:"pointer", whiteSpace:"nowrap", transition:"all .2s" }}
            onMouseOver={e => { e.currentTarget.style.borderColor="var(--gold)"; e.currentTarget.style.color="var(--gold)"; }}
            onMouseOut={e => { e.currentTarget.style.borderColor="var(--border)"; e.currentTarget.style.color="var(--ink2)"; }}>
            {c}
          </button>
        ))}
      </div>

      {/* Input */}
      <div style={{ display:"flex", gap:8, padding:"10px 14px 18px", flexShrink:0 }}>
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key==="Enter") { e.preventDefault(); send(); } }}
          placeholder="Ask about any item or outfit…"
          style={{ flex:1, background:"var(--bg2)", border:"1.5px solid var(--border)", borderRadius:"var(--rp)", padding:"9px 16px", fontSize:13, color:"var(--ink)", outline:"none", transition:"border-color .2s" }}
          onFocus={e => e.target.style.borderColor="var(--gold)"} onBlur={e => e.target.style.borderColor="var(--border)"} />
        <button onClick={() => send()} disabled={!input.trim()||loading} style={{ width:42, height:42, borderRadius:"50%", flexShrink:0, background:input.trim()&&!loading?"linear-gradient(135deg,var(--gold),var(--gold2))":"var(--bg3)", border:"none", fontSize:18, cursor:"pointer", transition:"all .2s", display:"flex", alignItems:"center", justifyContent:"center", opacity:loading?.5:1 }}>→</button>
      </div>
    </div>
  );
}

// ─── PROFILE TAB ──────────────────────────────────────────────────────────────
function ProfileTab({ user, items }) {
  const myItems = items.filter(i => i.user === user.username);
  const TL = [
    { y:"2022", s:"Casual", e:"🎒" },
    { y:"2023", s:"Smart Casual", e:"🧥" },
    { y:"2024", s:"Contemporary", e:"👔" },
    { y:"2025", s:user.styleTag||"Minimalist", e:"✦", cur:true },
  ];
  return (
    <div style={{ maxWidth:760, margin:"0 auto", padding:"24px 22px 80px" }}>
      <div style={{ background:"var(--white)", borderRadius:"var(--rl)", padding:"26px 28px", marginBottom:20, boxShadow:"var(--s1)", display:"flex", gap:22, alignItems:"center", flexWrap:"wrap" }}>
        <div style={{ flexShrink:0 }}>
          {user.avatar
            ? <img src={user.avatar} alt="" style={{ width:84, height:84, borderRadius:"50%", objectFit:"cover", border:"3px solid var(--gold)" }} />
            : <div style={{ width:84, height:84, borderRadius:"50%", background:"linear-gradient(135deg,var(--gold),var(--gold2))", display:"flex", alignItems:"center", justifyContent:"center", fontSize:36, border:"3px solid var(--gold3)" }}>{user.displayName?.[0]||"?"}</div>
          }
        </div>
        <div style={{ flex:1, minWidth:180 }}>
          <div style={{ fontFamily:"var(--fd)", fontSize:24, fontWeight:700, marginBottom:2 }}>{user.displayName}</div>
          <div style={{ fontSize:12, color:"var(--ink3)", marginBottom:6 }}>@{user.username}</div>
          {user.bio && <div style={{ fontSize:13, color:"var(--ink2)", marginBottom:8, lineHeight:1.5 }}>{user.bio}</div>}
          <div style={{ display:"inline-flex", alignItems:"center", gap:5, background:"rgba(184,137,42,.08)", border:"1.5px solid rgba(184,137,42,.25)", color:"var(--gold)", fontSize:11, fontWeight:700, padding:"4px 14px", borderRadius:"var(--rp)" }}>
            ✦ {user.styleTag||"Minimalist"}
          </div>
        </div>
        <div style={{ display:"flex", gap:28, textAlign:"center" }}>
          {[[myItems.length,"Posts"],[items.filter(i=>i.liked).length,"Liked"],[items.filter(i=>i.saved).length,"Saved"]].map(([n,l]) => (
            <div key={l}>
              <div style={{ fontFamily:"var(--fd)", fontSize:24, fontWeight:700 }}>{n}</div>
              <div style={{ fontSize:11, color:"var(--ink3)", fontWeight:500 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ background:"var(--white)", borderRadius:"var(--rl)", padding:"20px 24px", marginBottom:20, boxShadow:"var(--s1)" }}>
        <div style={{ fontFamily:"var(--fd)", fontSize:20, fontWeight:700, marginBottom:3 }}>Style <em style={{ color:"var(--gold)" }}>Evolution</em></div>
        <div style={{ fontSize:12, color:"var(--ink3)", marginBottom:16 }}>AI-detected from your activity</div>
        <div style={{ display:"flex", overflowX:"auto", gap:0 }}>
          {TL.map((t, i) => (
            <div key={t.y} style={{ display:"flex", alignItems:"center", flexShrink:0 }}>
              <div style={{ textAlign:"center" }}>
                <div style={{ width:72, height:72, borderRadius:"var(--r)", background:t.cur?"rgba(184,137,42,.1)":"var(--bg2)", border:t.cur?"2px solid var(--gold)":"1.5px solid var(--border)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:t.cur?26:22, margin:"0 auto 7px" }}>{t.e}</div>
                <div style={{ fontSize:10, fontWeight:700, color:t.cur?"var(--gold)":"var(--ink3)" }}>{t.y}</div>
                <div style={{ fontSize:10, color:t.cur?"var(--gold2)":"var(--ink3)", maxWidth:72, lineHeight:1.3 }}>{t.s}</div>
              </div>
              {i < TL.length-1 && <div style={{ width:26, height:1, background:"var(--border)", margin:"0 5px", marginBottom:22 }} />}
            </div>
          ))}
        </div>
      </div>
      <div style={{ fontFamily:"var(--fd)", fontSize:20, fontWeight:700, marginBottom:12 }}>Your Posts ({myItems.length})</div>
      {myItems.length===0
        ? <div style={{ padding:36, textAlign:"center", color:"var(--ink3)", background:"var(--white)", borderRadius:"var(--rl)", fontSize:14 }}>No posts yet — click <strong>+ Add</strong> to upload your first item.</div>
        : <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
            {myItems.map(it => (
              <div key={it.id} style={{ borderRadius:"var(--r)", overflow:"hidden", background:"var(--white)", boxShadow:"var(--s1)" }}>
                <ImgWithFallback src={it.imageUrl} alt={it.title} style={{ width:"100%", aspectRatio:"3/4" }} />
                <div style={{ padding:"7px 10px" }}>
                  <div style={{ fontSize:11, fontWeight:700, marginBottom:1, lineHeight:1.3 }}>{it.title}</div>
                  <div style={{ fontSize:10, color:"var(--gold)", fontWeight:600 }}>{it.price}</div>
                </div>
              </div>
            ))}
          </div>
      }
    </div>
  );
}

// ─── EDIT PROFILE MODAL ───────────────────────────────────────────────────────
function EditProfileModal({ user, onClose, onSave }) {
  const [form, setForm] = useState({ displayName:user.displayName, bio:user.bio||"", styleTag:user.styleTag||"Minimalist", avatarUrl:user.avatar||"" });
  const fileRef = useRef(null);
  const set = (k, v) => setForm(p => ({ ...p, [k]:v }));
  const STYLES = ["Minimalist","Soft Luxe Minimalist","Scandinavian Minimalist","Dark Academia","Streetwear","Old Money","Preppy","Boho","Y2K"];
  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = ev => set("avatarUrl", ev.target.result);
    r.readAsDataURL(file);
  };
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(26,23,16,.6)", zIndex:800, display:"flex", alignItems:"center", justifyContent:"center", padding:16, animation:"fadeIn .2s" }} onClick={onClose}>
      <div style={{ background:"var(--white)", borderRadius:"var(--rl)", width:"100%", maxWidth:460, boxShadow:"var(--s3)", animation:"fadeUp .25s" }} onClick={e => e.stopPropagation()}>
        <div style={{ padding:"22px 26px 0", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ fontFamily:"var(--fd)", fontSize:20, fontWeight:700 }}>Edit Profile</div>
          <button onClick={onClose} style={{ fontSize:20, color:"var(--ink3)", background:"none", border:"none", cursor:"pointer" }}>✕</button>
        </div>
        <div style={{ padding:"18px 26px 28px", display:"flex", flexDirection:"column", gap:14 }}>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            {form.avatarUrl
              ? <img src={form.avatarUrl} alt="" style={{ width:68, height:68, borderRadius:"50%", objectFit:"cover", border:"2px solid var(--gold)" }} />
              : <div style={{ width:68, height:68, borderRadius:"50%", background:"var(--bg3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28 }}>{user.displayName?.[0]}</div>
            }
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              <input type="file" ref={fileRef} accept="image/*" style={{ display:"none" }} onChange={handleFile} />
              <button onClick={() => fileRef.current?.click()} style={{ fontSize:12, fontWeight:600, color:"var(--gold)", background:"none", border:"1.5px solid var(--gold)", borderRadius:"var(--rp)", padding:"6px 14px", cursor:"pointer" }}>Change Photo</button>
              {form.avatarUrl && <button onClick={() => set("avatarUrl","")} style={{ fontSize:11, color:"var(--rust)", background:"none", border:"none", cursor:"pointer" }}>Remove photo</button>}
            </div>
          </div>
          {[["displayName","Display Name"],["bio","Bio"]].map(([k,lb]) => (
            <div key={k}>
              <label style={labelStyle}>{lb}</label>
              {k==="bio"
                ? <textarea value={form[k]} onChange={e => set(k,e.target.value)} rows={2} style={{ ...inputStyle, resize:"none" }} onFocus={e => e.target.style.borderColor="var(--gold)"} onBlur={e => e.target.style.borderColor="var(--border)"} />
                : <input value={form[k]} onChange={e => set(k,e.target.value)} style={inputStyle} onFocus={e => e.target.style.borderColor="var(--gold)"} onBlur={e => e.target.style.borderColor="var(--border)"} />
              }
            </div>
          ))}
          <div>
            <label style={labelStyle}>Style Identity</label>
            <select value={form.styleTag} onChange={e => set("styleTag",e.target.value)} style={inputStyle}>
              {STYLES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <button onClick={() => { onSave({ ...user, displayName:form.displayName, bio:form.bio, styleTag:form.styleTag, avatar:form.avatarUrl||null }); onClose(); }}
            style={{ padding:"11px", borderRadius:"var(--rp)", background:"linear-gradient(135deg,var(--gold),var(--gold2))", color:"#fff", fontWeight:700, fontSize:14, border:"none", cursor:"pointer", letterSpacing:"0.04em" }}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── SETTINGS TAB ─────────────────────────────────────────────────────────────
function SettingsTab({ user, showToast, onEditProfile, onSignOut }) {
  const [n, setN] = useState({ likes:true, ai:true, followers:true, deals:false });
  const [priv, setPriv] = useState(false);
  const Row = ({ icon, label, sub, right, danger, onClick }) => (
    <div onClick={onClick||(()=>!right&&showToast(label))} style={{ display:"flex", alignItems:"center", gap:12, padding:"13px 22px", borderBottom:"1px solid var(--border)", cursor:"pointer", transition:"background .15s" }}
      onMouseOver={e => e.currentTarget.style.background="var(--bg2)"} onMouseOut={e => e.currentTarget.style.background="none"}>
      <div style={{ width:38, height:38, borderRadius:"var(--r)", background:danger?"rgba(184,80,48,.08)":"var(--bg2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>{icon}</div>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:14, fontWeight:500, color:danger?"var(--rust)":"var(--ink)" }}>{label}</div>
        {sub && <div style={{ fontSize:11, color:"var(--ink3)", marginTop:1 }}>{sub}</div>}
      </div>
      {right !== undefined ? right : <span style={{ color:"var(--ink3)", fontSize:18 }}>›</span>}
    </div>
  );
  return (
    <div style={{ maxWidth:600, margin:"0 auto", paddingBottom:80 }}>
      <div style={{ padding:"20px 22px 12px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:14, background:"var(--white)", borderRadius:"var(--rl)", padding:"16px 18px", boxShadow:"var(--s1)" }}>
          {user.avatar
            ? <img src={user.avatar} alt="" style={{ width:52, height:52, borderRadius:"50%", objectFit:"cover", border:"2px solid var(--gold)", flexShrink:0 }} />
            : <div style={{ width:52, height:52, borderRadius:"50%", background:"linear-gradient(135deg,var(--gold),var(--gold2))", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>{user.displayName?.[0]}</div>
          }
          <div style={{ flex:1 }}>
            <div style={{ fontSize:15, fontWeight:700 }}>{user.displayName}</div>
            <div style={{ fontSize:12, color:"var(--ink3)" }}>@{user.username}</div>
          </div>
          <button onClick={onEditProfile} style={{ fontSize:12, fontWeight:600, color:"var(--gold)", background:"none", border:"1.5px solid var(--gold)", borderRadius:"var(--rp)", padding:"6px 14px", cursor:"pointer" }}>Edit</button>
        </div>
      </div>
      {[
        { s:"Account", rows:[{icon:"@",label:"Username",sub:`@${user.username}`},{icon:"🔑",label:"Password & Security"},{icon:"✉️",label:"Email Address"}]},
        { s:"Privacy", rows:[{icon:"👁",label:"Private Account",right:<Tog on={priv} onChange={v=>{setPriv(v);showToast(v?"Account is private":"Account is public");}}/>},{icon:"🚫",label:"Blocked Users",sub:"0 blocked"},{icon:"⚠️",label:"Report a User"}]},
        { s:"Notifications", rows:[{icon:"❤️",label:"Likes & Saves",right:<Tog on={n.likes} onChange={v=>setN(p=>({...p,likes:v}))}/>},{icon:"✦",label:"AI Stylist",right:<Tog on={n.ai} onChange={v=>setN(p=>({...p,ai:v}))}/>},{icon:"👥",label:"New Followers",right:<Tog on={n.followers} onChange={v=>setN(p=>({...p,followers:v}))}/>},{icon:"🛍",label:"Shop Drops",right:<Tog on={n.deals} onChange={v=>setN(p=>({...p,deals:v}))}/>}]},
        { s:"Support", rows:[{icon:"🛠",label:"Tech Problems"},{icon:"📋",label:"Terms & Policies"},{icon:"🔒",label:"Privacy Policy"}]},
      ].map(({ s, rows }) => (
        <div key={s}>
          <div style={{ padding:"12px 22px 4px", fontSize:10, fontWeight:700, color:"var(--ink3)", letterSpacing:"0.09em", textTransform:"uppercase" }}>{s}</div>
          {rows.map(r => <Row key={r.label} {...r} />)}
        </div>
      ))}
      <Row icon="🚪" label="Sign Out" danger onClick={onSignOut} right={null} />
    </div>
  );
}

// ─── TOP BAR ──────────────────────────────────────────────────────────────────
function TopBar({ tab, setTab, onAdd, onAI, aiOpen, query, setQuery, user }) {
  return (
    <div style={{ position:"sticky", top:0, zIndex:200, background:"rgba(249,247,244,.97)", backdropFilter:"blur(14px)", borderBottom:"1px solid var(--border)" }}>
      <div style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 20px" }}>
        <Logo size={26} />
        <div style={{ flex:1, display:"flex", alignItems:"center", gap:9, background:"var(--bg2)", borderRadius:"var(--rp)", padding:"8px 16px", border:"1.5px solid var(--border)" }}>
          <span style={{ color:"var(--ink3)", fontSize:13 }}>🔍</span>
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search items, brands, tags…"
            style={{ flex:1, background:"none", border:"none", outline:"none", fontSize:13, color:"var(--ink)", fontFamily:"var(--fb)" }} />
          {query && <button onClick={() => setQuery("")} style={{ color:"var(--ink3)", fontSize:14, background:"none", border:"none", cursor:"pointer" }}>✕</button>}
        </div>
        <button onClick={onAdd} style={{ display:"flex", alignItems:"center", gap:5, background:"linear-gradient(135deg,var(--gold),var(--gold2))", color:"#fff", fontWeight:700, fontSize:12, padding:"8px 15px", borderRadius:"var(--rp)", border:"none", whiteSpace:"nowrap", letterSpacing:"0.04em", cursor:"pointer" }}>＋ Add</button>
        <button onClick={onAI} style={{ display:"flex", alignItems:"center", gap:5, background:aiOpen?"var(--ink)":"var(--bg2)", color:aiOpen?"#fff":"var(--ink2)", fontWeight:700, fontSize:12, padding:"8px 15px", borderRadius:"var(--rp)", border:"1.5px solid var(--border)", whiteSpace:"nowrap", transition:"all .2s", cursor:"pointer" }}>✦ Sty</button>
        <button onClick={() => setTab("Profile")} style={{ flexShrink:0, padding:0, border:`2px solid ${tab==="Profile"?"var(--gold)":"transparent"}`, borderRadius:"50%", transition:"border-color .2s", cursor:"pointer", background:"none" }}>
          {user.avatar
            ? <img src={user.avatar} alt="" style={{ width:34, height:34, borderRadius:"50%", objectFit:"cover", display:"block" }} />
            : <div style={{ width:34, height:34, borderRadius:"50%", background:"linear-gradient(135deg,var(--gold),var(--gold2))", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, color:"#fff", fontWeight:700 }}>{user.displayName?.[0]}</div>
          }
        </button>
      </div>
      <div style={{ display:"flex", gap:0, padding:"0 20px", borderTop:"1px solid var(--border)" }}>
        {["Board","Saved","Profile","Settings"].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding:"9px 18px", fontSize:13, fontWeight:600, color:tab===t?"var(--ink)":"var(--ink3)", borderBottom:tab===t?"2.5px solid var(--gold)":"2.5px solid transparent", background:"none", border:"none", cursor:"pointer", transition:"all .2s" }}>{t}</button>
        ))}
      </div>
    </div>
  );
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(() => {
    const uname = loadState("sz_session", null);
    if (!uname) return null;
    const defaultAccounts = DEMO_ACCOUNTS.reduce((acc, a) => { acc[a.username] = a; return acc; }, {});
    const accounts = loadState("sz_accounts", defaultAccounts);
    return accounts[uname] || null;
  });

  const [items, setItems] = useState(() => loadState("sz_items", SEED_ITEMS));
  useEffect(() => { saveState("sz_items", items); }, [items]);

  const [tab, setTab] = useState("Board");
  const [cat, setCat] = useState("All");
  const [query, setQuery] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiInitMsg, setAiInitMsg] = useState(null);
  const [detail, setDetail] = useState(null);
  const [editProfile, setEditProfile] = useState(false);
  const [toast, setToast] = useState("");
  const toastRef = useRef(null);

  const showToast = useCallback((msg) => {
    setToast(msg); clearTimeout(toastRef.current);
    toastRef.current = setTimeout(() => setToast(""), 2400);
  }, []);

  const handleLike = useCallback((id) => {
    setItems(p => p.map(it => it.id===id ? { ...it, liked:!it.liked, likes:it.liked?it.likes-1:it.likes+1 } : it));
    setDetail(d => d?.id===id ? { ...d, liked:!d.liked, likes:d.liked?d.likes-1:d.likes+1 } : d);
    showToast("❤️ Liked");
  }, [showToast]);

  const handleSave = useCallback((id) => {
    setItems(p => p.map(it => it.id===id ? { ...it, saved:!it.saved } : it));
    setDetail(d => d?.id===id ? { ...d, saved:!d.saved } : d);
    const it = items.find(i => i.id===id);
    showToast(it?.saved ? "Removed from saved" : "★ Saved!");
  }, [items, showToast]);

  const handleAdd = useCallback((newItem) => {
    setItems(p => [newItem, ...p]);
    showToast("✦ Published to the board!");
  }, [showToast]);

  const handleAskAI = useCallback((item) => {
    setAiInitMsg(`I'm looking at **"${item.title}"** by ${item.brand} (${item.price}). Can you build a complete outfit around it using other items on the board? Show me the images.`);
    setAiOpen(true);
  }, []);

  const handleSaveProfile = useCallback((updated) => {
    setUser(updated);
    const defaultAccounts = DEMO_ACCOUNTS.reduce((acc, a) => { acc[a.username] = a; return acc; }, {});
    const accounts = loadState("sz_accounts", defaultAccounts);
    accounts[updated.username] = updated;
    saveState("sz_accounts", accounts);
    showToast("Profile updated!");
  }, [showToast]);

  const handleSignOut = useCallback(() => {
    localStorage.removeItem("sz_session");
    setUser(null);
    setAiOpen(false);
  }, []);

  const visible = useMemo(() => items.filter(it => {
    if (cat!=="All" && it.category!==cat) return false;
    if (query) {
      const q = query.toLowerCase();
      return it.title.toLowerCase().includes(q) || it.brand.toLowerCase().includes(q) || it.tags.some(t => t.toLowerCase().includes(q)) || it.user.toLowerCase().includes(q);
    }
    return true;
  }), [items, cat, query]);

  if (!user) return <AuthScreen onAuth={u => setUser(u)} />;

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)" }}>
      <TopBar tab={tab} setTab={setTab} onAdd={() => setAddOpen(true)} onAI={() => { setAiInitMsg(null); setAiOpen(p => !p); }} aiOpen={aiOpen} query={query} setQuery={setQuery} user={user} />

      {tab==="Board" && (
        <div style={{ display:"flex", gap:8, padding:"10px 20px 8px", overflowX:"auto", scrollbarWidth:"none", borderBottom:"1px solid var(--border)", background:"var(--white)" }}>
          {CATS.map(c => <Pill key={c} active={cat===c} onClick={() => setCat(c)}>{c}</Pill>)}
        </div>
      )}

      {tab==="Board" && (
        visible.length===0
          ? <div style={{ padding:64, textAlign:"center", color:"var(--ink3)" }}>
              <div style={{ fontFamily:"var(--fd)", fontSize:22, fontWeight:700, marginBottom:8 }}>No items found</div>
              <div style={{ fontSize:14 }}>Try a different search or category.</div>
            </div>
          : <MasonryBoard items={visible} onLike={handleLike} onSave={handleSave} onOpen={setDetail} />
      )}
      {tab==="Saved" && (
        <>
          <div style={{ padding:"18px 22px 4px", fontFamily:"var(--fd)", fontSize:24, fontWeight:700 }}>Saved Items</div>
          {items.filter(i=>i.saved).length===0
            ? <div style={{ padding:64, textAlign:"center", color:"var(--ink3)" }}>
                <div style={{ fontFamily:"var(--fd)", fontSize:20, fontWeight:700, marginBottom:8 }}>Nothing saved yet</div>
                <div style={{ fontSize:13 }}>Hover any item and click ☆ to save it here.</div>
              </div>
            : <MasonryBoard items={items.filter(i=>i.saved)} onLike={handleLike} onSave={handleSave} onOpen={setDetail} />
          }
        </>
      )}
      {tab==="Profile" && <ProfileTab user={user} items={items} />}
      {tab==="Settings" && <SettingsTab user={user} showToast={showToast} onEditProfile={() => setEditProfile(true)} onSignOut={handleSignOut} />}

      {addOpen && <AddModal user={user} onClose={() => setAddOpen(false)} onAdd={handleAdd} />}
      {detail && <DetailModal item={detail} onClose={() => setDetail(null)} onLike={handleLike} onSave={handleSave} onAskAI={handleAskAI} />}
      {aiOpen && <AIPanel items={items} user={user} initMsg={aiInitMsg} onClose={() => { setAiOpen(false); setAiInitMsg(null); }} />}
      {editProfile && <EditProfileModal user={user} onClose={() => setEditProfile(false)} onSave={handleSaveProfile} />}

      <Toast msg={toast} />
    </div>
  );
}