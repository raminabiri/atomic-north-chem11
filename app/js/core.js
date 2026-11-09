/* Atomic North — core: state, XP, badges, review deck, router, helpers */
(function () {
  const KEY = "atomic-north-v1";
  const DAY = 86400000;
  const fresh = () => ({ profile: { name: "", level: "std", theme: "light", onboarded: false, rate: 1 }, xp: 0, streak: 0, lastDay: null, cards: {}, q: {}, review: {}, badges: {}, labs: {}, boss: { best: 0 }, mf: { best: 0 }, explain: {}, ai: { key: "", model: "claude-opus-5-5" }, last: null, reviewCleared: 0 });
  let S;
  try { S = Object.assign(fresh(), JSON.parse(localStorage.getItem(KEY) || "{}")); } catch (e) { S = fresh(); }
  S.profile = Object.assign(fresh().profile, S.profile); S.ai = Object.assign(fresh().ai, S.ai);
  AN.S = S;
  AN.save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { } };
  AN.reset = () => { S = AN.S = fresh(); AN.save(); };

  /* ---------- helpers ---------- */
  AN.$ = (sel, root = document) => root.querySelector(sel);
  AN.$$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  AN.h = (html) => { const t = document.createElement("template"); t.innerHTML = html.trim(); return t.content.firstElementChild; };
  AN.esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  AN.shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  AN.icon = (id, cls = "icon") => `<svg class="${cls}" aria-hidden="true"><use href="#i-${id}"/></svg>`;
  AN.LV = { 1: { name: "Foundation", icon: "sprout", cls: "p1", xp: 10 }, 2: { name: "Intermediate", icon: "flame", cls: "p2", xp: 20 }, 3: { name: "Advanced", icon: "rocket", cls: "p3", xp: 30 } };
  AN.lvPill = (l, extra = "") => `<span class="pill ${AN.LV[l].cls}">${AN.icon(AN.LV[l].icon)}${AN.LV[l].name}${extra}</span>`;
  AN.today = () => new Date().toISOString().slice(0, 10);

  /* ---------- toasts ---------- */
  AN.toast = (msg) => {
    let box = AN.$(".toasts"); if (!box) { box = AN.h(`<div class="toasts" aria-live="polite"></div>`); document.body.appendChild(box); }
    const t = AN.h(`<div class="toast">${msg}</div>`); box.appendChild(t); while (box.children.length > 3) box.firstElementChild.remove(); setTimeout(() => t.remove(), 3200);
  };

  /* ---------- streak & XP ---------- */
  AN.touchDay = () => {
    const d = AN.today(); if (S.lastDay === d) return;
    const y = new Date(Date.now() - DAY).toISOString().slice(0, 10);
    S.streak = S.lastDay === y ? S.streak + 1 : 1; S.lastDay = d; AN.save();
    if (S.streak >= 3) AN.badge("streak3"); if (S.streak >= 7) AN.badge("streak7");
  };
  AN.level = () => Math.floor(S.xp / 300) + 1;
  AN.cardsUnlocked = () => Math.min(118, 1 + Math.floor(S.xp / 60));
  AN.addXP = (n, why) => {
    if (!n) return; const beforeLvl = AN.level(), beforeCards = AN.cardsUnlocked();
    S.xp += n; AN.touchDay(); AN.save();
    AN.toast(`+${n} XP${why ? " · " + why : ""}`);
    if (AN.level() > beforeLvl) AN.toast(`Level up! You're now level ${AN.level()}`);
    if (AN.cardsUnlocked() > beforeCards) { const e = AN.ELEMENTS[AN.cardsUnlocked() - 1]; AN.toast(`New element card: ${e.name} (${e.sym})`); }
    AN.refreshChrome && AN.refreshChrome();
  };

  /* ---------- badges ---------- */
  AN.BADGES = [
    { id: "first", name: "First Spark", desc: "Finish your first lesson card", icon: "bulb" },
    { id: "sec-1-1", name: "Matter Sorter", desc: "Finish all of section 1.1", icon: "book" },
    { id: "sec-1-2", name: "Model Maker", desc: "Finish all of section 1.2", icon: "book" },
    { id: "sec-1-3", name: "Isotope Investigator", desc: "Finish all of section 1.3", icon: "book" },
    { id: "sec-1-4", name: "Light Reader", desc: "Finish all of section 1.4", icon: "book" },
    { id: "sec-1-5", name: "Trend Spotter", desc: "Finish all of section 1.5", icon: "book" },
    { id: "lv1", name: "Rooted", desc: "Solve 10 Foundation questions", icon: "sprout" },
    { id: "lv2", name: "Heating Up", desc: "Solve 10 Intermediate questions", icon: "flame" },
    { id: "lv3", name: "Lift-off", desc: "Solve 5 Advanced questions", icon: "rocket" },
    { id: "streak3", name: "On a Roll", desc: "3-day streak", icon: "fire" },
    { id: "streak7", name: "Unstoppable", desc: "7-day streak", icon: "fire" },
    { id: "flame", name: "Flame Detective", desc: "Identify all four unknowns in the Flame Test Lab", icon: "flask" },
    { id: "labrat", name: "Lab Rat", desc: "Try 4 different virtual labs", icon: "flask" },
    { id: "myth", name: "Myth Buster", desc: "Score 15+ in Myth or Fact", icon: "target" },
    { id: "fixer", name: "Fixer", desc: "Clear 5 items from Fix My Mistakes", icon: "redo" },
    { id: "explainer", name: "Teacher Mode", desc: "Explain a topic to a friend", icon: "chat" },
    { id: "atomarch", name: "Atom Architect", desc: "Score 80%+ on the Chapter Boss Challenge", icon: "star" },
    { id: "builder", name: "Atom Builder", desc: "Complete 4 Atom Builder challenges", icon: "atom" }
  ];
  AN.badge = (id) => {
    if (S.badges[id]) return; const b = AN.BADGES.find(x => x.id === id); if (!b) return;
    S.badges[id] = Date.now(); AN.save(); AN.toast(`Badge unlocked: ${b.name}`);
  };
  AN.labVisit = (id) => { S.labs[id] = S.labs[id] || Date.now(); AN.save(); if (Object.keys(S.labs).length >= 4) AN.badge("labrat"); };

  /* ---------- question records & review deck ---------- */
  AN.record = (q, { correct, attempts, conf, mode }) => {
    const r = S.q[q.id] || { tries: 0, solved: false };
    const firstSolve = correct && !r.solved;
    r.tries += attempts; r.last = Date.now(); r.conf = conf;
    if (correct) r.solved = true;
    S.q[q.id] = r;
    // review deck: missed at least once, or guessed right
    if (mode !== "review" && mode !== "predict" && (attempts > 1 || !correct || conf === "guess")) {
      if (!S.review[q.id]) S.review[q.id] = { box: 1, due: Date.now() };
    }
    let xp = 0;
    if (firstSolve && mode !== "review") {
      xp = mode === "predict" ? 5 : mode === "check" ? 10 : AN.LV[q.lvl || 1].xp;
      if (attempts === 1) xp += 5;
    }
    AN.save();
    if (firstSolve) {
      const solvedAt = l => Object.entries(S.q).filter(([id, v]) => v.solved && AN.qById(id)?.lvl === l && /-p\d+$/.test(id)).length;
      if (solvedAt(1) >= 10) AN.badge("lv1"); if (solvedAt(2) >= 10) AN.badge("lv2"); if (solvedAt(3) >= 5) AN.badge("lv3");
    }
    if (xp) AN.addXP(xp, attempts === 1 ? "first try!" : "");
    AN.refreshChrome && AN.refreshChrome();
  };
  AN.reviewResult = (q, correct) => {
    const r = S.review[q.id]; if (!r) return;
    if (correct) {
      r.box++; if (r.box > 3) { delete S.review[q.id]; S.reviewCleared++; AN.addXP(10, "mistake fixed"); if (S.reviewCleared >= 5) AN.badge("fixer"); }
      else r.due = Date.now() + [0, DAY, 3 * DAY, 7 * DAY][r.box - 1];
    } else { r.box = 1; r.due = Date.now() + DAY / 2; }
    AN.save(); AN.refreshChrome && AN.refreshChrome();
  };
  AN.reviewDue = () => Object.entries(S.review).filter(([, r]) => r.due <= Date.now()).map(([id]) => AN.qById(id)).filter(Boolean);

  AN.allQuestions = () => {
    if (AN._allQ) return AN._allQ;
    const out = [];
    AN.CH1.sections.forEach(s => { s.cards.forEach(c => { if (c.check) out.push(c.check); }); s.practice.forEach(q => out.push(q)); });
    return (AN._allQ = out);
  };
  AN.qById = id => AN.allQuestions().find(q => q.id === id);

  /* ---------- progress ---------- */
  AN.secProgress = (s) => { const done = s.cards.filter(c => S.cards[c.id]).length; return { done, total: s.cards.length, pct: Math.round(done / s.cards.length * 100) }; };
  AN.secPractice = (s) => { const solved = s.practice.filter(q => S.q[q.id]?.solved).length; return { solved, total: s.practice.length }; };
  AN.chapterPct = () => { let d = 0, t = 0; AN.CH1.sections.forEach(s => { const p = AN.secProgress(s); d += p.done; t += p.total; }); return Math.round(d / t * 100); };
  AN.markCard = (s, c) => {
    if (S.cards[c.id]) return; S.cards[c.id] = Date.now(); AN.save(); AN.badge("first");
    if (AN.secProgress(s).done === s.cards.length) AN.badge("sec-" + s.id);
  };

  /* ---------- read aloud ---------- */
  AN.speak = (html, btn) => {
    if (!("speechSynthesis" in window)) { AN.toast("Read aloud isn't supported on this device."); return; }
    if (speechSynthesis.speaking) { speechSynthesis.cancel(); AN.$$(".speak").forEach(b => b.setAttribute("aria-pressed", "false")); return; }
    const d = document.createElement("div"); d.innerHTML = html; d.querySelectorAll("svg,table,.callout .ch").forEach(n => n.remove());
    const u = new SpeechSynthesisUtterance(d.textContent.replace(/\s+/g, " ").trim());
    const voices = speechSynthesis.getVoices();
    u.voice = voices.find(v => v.lang === "en-CA") || voices.find(v => v.lang.startsWith("en")) || null;
    u.lang = "en-CA"; u.rate = S.profile.rate || 1;
    u.onend = () => btn && btn.setAttribute("aria-pressed", "false");
    btn && btn.setAttribute("aria-pressed", "true");
    speechSynthesis.speak(u);
  };

  /* ---------- theme ---------- */
  AN.applyTheme = () => { document.documentElement.dataset.theme = S.profile.theme === "dark" ? "dark" : "light"; };
  AN.applyTheme();

  /* ---------- router ---------- */
  AN.routes = {};
  AN.route = () => {
    if ("speechSynthesis" in window) speechSynthesis.cancel();
    const hash = (location.hash || "#home").slice(1);
    let name = hash, arg = null;
    const m = hash.match(/^(learn|practice)-(\d-\d)$/); if (m) { name = m[1]; arg = m[2]; }
    const fn = AN.routes[name] || AN.routes.home;
    const main = AN.$("#view"); main.innerHTML = "";
    fn(main, arg);
    AN.$$(".nav a").forEach(a => a.setAttribute("aria-current", a.dataset.nav === (AN.navOf[name] || name) ? "page" : "false"));
    window.scrollTo(0, 0);
    AN.refreshChrome && AN.refreshChrome();
  };
  AN.navOf = { learn: "lessons", boss: "practice", myth: "practice", "lab-flame": "labs", "lab-halflife": "labs", "lab-box": "labs", "lab-foil": "labs", "lab-atom": "labs", "lab-trend": "labs", "lab-alkali": "labs", table: "labs" };
  window.addEventListener("hashchange", AN.route);
})();
