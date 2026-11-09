/* Atomic North — pages */
(function () {
  const { h, icon, esc, shuffle } = AN;
  const R = AN.routes; const S = () => AN.S;
  const CH = AN.CH1;
  let cleanup = null;
  const wrapRoute = (fn) => (v, arg) => { if (cleanup) { try { cleanup(); } catch (e) { } cleanup = null; } const c = fn(v, arg); if (typeof c === "function") cleanup = c; };

  const hello = () => { const n = S().profile.name; const hr = new Date().getHours(); const g = hr < 12 ? "Good morning" : hr < 18 ? "Hey" : "Good evening"; return `${g}${n ? ", " + esc(n) : ""}!`; };
  const nextCard = () => {
    for (const s of CH.sections) { const i = s.cards.findIndex(c => !S().cards[c.id]); if (i >= 0) return { s, i }; }
    return null;
  };
  const stats = () => `<div class="stats"><span class="chip" style="color:var(--lvl2)">${icon("fire")}<b>${S().streak}</b> day streak</span><span class="chip" style="color:var(--grape)">${icon("star")}<b>${S().xp.toLocaleString("en-CA")}</b> XP · Lv ${AN.level()}</span><button class="round-btn" id="themeBtn" aria-label="Switch light or dark mode">${icon(S().profile.theme === "dark" ? "sun" : "moon")}</button></div>`;
  const bindTheme = (v) => { const b = AN.$("#themeBtn", v); if (b) b.onclick = () => { S().profile.theme = S().profile.theme === "dark" ? "light" : "dark"; AN.save(); AN.applyTheme(); b.innerHTML = icon(S().profile.theme === "dark" ? "sun" : "moon"); }; };

  /* ================= Dashboard ================= */
  R.home = wrapRoute((v) => {
    const nx = nextCard(); const pct = AN.chapterPct();
    const due = AN.reviewDue();
    const curSec = nx ? nx.s : CH.sections[CH.sections.length - 1];
    const sp = AN.secProgress(curSec);
    const ring = (p) => `<svg class="ring" viewBox="0 0 120 120" aria-label="${p}% complete"><circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,.25)" stroke-width="12"/><circle cx="60" cy="60" r="50" fill="none" stroke="#fff" stroke-width="12" stroke-linecap="round" stroke-dasharray="${3.1416 * p} 314.2" transform="rotate(-90 60 60)"/><text x="60" y="58" text-anchor="middle" fill="#fff" font-family="JetBrains Mono, monospace" font-weight="700" font-size="26">${p}%</text><text x="60" y="78" text-anchor="middle" fill="#fff" font-size="11" opacity=".85">of ${curSec.num}</text></svg>`;
    const unl = AN.cardsUnlocked();
    v.appendChild(h(`<div class="wrap">
      <header class="top"><div><h1>${hello()} Ready to split some atoms?</h1><p class="sub">Chapter 1 · The Nature of Matter. You're ${pct}% of the way through.</p></div>${stats()}</header>
      <div class="grid">
        <section class="card hero s12">
          <svg class="bg-atom" viewBox="0 0 40 40" aria-hidden="true"><g fill="none" stroke="#fff" stroke-width="1.2"><ellipse cx="20" cy="20" rx="17" ry="7"/><ellipse cx="20" cy="20" rx="17" ry="7" transform="rotate(60 20 20)"/><ellipse cx="20" cy="20" rx="17" ry="7" transform="rotate(120 20 20)"/></g></svg>
          ${ring(sp.pct)}
          <div class="body"><div class="eyebrow">${nx ? (Object.keys(S().cards).length ? "Pick up where you left off" : "Start here") : "Chapter complete!"}</div>
            <h2>${nx ? `${nx.s.num} ${nx.s.title}` : "You've finished every lesson card"}</h2>
            <p>${nx ? `Next card: “${nx.s.cards[nx.i].title}”.` : "Now take on the Chapter Boss Challenge, or clear your review deck."}</p>
            <div class="row"><a class="btn btn-light" href="${nx ? "#learn-" + nx.s.id : "#boss"}">${nx ? (Object.keys(S().cards).length ? "Continue lesson" : "Start lesson 1.1") : "Boss Challenge"}</a><a class="btn btn-ghost" href="#myth">Myth or Fact warm-up</a></div></div>
        </section>
        <section class="card s8"><div class="eyebrow">Chapter 1 map</div><h2>The Nature of Matter</h2><div class="path">
          ${CH.sections.map(s => { const p = AN.secProgress(s); const cls = p.done === p.total ? "done" : (nx && nx.s === s ? "now" : ""); return `<a class="step ${cls}" href="#learn-${s.id}"><div class="num">${s.num}</div><div><h3>${s.title}</h3><div class="meta">${s.cards.length} cards · ${s.practice.length} practice questions · ${s.labs.map(l => l.label).join(", ")}</div></div><div class="bar"><i style="width:${p.pct}%"></i></div></a>`; }).join("")}
          <a class="step boss" href="#boss"><div class="num">★</div><div><h3>Chapter Boss Challenge</h3><div class="meta">15 mixed questions · best score ${S().boss.best}% · unlocks “Atom Architect”</div></div><div class="bar"><i style="width:${S().boss.best}%"></i></div></a>
        </div></section>
        <section class="card s4"><div class="eyebrow">How to read the icons</div><h2>Levels &amp; labels</h2><div class="legend">
          <div class="lrow">${AN.lvPill(1)}Core skills. Start here.</div>
          <div class="lrow">${AN.lvPill(2)}Apply ideas in new situations.</div>
          <div class="lrow">${AN.lvPill(3)}Multi-step and test-level problems.</div>
          <div class="lrow"><span class="pill pb">${icon("scope")}Beyond the Book</span>Extra depth. Not on your test.</div>
          <div class="lrow"><span class="pill pc">${icon("leaf")}Canada Connection</span>Chemistry happening here at home.</div>
        </div></section>
        <section class="card s6" id="qotd"><div class="eyebrow">Question of the day</div></section>
        <section class="card s6"><div class="eyebrow">Fix my mistakes</div><h2>${due.length ? `${due.length} question${due.length > 1 ? "s" : ""} to review` : "Review deck is clear"}</h2>
          <p class="small muted" style="margin-top:0">Questions you missed, or guessed right, come back here until you've got them for real.</p>
          <div class="mini-list">${due.slice(0, 3).map(q => `<div class="it"><span>${q.q.replace(/<[^>]+>/g, "").slice(0, 70)}…</span><span class="muted">due</span></div>`).join("") || `<div class="it"><span>Nothing due. Nice!</span><span>✓</span></div>`}</div>
          ${due.length ? `<a class="btn btn-main" style="margin-top:12px" href="#review">Review now</a>` : ""}
          <div class="eyebrow" style="margin-top:18px">AI Tutor</div><p class="small" style="margin:0">${S().ai.key ? `<b style="color:var(--good)">● On</b>. Ask anything about Chapter 1. <a href="#tutor">Open the tutor</a>` : `<b>Off.</b> Add your own Claude API key in <a href="#settings">Settings</a> to get written answers marked and chat help. You pay your own usage costs.`}</p>
        </section>
        <section class="card s8"><div class="eyebrow">Virtual labs in this chapter</div><h2>Try it before the real lab</h2><div class="labs-grid">${AN.LABS.list.map(l => `<a class="lab-tile" href="${l.href}">${l.svg}<b>${l.name}</b><span>${l.desc}</span></a>`).join("")}</div></section>
        <section class="card s4"><div class="eyebrow">Element collection · ${unl} of 118</div><h2>Your cards</h2>
          <div class="tiles">${AN.ELEMENTS.slice(0, Math.max(18, unl + 3)).slice(0, 24).map(e => e.z <= unl ? `<div class="tile got" style="background:${["#7B4FD8", "#0E9F94", "#E2402F", "#3B5BDB", "#C2338F", "#D9690A"][e.z % 6]}" title="${e.name}"><small>${e.z}</small><b>${e.sym}</b><span class="nm">${e.name}</span></div>` : `<div class="tile lock"><small>${e.z}</small><b>?</b></div>`).join("")}</div>
          <p class="small muted" style="margin:10px 0 0">Every 60 XP unlocks the next element card. <a href="#badges">See all badges</a></p></section>
      </div></div>`));
    bindTheme(v);
    // question of the day: deterministic by date, from Foundation/Intermediate
    const pool = AN.allQuestions().filter(q => q.type !== "text" && (q.lvl || 1) <= 2);
    const seed = AN.today().split("-").reduce((a, b) => a * 31 + +b, 7);
    const q = pool[seed % pool.length];
    AN.$("#qotd", v).appendChild(AN.Q(q, { mode: "practice" }));
  });

  /* ================= Lessons list ================= */
  R.lessons = wrapRoute((v) => {
    v.appendChild(h(`<div class="wrap"><header class="top"><div><h1>Lessons</h1><p class="sub">Chapter 1 · The Nature of Matter. Five sections, each a short set of interactive cards.</p></div>${stats()}</header>
      <div class="stack">${CH.sections.map(s => { const p = AN.secProgress(s), pr = AN.secPractice(s); return `<div class="card"><div class="row" style="justify-content:space-between"><div style="min-width:0;flex:1 1 300px"><div class="eyebrow">Section ${s.num}</div><h2 style="margin-bottom:4px">${s.title}</h2><p class="muted" style="margin:0">${s.blurb}</p></div>
        <div class="row"><a class="btn btn-main" href="#learn-${s.id}">${p.done ? (p.done === p.total ? "Review" : "Continue") : "Start"}</a><a class="btn btn-soft" href="#practice-${s.id}">Practice</a></div></div>
        <div class="row small muted" style="margin-top:12px;gap:18px"><span>Cards ${p.done}/${p.total}</span><div class="bar" style="flex:1;min-width:120px"><i style="width:${p.pct}%"></i></div><span>Practice solved ${pr.solved}/${pr.total}</span></div></div>`; }).join("")}</div></div>`));
    bindTheme(v);
  });

  /* ================= Lesson player ================= */
  R.learn = wrapRoute((v, sid) => {
    const s = CH.sections.find(x => x.id === sid) || CH.sections[0];
    let idx = s.cards.findIndex(c => !S().cards[c.id]); if (idx < 0) idx = 0;
    if (S().last && S().last.sec === s.id && S().last.idx < s.cards.length) idx = S().last.idx;
    v.appendChild(h(`<div class="wrap"><div class="lesson-head"><div><a href="#lessons" class="small">← All lessons</a><h1 style="font-size:clamp(22px,2.8vw,30px)">${s.num} ${s.title}</h1></div>
      <div class="dots" role="tablist" aria-label="Cards">${s.cards.map((c, i) => `<button role="tab" data-i="${i}" title="${esc(c.title)}">${i + 1}</button>`).join("")}<button role="tab" data-i="${s.cards.length}" title="Wrap-up">★</button></div></div>
      <div id="card-slot"></div></div>`));
    const slot = AN.$("#card-slot", v);
    const dots = () => AN.$$(".dots button", v).forEach(b => { const i = +b.dataset.i; b.classList.toggle("done", i < s.cards.length && !!S().cards[s.cards[i].id]); b.setAttribute("aria-current", i === idx ? "step" : "false"); b.onclick = () => { idx = i; show(); }; });
    const show = () => {
      if ("speechSynthesis" in window) speechSynthesis.cancel();
      S().last = { sec: s.id, idx }; AN.save(); dots(); slot.innerHTML = ""; window.scrollTo(0, 0);
      if (idx >= s.cards.length) return wrapUp();
      const c = s.cards[idx]; let lvl = S().profile.level;
      const card = h(`<article class="card lesson-card"><div class="row" style="justify-content:space-between"><div class="eyebrow">Card ${idx + 1} of ${s.cards.length}</div>
        <div class="row"><div class="seg" role="group" aria-label="Explanation level"><button data-l="simple">Explain it simpler</button><button data-l="std">Standard</button><button data-l="deep">Go deeper</button></div>
        <button class="btn btn-soft btn-sm speak" aria-pressed="false" title="Read aloud">${icon("sound")}Listen</button></div></div>
        <h2 class="ctitle">${c.title}</h2><div class="pre-slot"></div><div class="content" ${c.predict ? "hidden" : ""}><div class="prose expl"></div><div class="figs"></div>${c.link ? `<p><a class="btn btn-line btn-sm" href="${c.link.href}">${icon("flask")}${c.link.label}</a></p>` : ""}<div class="chk-slot"></div></div>
        <div class="lesson-nav"><button class="btn btn-soft prev" ${idx === 0 ? "disabled" : ""}>← Back</button><button class="btn btn-main next">Next →</button></div></article>`);
      slot.appendChild(card);
      const content = card.querySelector(".content"), next = card.querySelector(".next");
      const renderLvl = () => { card.querySelector(".expl").innerHTML = c[lvl] || c.std; AN.$$(".seg button", card).forEach(b => b.setAttribute("aria-pressed", String(b.dataset.l === lvl))); };
      AN.$$(".seg button", card).forEach(b => b.onclick = () => { lvl = b.dataset.l; renderLvl(); });
      renderLvl();
      card.querySelector(".figs").innerHTML = (c.fig ? c.fig() : "") + (c.extraFig ? c.extraFig() : "");
      card.querySelector(".speak").onclick = (e) => AN.speak(`${c.title}. ${card.querySelector(".expl").innerHTML}`, e.currentTarget);
      const checkDone = !c.check || S().q[c.check.id];
      next.disabled = !checkDone; if (!checkDone) next.title = "Answer the check question first";
      if (c.predict) {
        const pre = S().q[c.predict.id];
        if (pre) { content.hidden = false; card.querySelector(".pre-slot").innerHTML = `<p class="small muted">${icon("bulb")} You made a prediction for this card already.</p>`; }
        else card.querySelector(".pre-slot").appendChild(AN.Q(c.predict, { mode: "predict", onDone: () => { content.hidden = false; content.scrollIntoView({ behavior: "smooth", block: "start" }); } }));
      }
      if (c.check) card.querySelector(".chk-slot").appendChild(AN.Q(c.check, { mode: "check", onDone: () => { next.disabled = false; next.title = ""; } }));
      card.querySelector(".prev").onclick = () => { idx--; show(); };
      next.onclick = () => { AN.markCard(s, c); idx++; show(); };
    };
    const wrapUp = () => {
      const p = AN.secProgress(s);
      const card = h(`<article class="card lesson-card"><div class="eyebrow">Section wrap-up</div><h2 class="ctitle">You finished ${s.num}!</h2>
        <p>${p.done === p.total ? "Every card done. " : `You've done ${p.done} of ${p.total} cards. `}Lock it in with one more step:</p>
        <div class="qbox"><div class="qhead"><span class="pill pb">${icon("chat")}Explain it to a friend</span></div><div class="qtext">${s.explain.prompt}</div>
          <textarea id="ex-${s.id}" placeholder="Write as if you're texting a friend…">${esc(S().explain[s.id] || "")}</textarea>
          <div class="row"><button class="btn btn-main" id="ex-go">Submit</button>${S().ai.key ? `<button class="btn btn-line" id="ex-ai">${icon("chat")}Get AI feedback</button>` : ""}</div><div id="ex-fb"></div></div>
        <div class="row" style="margin-top:16px"><a class="btn btn-teal" href="#practice-${s.id}">Practice ${s.num} questions</a>${s.labs.map(l => `<a class="btn btn-soft" href="${l.href}">${icon("flask")}${l.label}</a>`).join("")}
        ${(() => { const i = CH.sections.indexOf(s); return i < CH.sections.length - 1 ? `<a class="btn btn-line" href="#learn-${CH.sections[i + 1].id}">Next section →</a>` : `<a class="btn btn-line" href="#boss">Boss Challenge →</a>`; })()}</div></article>`);
      slot.appendChild(card);
      const ta = AN.$("#ex-" + s.id, card);
      ta.oninput = () => { S().explain[s.id] = ta.value; AN.save(); };
      AN.$("#ex-go", card).onclick = () => {
        if (ta.value.trim().length < 30) { AN.$("#ex-fb", card).innerHTML = `<div class="fb info">Write a little more, at least two sentences.</div>`; return; }
        AN.$("#ex-fb", card).innerHTML = `<div class="fb info"><b>Check your explanation. Did you…</b><div class="checklist">${s.explain.checklist.map(x => `<label><input type="checkbox"> ${x}</label>`).join("")}</div></div>`;
        if (!S().badges.explainer) { AN.badge("explainer"); AN.addXP(20, "explained it"); }
      };
      const ai = AN.$("#ex-ai", card);
      if (ai) ai.onclick = async () => {
        if (ta.value.trim().length < 30) return;
        ai.disabled = true; AN.$("#ex-fb", card).innerHTML = `<p class="small muted">The tutor is reading…</p>`;
        try { const r = await AN.AI.grade({ question: s.explain.prompt, model: "A clear explanation that covers: " + s.explain.checklist.join(" "), checklist: s.explain.checklist, answer: ta.value }); AN.$("#ex-fb", card).innerHTML = `<div class="fb ${r.score >= 2 ? "ok" : "no"}"><b>AI Tutor: ${r.score}/3</b><br>${esc(r.feedback)}</div>`; if (!S().badges.explainer) { AN.badge("explainer"); AN.addXP(20); } }
        catch (e) { AN.$("#ex-fb", card).innerHTML = `<div class="fb no">${esc(e.message)}</div>`; }
        ai.disabled = false;
      };
    };
    show();
  });

  /* ================= Practice ================= */
  R.practice = wrapRoute((v, sid) => {
    const s = sid ? CH.sections.find(x => x.id === sid) : null;
    if (!s) {
      v.appendChild(h(`<div class="wrap"><header class="top"><div><h1>Practice</h1><p class="sub">Pick a section, a game, or the boss. Every question has three levels.</p></div>${stats()}</header>
        <div class="grid">
          <a class="card s4 lab-tile" href="#myth" style="background:var(--surface)"><span class="pill pb" style="align-self:flex-start">${icon("target")}Game</span><b style="font-size:18px">Myth or Fact?</b><span>18 quick statements. How many can you call correctly?</span></a>
          <a class="card s4 lab-tile" href="#boss" style="background:var(--surface)"><span class="pill p3" style="align-self:flex-start">${icon("star")}Challenge</span><b style="font-size:18px">Chapter Boss</b><span>15 mixed questions, 3 lives, optional timer. Best: ${S().boss.best}%</span></a>
          <a class="card s4 lab-tile" href="#review" style="background:var(--surface)"><span class="pill p2" style="align-self:flex-start">${icon("redo")}Review</span><b style="font-size:18px">Fix My Mistakes</b><span>${AN.reviewDue().length} due now · ${Object.keys(S().review).length} in your deck</span></a>
          ${CH.sections.map(x => { const pr = AN.secPractice(x); return `<a class="card s4 lab-tile" href="#practice-${x.id}" style="background:var(--surface)"><span class="mono small muted">Section ${x.num}</span><b style="font-size:16px">${x.title}</b><span>${pr.solved}/${pr.total} solved</span><div class="bar"><i style="width:${pr.solved / pr.total * 100}%"></i></div></a>`; }).join("")}
        </div></div>`));
      bindTheme(v); return;
    }
    let filter = 0;
    v.appendChild(h(`<div class="wrap"><div><a href="#practice" class="small">← Practice home</a><h1 style="font-size:clamp(22px,2.8vw,30px)">Practice · ${s.num} ${s.title}</h1></div>
      <div class="row"><div class="seg" role="group" aria-label="Level filter"><button data-f="0" aria-pressed="true">All levels</button><button data-f="1">${icon("sprout")} Foundation</button><button data-f="2">${icon("flame")} Intermediate</button><button data-f="3">${icon("rocket")} Advanced</button></div></div>
      <div class="stack" id="plist"></div></div>`));
    const list = AN.$("#plist", v);
    const draw = () => { list.innerHTML = ""; AN.$$(".seg button", v).forEach(b => b.setAttribute("aria-pressed", String(+b.dataset.f === filter))); s.practice.filter(q => !filter || q.lvl === filter).forEach((q, i) => { const w = h(`<div></div>`); w.appendChild(AN.Q(q, { mode: "practice" })); list.appendChild(w); }); };
    AN.$$(".seg button", v).forEach(b => b.onclick = () => { filter = +b.dataset.f; draw(); });
    draw();
  });

  /* ================= Myth or Fact ================= */
  R.myth = wrapRoute((v) => {
    const deck = shuffle(CH.myths); let i = 0, score = 0, streak = 0;
    v.appendChild(h(`<div class="wrap"><div><a href="#practice" class="small">← Practice home</a><h1>Myth or Fact?</h1><p class="sub">Read each statement. Is it a myth or a fact? Think it through before you tap.</p></div>
      <div class="row" style="justify-content:center;gap:20px"><span class="chip">Card <b id="mf-i">1</b> / ${deck.length}</span><span class="chip" style="color:var(--good)">Score <b id="mf-s">0</b></span><span class="chip" style="color:var(--lvl2)">${icon("fire")}Streak <b id="mf-st">0</b></span></div>
      <div id="mf-slot"></div></div>`));
    const slot = AN.$("#mf-slot", v);
    const show = () => {
      if (i >= deck.length) {
        const best = Math.max(S().mf.best, score); S().mf.best = best; AN.save(); if (score >= 15) AN.badge("myth");
        AN.addXP(score * 2, "Myth or Fact");
        slot.innerHTML = `<div class="mf-card"><div class="stmt">${score} / ${deck.length}</div><p>${score >= 15 ? "Myth Buster! You really know your atoms." : score >= 10 ? "Solid! Review the ones you missed in the lessons." : "Good start. Try the lessons, then play again."}</p><div class="mf-btns"><button class="btn btn-light" onclick="AN.route()">Play again</button></div></div>`; return;
      }
      const [stmt, truth, why] = deck[i];
      slot.innerHTML = `<div class="mf-card"><div class="stmt">“${stmt}”</div><div class="mf-btns"><button class="btn btn-light" data-a="0">Myth</button><button class="btn btn-light" data-a="1">Fact</button></div><div id="mf-fb"></div></div>`;
      AN.$$(".mf-btns button", slot).forEach(b => b.onclick = () => {
        const ok = (+b.dataset.a === 1) === truth; if (ok) { score++; streak++; } else streak = 0;
        AN.$("#mf-s", v).textContent = score; AN.$("#mf-st", v).textContent = streak;
        AN.$("#mf-fb", slot).innerHTML = `<div class="fb ${ok ? "ok" : "no"}" style="color:var(--ink);text-align:left"><b>${ok ? "Correct!" : "Not quite."} It's a ${truth ? "FACT" : "MYTH"}.</b> ${why}</div><button class="btn btn-light" style="margin-top:12px" id="mf-next">Next</button>`;
        AN.$$(".mf-btns button", slot).forEach(x => x.disabled = true);
        AN.$("#mf-next", slot).onclick = () => { i++; AN.$("#mf-i", v).textContent = Math.min(i + 1, deck.length); show(); };
        AN.$("#mf-next", slot).focus();
      });
    };
    show();
  });

  /* ================= Boss challenge ================= */
  R.boss = wrapRoute((v) => {
    v.appendChild(h(`<div class="wrap"><div><a href="#practice" class="small">← Practice home</a><h1>Chapter Boss Challenge</h1><p class="sub">15 questions from all of Chapter 1, mixed levels. One try each. You have 3 lives. No hints. Score 80% or more to earn “Atom Architect”.</p></div>
      <div class="card stack" id="boss-start"><label class="row small"><input type="checkbox" id="boss-timer"> Add a 20-minute timer (test practice)</label><button class="btn btn-main" id="boss-go" style="align-self:flex-start">Start the challenge</button><p class="small muted" style="margin:0">Best score so far: ${S().boss.best}%</p></div>
      <div id="boss-run" hidden><div class="row" style="justify-content:space-between"><span class="chip">Question <b id="b-i">1</b> / 15</span><span class="chip" id="b-lives" style="color:var(--bad)"></span><span class="chip" id="b-time" hidden></span></div><div id="b-slot" style="margin-top:14px"></div></div></div>`));
    let timer;
    AN.$("#boss-go", v).onclick = () => {
      const qs = []; CH.sections.forEach(s => { const pick = l => shuffle(s.practice.filter(q => q.lvl === l && q.type !== "text"))[0]; qs.push(pick(1), pick(2), pick(3)); });
      const deck = shuffle(qs.filter(Boolean)).slice(0, 15);
      let i = 0, right = 0, lives = 3, secs = 1200;
      AN.$("#boss-start", v).hidden = true; AN.$("#boss-run", v).hidden = false;
      const lifeBar = () => AN.$("#b-lives", v).innerHTML = "♥ ".repeat(lives) + "<span style='opacity:.3'>" + "♥ ".repeat(3 - lives) + "</span>";
      lifeBar();
      if (AN.$("#boss-timer", v).checked) { AN.$("#b-time", v).hidden = false; timer = setInterval(() => { secs--; AN.$("#b-time", v).textContent = `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}`; if (secs <= 0) end("Time's up!"); }, 1000); }
      const end = (why) => {
        clearInterval(timer); const pct = Math.round(right / deck.length * 100);
        S().boss.best = Math.max(S().boss.best, pct); AN.save(); if (pct >= 80) AN.badge("atomarch");
        AN.addXP(right * 5, "Boss Challenge");
        AN.$("#b-slot", v).innerHTML = `<div class="card" style="text-align:center"><h2>${why || "Challenge complete!"}</h2><div class="bigstat" style="font-size:48px">${pct}%</div><p>${right} correct out of ${deck.length}.${pct >= 80 ? " You're an Atom Architect!" : " Missed questions are now in Fix My Mistakes."}</p><div class="row" style="justify-content:center"><button class="btn btn-main" onclick="AN.route()">Try again</button><a class="btn btn-soft" href="#review">Fix my mistakes</a></div></div>`;
      };
      const show = () => {
        if (i >= deck.length) return end();
        AN.$("#b-i", v).textContent = i + 1;
        const slot = AN.$("#b-slot", v); slot.innerHTML = "";
        slot.appendChild(AN.Q(deck[i], { mode: "boss", onDone: (ok) => {
          if (ok) right++; else { lives--; lifeBar(); }
          const nb = h(`<button class="btn btn-main" style="margin-top:12px">${lives <= 0 ? "See results" : "Next question →"}</button>`);
          nb.onclick = () => { if (lives <= 0) return end("Out of lives!"); i++; show(); };
          slot.appendChild(nb); nb.focus();
        } }));
      };
      show();
    };
    return () => clearInterval(timer);
  });

  /* ================= Review ================= */
  R.review = wrapRoute((v) => {
    const due = AN.reviewDue();
    v.appendChild(h(`<div class="wrap"><header class="top"><div><h1>Fix My Mistakes</h1><p class="sub">Questions you missed or guessed come back after 1, 3 and 7 days. Get one right three times in a row and it leaves your deck for good.</p></div>${stats()}</header>
      <div class="row"><span class="chip">${due.length} due now</span><span class="chip">${Object.keys(S().review).length} in deck</span><span class="chip" style="color:var(--good)">${S().reviewCleared} cleared</span></div><div class="stack" id="rv"></div></div>`));
    bindTheme(v);
    const box = AN.$("#rv", v);
    if (!due.length) { box.innerHTML = `<div class="card"><h2>All clear!</h2><p class="muted">Nothing is due right now. Practise some questions or play Myth or Fact. Anything you miss shows up here.</p><a class="btn btn-main" href="#practice">Go to practice</a></div>`; return; }
    due.forEach(q => { const w = h(`<div></div>`); const sec = CH.sections.find(s => q.id.startsWith(s.id)); w.appendChild(h(`<div class="small muted" style="margin-bottom:4px">From section ${sec ? sec.num : ""} · box ${S().review[q.id].box} of 3</div>`)); w.appendChild(AN.Q(q, { mode: "review" })); box.appendChild(w); });
  });

  /* ================= Labs list ================= */
  R.labs = wrapRoute((v) => {
    v.appendChild(h(`<div class="wrap"><header class="top"><div><h1>Virtual Labs</h1><p class="sub">Experiment safely. Every lab asks you to predict first, then test.</p></div>${stats()}</header>
      <div class="labs-grid">${AN.LABS.list.map(l => `<a class="lab-tile card" href="${l.href}" style="background:var(--surface)">${l.svg}<b>${l.name}</b><span>${l.desc}</span><span class="mono small">Section ${l.sec}</span></a>`).join("")}</div></div>`));
    bindTheme(v);
  });
  R.table = wrapRoute(AN.LABS.table); R["lab-flame"] = wrapRoute(AN.LABS.flame); R["lab-halflife"] = wrapRoute(AN.LABS.halflife); R["lab-box"] = wrapRoute(AN.LABS.box);
  R["lab-foil"] = wrapRoute(AN.LABS.foil); R["lab-atom"] = wrapRoute(AN.LABS.atom); R["lab-trend"] = wrapRoute(AN.LABS.trend); R["lab-alkali"] = wrapRoute(AN.LABS.alkali);

  /* ================= Badges ================= */
  R.badges = wrapRoute((v) => {
    const unl = AN.cardsUnlocked();
    v.appendChild(h(`<div class="wrap"><header class="top"><div><h1>Badges &amp; Element Cards</h1><p class="sub">${Object.keys(S().badges).length} of ${AN.BADGES.length} badges · ${unl} of 118 element cards · Level ${AN.level()}</p></div>${stats()}</header>
      <div class="card"><div class="eyebrow">Level progress</div><div class="row"><b>Level ${AN.level()}</b><div class="bar" style="flex:1"><i style="width:${(S().xp % 300) / 3}%"></i></div><span class="mono small">${S().xp % 300} / 300 XP</span></div></div>
      <div class="labs-grid">${AN.BADGES.map(b => { const got = S().badges[b.id]; return `<div class="lab-tile card" style="background:var(--surface);${got ? "" : "opacity:.55"}"><span style="width:46px;height:46px;border-radius:14px;display:grid;place-items:center;background:${got ? "var(--grape)" : "var(--surface-2)"};color:${got ? "#fff" : "var(--muted)"}">${icon(got ? b.icon : "lock")}</span><b>${b.name}</b><span>${b.desc}</span>${got ? `<span class="small" style="color:var(--good)">Earned ${new Date(got).toLocaleDateString("en-CA")}</span>` : ""}</div>`; }).join("")}</div>
      <div class="card"><h2>Element cards</h2><div class="tiles">${AN.ELEMENTS.map(e => e.z <= unl ? `<div class="tile got" style="background:${["#7B4FD8", "#0E9F94", "#E2402F", "#3B5BDB", "#C2338F", "#D9690A"][e.z % 6]}" title="${e.name}"><small>${e.z}</small><b>${e.sym}</b><span class="nm">${e.name}</span></div>` : `<div class="tile lock"><small>${e.z}</small><b>?</b></div>`).join("")}</div></div></div>`));
    bindTheme(v);
  });

  /* ================= AI Tutor ================= */
  R.tutor = wrapRoute((v) => {
    const on = !!S().ai.key;
    v.appendChild(h(`<div class="wrap"><header class="top"><div><h1>AI Tutor</h1><p class="sub">Ask about anything in Chapter 1. The tutor gives hints first, so you still do the thinking.</p></div>${stats()}</header>
      ${on ? `<div class="card stack"><div class="chat" id="chat"><div class="msg bot">Hi${S().profile.name ? " " + esc(S().profile.name) : ""}! I'm your chemistry tutor. Ask me about isotopes, the Bohr model, periodic trends, anything in Chapter 1. If you're stuck on a question, tell me what you tried.</div></div>
        <div class="row"><input id="chat-in" style="flex:1;min-width:0;padding:10px 12px;border-radius:12px;border:2px solid var(--line);background:var(--bg)" placeholder="Type your question…" aria-label="Your question"><button class="btn btn-main" id="chat-send">Send</button></div>
        <div class="row small">${["Why does atomic radius decrease across a period?", "How do I calculate a weighted average atomic mass?", "Give me a practice question on half-life"].map(t => `<button class="btn btn-soft btn-sm sugg">${t}</button>`).join("")}</div>
        <p class="small muted" style="margin:0">Using ${AN.AI_MODELS.find(m => m.id === S().ai.model)?.name || S().ai.model}. Each message costs a small amount on your Claude account. <a href="#settings">Change in Settings</a></p></div>`
        : `<div class="card"><h2>Turn on the AI Tutor</h2><ol class="prose"><li>Ask a parent or guardian to create an account at <b>console.anthropic.com</b> and add a little credit (a few dollars lasts a long time for studying).</li><li>Create an <b>API key</b> there and copy it.</li><li>Paste it in <a href="#settings">Settings</a>. It's stored only on this device.</li></ol><p class="small muted">Everything else in Atomic North works without it: lessons, labs, practice, games and the self-check model answers.</p><a class="btn btn-main" href="#settings">Go to Settings</a></div>`}</div>`));
    bindTheme(v);
    if (!on) return;
    const hist = []; const chat = AN.$("#chat", v), inp = AN.$("#chat-in", v);
    const send = async (text) => {
      text = (text || inp.value).trim(); if (!text) return; inp.value = "";
      chat.appendChild(h(`<div class="msg me">${esc(text)}</div>`)); hist.push({ role: "user", content: text });
      const wait = h(`<div class="msg bot muted">Thinking…</div>`); chat.appendChild(wait); chat.scrollTop = chat.scrollHeight;
      try { const r = await AN.AI.chat(hist); hist.push({ role: "assistant", content: r }); wait.className = "msg bot"; wait.textContent = r; }
      catch (e) { hist.pop(); wait.className = "msg bot"; wait.style.color = "var(--bad)"; wait.textContent = e.message; }
      chat.scrollTop = chat.scrollHeight;
    };
    AN.$("#chat-send", v).onclick = () => send(); inp.onkeydown = e => { if (e.key === "Enter") send(); };
    AN.$$(".sugg", v).forEach(b => b.onclick = () => send(b.textContent));
  });

  /* ================= Settings ================= */
  R.settings = wrapRoute((v) => {
    const P = S().profile;
    v.appendChild(h(`<div class="wrap"><header class="top"><div><h1>Settings</h1></div>${stats()}</header>
      <div class="grid"><div class="card s6 stack"><h2>You</h2>
        <div class="field"><label for="st-name">Your first name</label><input id="st-name" value="${esc(P.name)}" maxlength="30"></div>
        <div class="field"><label>Default explanation level</label><div class="opt-cards" id="st-lvl"><button data-l="simple">Explain it simpler</button><button data-l="std">Standard</button><button data-l="deep">Go deeper</button></div></div>
        <div class="field"><label>Theme</label><div class="opt-cards" id="st-theme" style="grid-template-columns:1fr 1fr"><button data-t="light">Light</button><button data-t="dark">Dark (soft)</button></div></div>
        <div class="field"><label for="st-rate">Read-aloud speed: <span id="st-rate-v">${P.rate}</span>×</label><input type="range" id="st-rate" min="0.7" max="1.3" step="0.1" value="${P.rate}"></div></div>
      <div class="card s6 stack"><h2>AI Tutor (optional)</h2><p class="small muted" style="margin:0">Uses your own Claude API key. Your key is stored only on this device and sent only to Anthropic. Usage is billed to your Claude account.</p>
        <div class="field"><label for="st-key">Claude API key</label><input id="st-key" type="password" autocomplete="off" placeholder="sk-ant-…" value="${esc(S().ai.key)}"></div>
        <div class="field"><label for="st-model">Model</label><select id="st-model">${AN.AI_MODELS.map(m => `<option value="${m.id}" ${m.id === S().ai.model ? "selected" : ""}>${m.name} (${m.note})</option>`).join("")}</select></div>
        <div class="row"><button class="btn btn-main" id="st-save">Save &amp; test</button><button class="btn btn-soft" id="st-clear">Remove key</button></div><div id="st-ai-fb"></div></div>
      <div class="card s12 stack"><h2>Your progress</h2><p class="small muted" style="margin:0">Progress is saved on this device. Back it up or move it to another computer with a progress file.</p>
        <div class="row"><button class="btn btn-soft" id="st-exp">Copy progress code</button><button class="btn btn-soft" id="st-imp">Paste progress code</button><button class="btn btn-line" id="st-reset" style="color:var(--bad)">Reset all progress</button></div>
        <textarea id="st-code" hidden aria-label="Progress code"></textarea><div id="st-pfb"></div></div></div>
      <p class="small muted">Atomic North · Grade 11 Chemistry companion · Chapter 1 preview. Content is original and written to match the Ontario SCH3U curriculum. Not affiliated with any publisher.</p></div>`));
    bindTheme(v);
    const mark = (sel, attr, val) => AN.$$(sel + " button", v).forEach(b => b.setAttribute("aria-pressed", String(b.dataset[attr] === val)));
    mark("#st-lvl", "l", P.level); mark("#st-theme", "t", P.theme);
    AN.$("#st-name", v).oninput = e => { P.name = e.target.value.trim(); AN.save(); };
    AN.$$("#st-lvl button", v).forEach(b => b.onclick = () => { P.level = b.dataset.l; AN.save(); mark("#st-lvl", "l", P.level); });
    AN.$$("#st-theme button", v).forEach(b => b.onclick = () => { P.theme = b.dataset.t; AN.save(); AN.applyTheme(); mark("#st-theme", "t", P.theme); });
    AN.$("#st-rate", v).oninput = e => { P.rate = +e.target.value; AN.$("#st-rate-v", v).textContent = P.rate; AN.save(); };
    AN.$("#st-save", v).onclick = async () => {
      S().ai.key = AN.$("#st-key", v).value.trim(); S().ai.model = AN.$("#st-model", v).value; AN.save();
      const fb = AN.$("#st-ai-fb", v); if (!S().ai.key) { fb.innerHTML = `<div class="fb info">Saved. The AI Tutor is off.</div>`; return; }
      fb.innerHTML = `<div class="fb info">Testing your key…</div>`;
      try { const r = await AN.AI.test(); fb.innerHTML = `<div class="fb ok"><b>It works!</b> The tutor says: “${esc(r)}”</div>`; }
      catch (e) { fb.innerHTML = `<div class="fb no">${esc(e.message)}</div>`; }
    };
    AN.$("#st-clear", v).onclick = () => { S().ai.key = ""; AN.save(); AN.$("#st-key", v).value = ""; AN.$("#st-ai-fb", v).innerHTML = `<div class="fb info">Key removed from this device.</div>`; };
    const code = AN.$("#st-code", v), pfb = AN.$("#st-pfb", v);
    AN.$("#st-exp", v).onclick = async () => {
      const data = JSON.parse(JSON.stringify(S())); data.ai.key = "";
      code.hidden = false; code.value = btoa(unescape(encodeURIComponent(JSON.stringify(data)))); code.select();
      try { await navigator.clipboard.writeText(code.value); pfb.innerHTML = `<div class="fb ok">Copied! Paste it somewhere safe. (Your API key is not included.)</div>`; } catch (e) { pfb.innerHTML = `<div class="fb info">Select the code above and copy it.</div>`; }
    };
    AN.$("#st-imp", v).onclick = () => {
      if (code.hidden) { code.hidden = false; code.value = ""; code.placeholder = "Paste your progress code here, then press the button again"; code.focus(); return; }
      try { const d = JSON.parse(decodeURIComponent(escape(atob(code.value.trim())))); const key = S().ai.key; Object.assign(AN.S, d); AN.S.ai.key = key; AN.save(); pfb.innerHTML = `<div class="fb ok">Progress restored.</div>`; setTimeout(() => location.reload(), 800); }
      catch (e) { pfb.innerHTML = `<div class="fb no">That code didn't work. Check that you copied all of it.</div>`; }
    };
    let armed = false;
    AN.$("#st-reset", v).onclick = (e) => { if (!armed) { armed = true; e.target.textContent = "Tap again to erase everything"; return; } AN.reset(); location.hash = "#home"; location.reload(); };
  });

  /* ================= chrome ================= */
  AN.refreshChrome = () => { const n = AN.reviewDue().length; const c = AN.$("#nav-review-count"); if (c) { c.textContent = n; c.hidden = !n; } };

  /* ================= onboarding ================= */
  AN.onboard = () => {
    if (S().profile.onboarded) return;
    let lvl = "std";
    const m = h(`<div class="modal-back" role="dialog" aria-modal="true" aria-labelledby="ob-t"><div class="modal">
      <h2 id="ob-t" style="font-size:24px">Welcome to Atomic North</h2>
      <p style="margin:0">Your interactive companion for Grade 11 Chemistry. We start with Chapter 1: The Nature of Matter.</p>
      <div class="field"><label for="ob-name">What should we call you?</label><input id="ob-name" maxlength="30" placeholder="First name"></div>
      <div class="field"><label>How do you like things explained? (You can switch on every card.)</label><div class="opt-cards"><button data-l="simple" aria-pressed="false">Keep it simple</button><button data-l="std" aria-pressed="true">Standard</button><button data-l="deep" aria-pressed="false">Challenge me</button></div></div>
      <button class="btn btn-main" id="ob-go">Let's go</button></div></div>`);
    document.body.appendChild(m);
    AN.$$(".opt-cards button", m).forEach(b => b.onclick = () => { lvl = b.dataset.l; AN.$$(".opt-cards button", m).forEach(x => x.setAttribute("aria-pressed", String(x === b))); });
    AN.$("#ob-name", m).focus();
    AN.$("#ob-go", m).onclick = () => { S().profile.name = AN.$("#ob-name", m).value.trim(); S().profile.level = lvl; S().profile.onboarded = true; AN.save(); m.remove(); AN.touchDay(); AN.route(); };
  };
})();
