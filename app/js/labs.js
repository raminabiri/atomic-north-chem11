/* Atomic North — virtual labs */
(function () {
  const { h, icon, shuffle, esc } = AN;
  const F = AN.FIG;
  const L = AN.LABS = {};
  const head = (title, sub, back = "#labs") => `<div class="top"><div><a href="${back}" class="small">← All labs</a><h1>${title}</h1><p class="sub">${sub}</p></div></div>`;
  const css = v => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  const fitCanvas = (cv, w, hgt) => { const r = window.devicePixelRatio || 1; cv.width = w * r; cv.height = hgt * r; const c = cv.getContext("2d"); c.setTransform(r, 0, 0, r, 0, 0); return c; };

  /* ============ Periodic table ============ */
  L.table = (v) => {
    AN.labVisit("table");
    v.appendChild(h(`<div class="wrap">${head("Interactive Periodic Table", "Tap any element. Switch views to see families or trends as a heat map.")}
      <div class="card"><div class="row" style="justify-content:space-between"><div class="seg" role="group" aria-label="View">
        <button aria-pressed="true" data-m="family">Families</button><button aria-pressed="false" data-m="radius">Atomic radius</button><button aria-pressed="false" data-m="ie">Ionization energy</button><button aria-pressed="false" data-m="en">Electronegativity</button><button aria-pressed="false" data-m="quiz">Find-it quiz</button></div>
        <span class="small muted" id="pt-note">Colours show chemical families.</span></div>
        <div class="scroll-x" style="margin-top:14px"><div class="ptable" id="pt"></div></div>
      </div>
      <div class="grid"><div class="card s8" id="pt-info"><p class="muted" style="margin:0">Tap an element to see its details.</p></div>
      <div class="card s4" id="pt-quiz" hidden></div></div></div>`));
    const grid = AN.$("#pt");
    AN.ELEMENTS.forEach(e => {
      const r = e.row > 7 ? e.row + 1 : e.row;
      const b = h(`<button class="el c-${e.cat}" style="grid-row:${r};grid-column:${e.col}" data-z="${e.z}" aria-label="${e.name}, atomic number ${e.z}"><span>${e.z}</span><b>${e.sym}</b></button>`);
      grid.appendChild(b);
    });
    grid.appendChild(h(`<div style="grid-row:8;grid-column:1/19;height:10px"></div>`));
    let mode = "family", quizTarget = null, quizScore = 0, quizN = 0;
    const heat = (key) => {
      const vals = AN.ELEMENTS.map(e => e[key]).filter(x => x != null); const lo = Math.min(...vals), hi = Math.max(...vals);
      AN.$$(".el", grid).forEach(b => {
        const e = AN.ELEMENTS[b.dataset.z - 1]; b.className = "el"; b.style.background = ""; b.style.color = "";
        if (e[key] == null) { b.classList.add("dim"); return; }
        const t = (e[key] - lo) / (hi - lo);
        b.style.background = `hsl(${200 - t * 190} 85% ${88 - t * 38}%)`; b.style.color = "#16233B";
      });
    };
    const notes = { family: "Colours show chemical families.", radius: "Bigger = warmer colour. Grey = no data in this app (elements beyond the first 38, plus a few heavier examples).", ie: "Higher ionization energy = warmer colour.", en: "Higher electronegativity = warmer colour. Noble gases have no value.", quiz: "Find the element described on the right." };
    const setMode = (m) => {
      mode = m; AN.$$(".seg button", v).forEach(b => b.setAttribute("aria-pressed", String(b.dataset.m === m)));
      AN.$("#pt-note").textContent = notes[m];
      AN.$$(".el", grid).forEach(b => { const e = AN.ELEMENTS[b.dataset.z - 1]; b.className = "el c-" + e.cat; b.style.background = ""; b.style.color = ""; });
      if (m === "radius") heat("radius"); if (m === "ie") heat("ie"); if (m === "en") heat("en");
      AN.$("#pt-quiz").hidden = m !== "quiz"; if (m === "quiz") nextQuiz();
    };
    const QUIZ = [
      ["the alkali metal in Period 3", "Na"], ["the halogen in Period 4", "Br"], ["the noble gas in Period 2", "Ne"], ["the element with 6 protons", "C"], ["the most electronegative element", "F"],
      ["the alkaline earth metal in Period 4", "Ca"], ["the metalloid in Period 3", "Si"], ["the element with electron arrangement 2, 8, 5", "P"], ["the largest atom in Period 2", "Li"], ["the Group 1 element in Period 5", "Rb"],
      ["the element whose compound gives a lilac flame", "K"], ["the element used in Ontario's CANDU reactor fuel", "U"], ["the lightest noble gas", "He"], ["the transition metal mined at Sudbury that's on the 5-cent coin", "Ni"], ["the element with 17 protons", "Cl"]
    ];
    let quizPool = shuffle(QUIZ);
    function nextQuiz() {
      if (!quizPool.length) quizPool = shuffle(QUIZ);
      quizTarget = quizPool.pop();
      AN.$("#pt-quiz").innerHTML = `<div class="eyebrow">Find-it quiz · ${quizScore}/${quizN}</div><h2>Tap ${quizTarget[0]}</h2><div id="pt-qfb"></div>`;
    }
    const info = (e) => {
      const trend = e.radius ? `<table class="data" style="margin-top:10px"><tr><th>Atomic radius</th><td class="num">${e.radius} pm</td></tr><tr><th>1st ionization energy</th><td class="num">${e.ie} kJ/mol</td></tr><tr><th>Electronegativity</th><td class="num">${e.en ?? "—"}</td></tr></table>` : "";
      AN.$("#pt-info").innerHTML = `<div class="el-info"><div class="el-big c-${e.cat}"><span>${e.z}</span><b>${e.sym}</b></div><div><h2 style="margin:0">${e.name}</h2><div class="muted">${AN.CAT_LABEL[e.cat]} · ${e.group ? "Group " + e.group + " · " : ""}Period ${e.period}</div><div class="mono" style="margin-top:4px">atomic mass ${e.mass != null ? e.mass + " u" : "—"}</div></div></div>
        ${e.z <= 20 ? `<div class="row" style="margin-top:12px;align-items:center;gap:20px">${F.bohr(e.z, null, 170)}<div><b>Electron arrangement:</b> <span class="mono">${AN.shells(e.z).join(", ")}</span><br><b>Valence electrons:</b> ${AN.shells(e.z).slice(-1)[0]}<br><span class="small muted">Neutrons shown for the most common isotope.</span></div></div>` : ""}${trend}`;
    };
    grid.addEventListener("click", (ev) => {
      const b = ev.target.closest(".el"); if (!b) return; const e = AN.ELEMENTS[b.dataset.z - 1];
      if (mode === "quiz" && quizTarget) {
        quizN++; const ok = e.sym === quizTarget[1]; if (ok) quizScore++;
        b.classList.add(ok ? "hit" : "miss"); const right = AN.$$(".el", grid).find(x => AN.ELEMENTS[x.dataset.z - 1].sym === quizTarget[1]); right.classList.add("hit");
        AN.$("#pt-qfb").innerHTML = `<div class="fb ${ok ? "ok" : "no"}">${ok ? "<b>Correct!</b>" : `<b>Not quite.</b> You tapped ${e.name}. The answer is ${AN.el(quizTarget[1]).name}.`}</div><button class="btn btn-main btn-sm" style="margin-top:10px" id="pt-next">Next</button>`;
        if (ok) AN.addXP(2);
        AN.$("#pt-next").onclick = () => { AN.$$(".el", grid).forEach(x => x.classList.remove("hit", "miss")); nextQuiz(); };
        quizTarget = null; return;
      }
      info(e);
    });
    AN.$$(".seg button", v).forEach(b => b.onclick = () => setMode(b.dataset.m));
  };

  /* ============ Flame test ============ */
  L.flame = (v) => {
    AN.labVisit("flame");
    const unknowns = shuffle(AN.FLAMES).slice(0, 4).map((f, i) => ({ label: "Unknown " + "ABCD"[i], f }));
    v.appendChild(h(`<div class="wrap">${head("Flame Test Lab", "Dip the wire loop, hold it in the flame, and watch the colour. Then identify four unknowns.")}
      <div class="lab-wrap"><div class="stage"><canvas id="fl-cv" aria-label="Bunsen burner flame"></canvas></div>
      <div class="card stack"><div><div class="eyebrow">Step 1 · Known samples</div><div class="row" id="fl-known">${AN.FLAMES.map(f => `<button class="btn btn-soft btn-sm" data-s="${f.sym}">${f.compound}</button>`).join("")}</div></div>
        <div><div class="eyebrow">Step 2 · Unknowns</div><div class="row" id="fl-unk">${unknowns.map((u, i) => `<button class="btn btn-line btn-sm" data-u="${i}">${u.label}</button>`).join("")}</div></div>
        <div id="fl-obs" class="fb info">Pick a sample to test. Observe the flame colour.</div>
        <button class="btn btn-soft btn-sm" id="fl-clean">Clean the loop (dip in acid, then flame)</button></div></div>
      <div class="card"><h2>Your identification key</h2><p class="small muted">Write what each unknown is. The answers unlock when you've filled in all four.</p>
        <div class="grid" id="fl-ans">${unknowns.map((u, i) => `<div class="s6 field"><label for="fl-a${i}">${u.label}</label><select id="fl-a${i}"><option value="">choose a metal…</option>${AN.FLAMES.map(f => `<option value="${f.sym}">${AN.el(f.sym).name}</option>`).join("")}</select></div>`).join("")}</div>
        <button class="btn btn-main" id="fl-check" style="margin-top:12px">Check my identifications</button><div id="fl-res" style="margin-top:10px"></div></div></div>`));
    const cv = AN.$("#fl-cv"); const W = 520, H = 340; const c = fitCanvas(cv, W, H);
    let cur = null, dirty = false, t = 0, loopIn = 0, raf;
    const draw = () => {
      t += 0.05; c.clearRect(0, 0, W, H);
      c.fillStyle = css("--surface-2"); c.fillRect(0, 0, W, H);
      // burner
      c.fillStyle = "#8D99AE"; c.fillRect(W / 2 - 18, H - 120, 36, 100); c.fillRect(W / 2 - 50, H - 22, 100, 14);
      // flame
      const col = cur ? (dirty ? AN.FLAMES[1] : cur) : null; const fx = W / 2, fy = H - 122;
      for (let k = 0; k < 3; k++) {
        const s = 1 - k * 0.28, wob = Math.sin(t * 3 + k) * 4;
        c.beginPath(); c.moveTo(fx - 26 * s, fy); c.quadraticCurveTo(fx - 34 * s + wob, fy - 90 * s, fx + wob * 1.5, fy - 170 * s); c.quadraticCurveTo(fx + 34 * s + wob, fy - 90 * s, fx + 26 * s, fy); c.closePath();
        c.fillStyle = col ? (k === 0 ? col.c1 + "CC" : k === 1 ? col.c2 + "DD" : "#FFFFFFAA") : (k === 0 ? "#5B8DEF66" : k === 1 ? "#7FB2FF55" : "#CFE3FF55");
        c.fill();
      }
      // wire loop
      loopIn += ((cur ? 1 : 0) - loopIn) * 0.12;
      const lx = W - 40 - loopIn * (W / 2 - 60), ly = fy - 70;
      c.strokeStyle = "#5A6A84"; c.lineWidth = 3; c.beginPath(); c.moveTo(W - 10, ly - 40); c.lineTo(lx + 8, ly); c.stroke();
      c.beginPath(); c.arc(lx, ly, 8, 0, Math.PI * 2); c.stroke();
      raf = requestAnimationFrame(draw);
    };
    draw();
    const obs = AN.$("#fl-obs");
    AN.$$("#fl-known button").forEach(b => b.onclick = () => { cur = AN.FLAMES.find(f => f.sym === b.dataset.s); obs.innerHTML = `<b>${cur.compound}:</b> ${dirty ? "the flame is <b>yellow-orange</b>… suspicious! Was the loop clean?" : `the flame turns <b>${cur.colour}</b>.`}`; dirty = true; });
    AN.$$("#fl-unk button").forEach(b => b.onclick = () => { const u = unknowns[+b.dataset.u]; cur = u.f; obs.innerHTML = `<b>${u.label}:</b> ${dirty ? "bright yellow-orange. Hmm, did you clean the loop first?" : `the flame looks <b>${u.f.colour}</b>.`}`; dirty = true; });
    AN.$("#fl-clean").onclick = () => { dirty = false; cur = null; obs.innerHTML = "Loop cleaned. Leftover sodium is gone, so the next test will be accurate."; };
    AN.$("#fl-check").onclick = () => {
      const picks = unknowns.map((_, i) => AN.$("#fl-a" + i).value);
      if (picks.some(p => !p)) { AN.$("#fl-res").innerHTML = `<div class="fb info">Fill in all four first. Test each unknown in the flame.</div>`; return; }
      const right = picks.filter((p, i) => p === unknowns[i].f.sym).length;
      AN.$("#fl-res").innerHTML = `<div class="fb ${right === 4 ? "ok" : "no"}"><b>${right} / 4 correct.</b><br>${unknowns.map((u, i) => `${u.label}: ${AN.el(u.f.sym).name} (${u.f.colour}) ${picks[i] === u.f.sym ? "✓" : "✗"}`).join("<br>")}</div>`;
      if (right === 4) { AN.badge("flame"); AN.addXP(30, "flame lab"); }
    };
    return () => cancelAnimationFrame(raf);
  };

  /* ============ Half-life ============ */
  L.halflife = (v) => {
    AN.labVisit("halflife");
    v.appendChild(h(`<div class="wrap">${head("Half-Life Simulator", "Each dot is an unstable nucleus. Every tick, each one has a chance to decay. Watch the pattern.")}
      <div class="card qbox think" id="hl-pred"><span class="pill pb">${icon("bulb")}Predict first</span><div class="qtext">You start with 400 nuclei. How many do you predict will be left after 3 half-lives?</div><div class="ansrow"><input id="hl-guess" inputmode="numeric" placeholder="?"><button class="btn btn-main" id="hl-lock">Lock in</button></div><div id="hl-pfb"></div></div>
      <div class="lab-wrap"><div class="stage"><canvas id="hl-cv"></canvas></div>
      <div class="card stack"><div class="field"><label for="hl-iso">Isotope</label><select id="hl-iso">${AN.ISOTOPES.map(i => `<option value="${i.id}">${i.label} (half-life ${i.half} ${i.unit})</option>`).join("")}</select></div>
        <div class="row"><button class="btn btn-teal" id="hl-play">Play</button><button class="btn btn-soft" id="hl-step">Jump 1 half-life</button><button class="btn btn-line" id="hl-reset">Reset</button></div>
        <div class="row" style="gap:24px"><div><div class="eyebrow">Time</div><div class="bigstat" id="hl-time">0</div></div><div><div class="eyebrow">Undecayed</div><div class="bigstat" id="hl-left">400</div></div></div>
        <p class="small muted" id="hl-use"></p></div></div>
      <div class="card"><h2>Undecayed nuclei vs time</h2><div id="hl-chart"></div><p class="small muted">Teal = your simulation. Dashed = perfect halving. Random decay gets very close to the smooth curve when there are many nuclei.</p></div></div>`));
    const N = 400, cv = AN.$("#hl-cv"), W = 520, H = 340, c = fitCanvas(cv, W, H);
    let alive, hist, time, iso, playing = false, timer, predicted = null;
    const reset = () => { alive = new Array(N).fill(true); hist = [{ x: 0, y: N }]; time = 0; iso = AN.ISOTOPES.find(i => i.id === AN.$("#hl-iso").value); AN.$("#hl-use").textContent = `${iso.label} ${iso.use}.`; render(); };
    const render = () => {
      c.fillStyle = css("--surface-2"); c.fillRect(0, 0, W, H);
      const cols = 25, gap = W / cols, rows = N / cols;
      for (let i = 0; i < N; i++) { const x = (i % cols) * gap + gap / 2, y = Math.floor(i / cols) * (H / rows) + H / rows / 2; c.beginPath(); c.arc(x, y, 6.5, 0, 6.283); c.fillStyle = alive[i] ? "#0E9F94" : "#C9D2DF"; c.fill(); }
      const left = alive.filter(Boolean).length; AN.$("#hl-left").textContent = left;
      const hl = time / iso.half; AN.$("#hl-time").textContent = `${+(time).toFixed(iso.half >= 100 ? 0 : 1)} ${iso.unit}`;
      const pts = hist.map(p => ({ x: p.x / iso.half, y: p.y }));
      const ideal = []; for (let k = 0; k <= 6; k += .1) ideal.push({ x: k, y: N * Math.pow(.5, k) });
      const svg = F.line(pts.length > 1 ? pts : [{ x: 0, y: N }, { x: 0.001, y: N }], { xmin: 0, xmax: 6, ymax: 420, xticks: [0, 1, 2, 3, 4, 5, 6].map(k => ({ x: k, label: k })), y: "nuclei left", x: "half-lives elapsed", h: 240 });
      const idealPath = F.line(ideal, { xmin: 0, xmax: 6, ymax: 420, h: 240 }).match(/<path d="([^"]+)" style="fill:none/);
      AN.$("#hl-chart").innerHTML = svg.replace("</svg>", idealPath ? `<path d="${idealPath[1]}" style="fill:none;stroke:var(--muted)" stroke-width="1.5" stroke-dasharray="5 5"/></svg>` : "</svg>");
      if (hl >= 3 && predicted != null && !AN.$("#hl-pfb").dataset.done) { AN.$("#hl-pfb").dataset.done = 1; const real = hist.find(p => p.x >= 3 * iso.half - 1e-9)?.y ?? left; AN.$("#hl-pfb").innerHTML = `<div class="fb ${Math.abs(predicted - 50) <= 10 ? "ok" : "info"}">After 3 half-lives the simulation had <b>${real}</b> left. The math says 400 × ½ × ½ × ½ = <b>50</b>. You predicted ${predicted}.</div>`; }
    };
    const tick = (dtHalf) => { // advance by fraction of half-life
      const p = 1 - Math.pow(.5, dtHalf);
      for (let i = 0; i < N; i++) if (alive[i] && Math.random() < p) alive[i] = false;
      time += dtHalf * iso.half; hist.push({ x: time, y: alive.filter(Boolean).length }); render();
      if (time / iso.half >= 6) stop();
    };
    const stop = () => { playing = false; clearInterval(timer); AN.$("#hl-play").textContent = "Play"; };
    AN.$("#hl-play").onclick = () => { if (playing) return stop(); if (time / iso.half >= 6) reset(); playing = true; AN.$("#hl-play").textContent = "Pause"; timer = setInterval(() => tick(0.1), 120); };
    AN.$("#hl-step").onclick = () => { stop(); for (let k = 0; k < 10; k++) tick(0.1); };
    AN.$("#hl-reset").onclick = () => { stop(); reset(); };
    AN.$("#hl-iso").onchange = () => { stop(); reset(); };
    AN.$("#hl-lock").onclick = () => { const g = parseInt(AN.$("#hl-guess").value, 10); if (isNaN(g)) return; predicted = g; AN.$("#hl-lock").disabled = true; AN.$("#hl-pfb").innerHTML = `<div class="fb info">Prediction locked: ${g}. Now press Play (or jump 3 half-lives) to test it.</div>`; };
    reset();
    return stop;
  };

  /* ============ Mystery box ============ */
  L.box = (v) => {
    AN.labVisit("box");
    const SH = {
      circle: { name: "a circle", sdf: (x, y) => Math.hypot(x - 260, y - 170) - 70 },
      square: { name: "a square", sdf: (x, y) => { const dx = Math.abs(x - 260) - 65, dy = Math.abs(y - 170) - 65; return Math.hypot(Math.max(dx, 0), Math.max(dy, 0)) + Math.min(Math.max(dx, dy), 0); } },
      triangle: { name: "a triangle pointing left", sdf: (x, y) => { const pts = [[190, 170], [330, 80], [330, 260]]; let d = 1e9, inside = true; for (let i = 0; i < 3; i++) { const [ax, ay] = pts[i], [bx, by] = pts[(i + 1) % 3]; const ex = bx - ax, ey = by - ay, wx = x - ax, wy = y - ay; const t = Math.max(0, Math.min(1, (wx * ex + wy * ey) / (ex * ex + ey * ey))); d = Math.min(d, Math.hypot(wx - ex * t, wy - ey * t)); if (ex * wy - ey * wx < 0) inside = false; } return inside ? -d : d; } },
      two: { name: "two small circles", sdf: (x, y) => Math.min(Math.hypot(x - 230, y - 110) - 38, Math.hypot(x - 300, y - 235) - 38) }
    };
    const key = shuffle(Object.keys(SH))[0]; const shape = SH[key];
    v.appendChild(h(`<div class="wrap">${head("Mystery Box", "Something is hidden in the box. Fire marbles in from the left and see where they come out. Build a model of the hidden shape, just like Rutherford did with atoms.")}
      <div class="lab-wrap"><div class="stage"><canvas id="mb-cv" style="cursor:crosshair" aria-label="Mystery box. Click the left edge to fire a marble."></canvas></div>
      <div class="card stack"><p style="margin:0"><b>Click (or tap) anywhere along the box</b> to fire a marble from the left edge at that height. You only see where it goes in and where it comes out.</p>
        <div class="row"><button class="btn btn-soft btn-sm" id="mb-ten">Fire 10 random marbles</button><span class="small muted" id="mb-count">0 marbles fired</span></div>
        <div class="field"><label for="mb-guess">What's hidden inside?</label><select id="mb-guess"><option value="">choose…</option>${Object.entries(SH).map(([k, s]) => `<option value="${k}">${s.name}</option>`).join("")}</select></div>
        <button class="btn btn-main" id="mb-check">Open the box</button><div id="mb-res"></div></div></div>
      <div class="card"><h2>Think about it</h2><p class="prose" style="margin:0">You never saw the shape directly, yet the pattern of bounces let you build a model of it. That's empirical evidence (where marbles exit) supporting a theoretical model (the hidden shape). Chemists did exactly this with atoms, using alpha particles instead of marbles.</p></div></div>`));
    const cv = AN.$("#mb-cv"), W = 520, H = 340, c = fitCanvas(cv, W, H);
    const shots = []; let revealed = false;
    const trace = (y0) => {
      let x = 0, y = y0, dx = 1, dy = 0; const path = [[x, y]];
      for (let s = 0; s < 3000; s++) {
        x += dx; y += dy;
        if (x < 0 || x > W || y < 0 || y > H) break;
        if (shape.sdf(x, y) < 0) {
          x -= dx; y -= dy;
          const e = 0.5, nx = shape.sdf(x + e, y) - shape.sdf(x - e, y), ny = shape.sdf(x, y + e) - shape.sdf(x, y - e), nl = Math.hypot(nx, ny) || 1;
          const ux = nx / nl, uy = ny / nl, dot = dx * ux + dy * uy; dx -= 2 * dot * ux; dy -= 2 * dot * uy; path.push([x, y]);
        }
      }
      path.push([Math.max(0, Math.min(W, x)), Math.max(0, Math.min(H, y))]);
      return path;
    };
    const draw = () => {
      c.fillStyle = "#1E2638"; c.fillRect(0, 0, W, H);
      c.strokeStyle = "#3A4862"; c.lineWidth = 2; c.strokeRect(1, 1, W - 2, H - 2);
      if (revealed) { c.fillStyle = "#F2B20066"; for (let x = 0; x < W; x += 3) for (let y = 0; y < H; y += 3) if (shape.sdf(x, y) < 0) c.fillRect(x, y, 3, 3); }
      shots.forEach((p, i) => {
        const hue = (i * 47) % 360, col = `hsl(${hue} 85% 65%)`;
        if (revealed) { c.strokeStyle = col; c.lineWidth = 1.5; c.beginPath(); p.forEach(([x, y], k) => k ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke(); }
        const [ix, iy] = p[0], [ox, oy] = p[p.length - 1];
        c.fillStyle = col; c.beginPath(); c.moveTo(ix, iy - 6); c.lineTo(ix + 12, iy); c.lineTo(ix, iy + 6); c.fill();
        c.beginPath(); c.arc(ox, oy, 6, 0, 6.283); c.fill();
      });
      c.fillStyle = "#AFC0DB"; c.font = "13px Lexend, sans-serif"; c.fillText(revealed ? "Revealed! Lines show the real paths." : "▶ = marble in    ● = marble out", 12, H - 12);
    };
    const fire = (y) => { shots.push(trace(y)); AN.$("#mb-count").textContent = `${shots.length} marbles fired`; draw(); };
    cv.onclick = (e) => { const r = cv.getBoundingClientRect(); fire((e.clientY - r.top) * H / r.height); };
    AN.$("#mb-ten").onclick = () => { for (let i = 0; i < 10; i++) fire(20 + Math.random() * (H - 40)); };
    AN.$("#mb-check").onclick = () => {
      const g = AN.$("#mb-guess").value; if (!g) { AN.$("#mb-res").innerHTML = `<div class="fb info">Make a guess first.</div>`; return; }
      if (shots.length < 5) { AN.$("#mb-res").innerHTML = `<div class="fb info">Collect more evidence first: fire at least 5 marbles.</div>`; return; }
      revealed = true; draw(); const ok = g === key;
      AN.$("#mb-res").innerHTML = `<div class="fb ${ok ? "ok" : "no"}">${ok ? "<b>Your model was right!</b>" : `<b>Not this time.</b> It was ${shape.name}.`} Look at how each marble bounced off the surface.</div><button class="btn btn-soft btn-sm" style="margin-top:8px" onclick="AN.route()">New mystery box</button>`;
      if (ok) AN.addXP(15, "mystery solved");
    };
    draw();
  };

  /* ============ Gold foil ============ */
  L.foil = (v) => {
    AN.labVisit("foil");
    v.appendChild(h(`<div class="wrap">${head("Gold Foil Experiment", "Fire alpha particles at a thin sheet of gold atoms. Compare what Thomson's model predicts with what Rutherford actually saw.")}
      <div id="gf-pred"></div>
      <div class="lab-wrap"><div class="stage"><canvas id="gf-cv"></canvas></div>
      <div class="card stack"><div class="seg" role="group" aria-label="Atomic model"><button aria-pressed="true" data-m="thomson">Thomson model</button><button aria-pressed="false" data-m="ruth">Nuclear model</button></div>
        <div class="row"><button class="btn btn-teal" id="gf-go">Fire 500 particles</button><button class="btn btn-line btn-sm" id="gf-clear">Clear</button></div>
        <table class="data"><tr><th>Went straight through</th><td class="num" id="gf-a">0</td></tr><tr><th>Deflected a little (&lt; 10°)</th><td class="num" id="gf-b">0</td></tr><tr><th>Deflected a lot (10°–90°)</th><td class="num" id="gf-c">0</td></tr><tr><th>Bounced back (&gt; 90°)</th><td class="num" id="gf-d">0</td></tr></table>
        <p class="small muted" id="gf-note"></p></div></div></div>`));
    const pq = { id: "lab-foil-pre", type: "mcq", q: "If atoms were “raisin buns” (positive charge spread out), what would happen to the alpha particles?", choices: ["Nearly all pass through with tiny deflections", "Most bounce back", "Half pass through, half bounce back"], answer: 0, why: { 1: "Spread-out charge is too weak to turn a fast particle around.", 2: "Nothing in the raisin bun is concentrated enough to bounce particles back." }, sol: "Thomson's model predicts nearly everything passes through. Now fire particles at both models and compare." };
    AN.$("#gf-pred").appendChild(AN.Q(pq, { mode: "predict" }));
    const cv = AN.$("#gf-cv"), W = 520, H = 340, c = fitCanvas(cv, W, H);
    let model = "thomson", parts = [], counts = [0, 0, 0, 0], raf;
    const foilX = 300, nuclei = []; for (let y = 18; y < H; y += 34) nuclei.push(y);
    const launch = () => { for (let i = 0; i < 500; i++) parts.push({ x: -Math.random() * 300, y: 10 + Math.random() * (H - 20), vx: 4, vy: 0, done: false, trail: [] }); };
    const step = () => {
      c.fillStyle = css("--surface-2"); c.fillRect(0, 0, W, H);
      c.fillStyle = "#F2B20033"; c.fillRect(foilX - 6, 0, 12, H);
      nuclei.forEach(y => { if (model === "ruth") { c.fillStyle = "#E2402F"; c.beginPath(); c.arc(foilX, y, 2.5, 0, 6.283); c.fill(); } else { c.fillStyle = "#F2B20055"; c.beginPath(); c.arc(foilX, y, 16, 0, 6.283); c.fill(); } });
      c.fillStyle = "#7B4FD8"; c.fillRect(0, H / 2 - 10, 18, 20);
      parts.forEach(p => {
        if (p.done) return;
        if (p.x < foilX && p.x + p.vx >= foilX) {
          const ny = nuclei.reduce((a, b) => Math.abs(b - p.y) < Math.abs(a - p.y) ? b : a); const b = p.y - ny;
          let ang;
          if (model === "ruth") { const k = 0.08; ang = 2 * Math.atan(k / Math.max(Math.abs(b), 0.05)) * Math.sign(b || 1); }
          else ang = (Math.random() - .5) * 0.03;
          const sp = 4; p.vx = sp * Math.cos(ang); p.vy = sp * Math.sin(ang);
          const deg = Math.abs(ang) * 180 / Math.PI; counts[deg < 1 ? 0 : deg < 10 ? 1 : deg < 90 ? 2 : 3]++;
        }
        p.x += p.vx; p.y += p.vy;
        if (p.x > W || p.x < -320 || p.y < 0 || p.y > H) p.done = true;
        if (p.x > 0) { c.fillStyle = "#3B5BDB"; c.beginPath(); c.arc(p.x, p.y, 2.2, 0, 6.283); c.fill(); }
      });
      ["a", "b", "c", "d"].forEach((k, i) => AN.$("#gf-" + k).textContent = counts[i]);
      raf = requestAnimationFrame(step);
    };
    step();
    AN.$$(".seg button", v).forEach(b => b.onclick = () => { model = b.dataset.m; AN.$$(".seg button", v).forEach(x => x.setAttribute("aria-pressed", String(x === b))); parts = []; counts = [0, 0, 0, 0]; AN.$("#gf-note").textContent = model === "ruth" ? "Each red dot is a tiny, dense nucleus. Most of the foil is empty space. (In the real experiment only about 1 in 8000 bounced back; this simulation exaggerates so you can see it happen.)" : "Positive charge spread through each atom (yellow). No concentrated centre."; });
    AN.$("#gf-note").textContent = "Positive charge spread through each atom (yellow). No concentrated centre.";
    AN.$("#gf-go").onclick = launch;
    AN.$("#gf-clear").onclick = () => { parts = []; counts = [0, 0, 0, 0]; };
    return () => cancelAnimationFrame(raf);
  };

  /* ============ Atom builder ============ */
  L.atom = (v) => {
    AN.labVisit("atom");
    const STABLE = { 1: [0, 1], 2: [1, 2], 3: [3, 4], 4: [5], 5: [5, 6], 6: [6, 7], 7: [7, 8], 8: [8, 9, 10], 9: [10], 10: [10, 11, 12], 11: [12], 12: [12, 13, 14], 13: [14], 14: [14, 15, 16], 15: [16], 16: [16, 17, 18, 20], 17: [18, 20], 18: [18, 20, 22], 19: [20, 22], 20: [20, 22, 23, 24, 26, 28] };
    const CH = [
      { t: "Build a carbon-12 atom", ok: (p, n, e) => p === 6 && n === 6 && e === 6 },
      { t: "Build deuterium (hydrogen-2)", ok: (p, n, e) => p === 1 && n === 1 && e === 1 },
      { t: "Build a neutral lithium-7 atom", ok: (p, n, e) => p === 3 && n === 4 && e === 3 },
      { t: "Build a sodium ion, Na⁺ (sodium-23)", ok: (p, n, e) => p === 11 && n === 12 && e === 10 },
      { t: "Build an oxide ion, O²⁻ (oxygen-16)", ok: (p, n, e) => p === 8 && n === 8 && e === 10 },
      { t: "Build the atom with electron arrangement 2, 8, 5 (mass number 31)", ok: (p, n, e) => p === 15 && n === 16 && e === 15 },
      { t: "Build an isotope of chlorine with 20 neutrons", ok: (p, n, e) => p === 17 && n === 20 && e === 17 },
      { t: "Build a calcium ion with the same electron arrangement as argon (calcium-40)", ok: (p, n, e) => p === 20 && n === 20 && e === 18 }
    ];
    let p = 3, n = 4, e = 3, ci = 0, done = 0;
    v.appendChild(h(`<div class="wrap">${head("Atom Builder", "Add or remove protons, neutrons and electrons. Watch the element, mass number and charge change.")}
      <div class="lab-wrap"><div class="stage" style="display:grid;place-items:center;min-height:320px" id="ab-stage"></div>
      <div class="card stack">
        ${[["p", "Protons", "#E2402F"], ["n", "Neutrons", "#5B6B85"], ["e", "Electrons", "#3B5BDB"]].map(([k, lab, col]) => `<div class="row" style="justify-content:space-between"><b><span class="sw" style="background:${col}"></span> ${lab}</b><div class="counter"><button aria-label="fewer ${lab}" data-k="${k}" data-d="-1">−</button><output id="ab-${k}">0</output><button aria-label="more ${lab}" data-k="${k}" data-d="1">+</button></div></div>`).join("")}
        <div id="ab-out" class="fb info"></div></div></div>
      <div class="card"><div class="eyebrow">Challenge <span id="ab-ci"></span></div><h2 id="ab-ct"></h2><div class="row"><button class="btn btn-main" id="ab-check">Check my atom</button><button class="btn btn-soft" id="ab-skip">Skip</button></div><div id="ab-res" style="margin-top:10px"></div></div></div>`));
    const abRoot = v.lastElementChild;
    const render = () => {
      ["p", "n", "e"].forEach(k => AN.$("#ab-" + k).textContent = { p, n, e }[k]);
      const el = p ? AN.ELEMENTS[p - 1] : null, A = p + n, q = p - e;
      const chargeStr = q === 0 ? "" : (Math.abs(q) > 1 ? Math.abs(q) : "") + (q > 0 ? "+" : "−");
      let stage = "";
      if (!p) stage = `<p class="muted">Add a proton to make an element.</p>`;
      else {
        const sh = AN.shells(e); const size = 260, cx = size / 2;
        let s = `<circle cx="${cx}" cy="${cx}" r="${18 + Math.sqrt(A) * 2.4}" style="fill:#E2402F" opacity=".9"/><text x="${cx}" y="${cx - 2}" text-anchor="middle" font-size="12" font-weight="700" style="fill:#fff;font-family:var(--f-mono)">${p}p</text><text x="${cx}" y="${cx + 13}" text-anchor="middle" font-size="12" font-weight="700" style="fill:#fff;font-family:var(--f-mono)">${n}n</text>`;
        sh.forEach((cnt, i) => { const r = 58 + i * 22; s += `<circle cx="${cx}" cy="${cx}" r="${r}" style="fill:none;stroke:var(--muted)"/>`; for (let k = 0; k < cnt; k++) { const a = k / cnt * 6.283 - 1.57; s += `<circle cx="${cx + r * Math.cos(a)}" cy="${cx + r * Math.sin(a)}" r="5" style="fill:#3B5BDB"/>`; } });
        stage = `<svg viewBox="0 0 ${size} ${size}" width="${size}" role="img" aria-label="Atom with ${p} protons, ${n} neutrons, ${e} electrons">${s}</svg>`;
      }
      AN.$("#ab-stage").innerHTML = stage;
      if (!p) { AN.$("#ab-out").innerHTML = "No protons yet."; return; }
      const stable = (STABLE[p] || []).includes(n);
      AN.$("#ab-out").innerHTML = `<div style="font-size:34px">${F.nuclide(A, p, el.sym, chargeStr)}</div><b>${el.name}-${A}</b>${q ? ` · ${q > 0 ? "positive ion (cation)" : "negative ion (anion)"}, charge ${q > 0 ? "+" : "−"}${Math.abs(q)}` : " · neutral atom"}<br>Electron arrangement: <span class="mono">${e > 20 ? "too many for this model" : AN.shells(e).join(", ") || "none"}</span><br>${p <= 20 ? (stable ? `<span style="color:var(--good)">● Stable isotope (found in nature)</span>` : `<span style="color:var(--bad)">● Unstable: this nucleus would be radioactive</span>`) : ""}`;
    };
    const setCh = () => { AN.$("#ab-ci").textContent = `${ci + 1} of ${CH.length}`; AN.$("#ab-ct").textContent = CH[ci].t; AN.$("#ab-res").innerHTML = ""; };
    AN.$$(".counter button", v).forEach(b => b.onclick = () => { const d = +b.dataset.d; if (b.dataset.k === "p") p = Math.max(0, Math.min(20, p + d)); if (b.dataset.k === "n") n = Math.max(0, Math.min(30, n + d)); if (b.dataset.k === "e") e = Math.max(0, Math.min(22, e + d)); render(); });
    AN.$("#ab-check").onclick = () => {
      if (CH[ci].ok(p, n, e)) { done++; AN.$("#ab-res").innerHTML = `<div class="fb ok"><b>Perfect atom!</b> +10 XP</div>`; AN.addXP(10); if (done >= 4) AN.badge("builder"); setTimeout(() => { if (!document.contains(abRoot)) return; ci = (ci + 1) % CH.length; setCh(); }, 1300); }
      else AN.$("#ab-res").innerHTML = `<div class="fb no"><b>Not yet.</b> Check: protons decide the element, protons + neutrons = mass number, and electrons decide the charge.</div>`;
    };
    AN.$("#ab-skip").onclick = () => { ci = (ci + 1) % CH.length; setCh(); };
    render(); setCh();
  };

  /* ============ Trend grapher ============ */
  L.trend = (v) => {
    AN.labVisit("trend");
    const PROPS = { ie: { name: "1st ionization energy", unit: "kJ/mol", max: 2600 }, radius: { name: "Atomic radius", unit: "pm", max: 280 }, en: { name: "Electronegativity", unit: "", max: 4.4 } };
    const PRED = {
      ie: { q: "Before you look: which elements will sit at the PEAKS of the ionization energy graph?", choices: ["alkali metals", "noble gases", "halogens", "transition metals"], answer: 1, why: { 0: "Alkali metals are at the lowest points; they lose electrons easily.", 2: "Halogens are high, but just below the peaks.", 3: "Transition metals form a fairly flat middle section." }, sol: "Noble gases (He, Ne, Ar, Kr) have full valence levels, so they hold electrons most tightly." },
      radius: { q: "Before you look: which elements will be at the PEAKS of the atomic radius graph?", choices: ["alkali metals", "noble gases", "halogens", "metalloids"], answer: 0, why: { 1: "Noble gases are among the smallest in each period.", 2: "Halogens are small; they're near the right of each period.", 3: "Metalloids are mid-sized." }, sol: "Each alkali metal starts a new energy level, so it's the biggest atom in its period." },
      en: { q: "Before you look: as you go across a period, electronegativity will mostly…", choices: ["increase", "decrease", "stay the same"], answer: 0, why: { 1: "More protons and smaller atoms pull harder on shared electrons.", 2: "It changes a lot!" }, sol: "It increases across a period, up to the halogen." }
    };
    let prop = "ie"; const shown = {};
    v.appendChild(h(`<div class="wrap">${head("Trend Grapher", "Graph a property against atomic number for elements 1 to 36. Predict the pattern before you see it.")}
      <div class="card"><div class="row" style="justify-content:space-between"><div class="seg" role="group" aria-label="Property">${Object.entries(PROPS).map(([k, p]) => `<button aria-pressed="${k === prop}" data-p="${k}">${p.name}</button>`).join("")}</div>
      <label class="small row" style="gap:6px"><input type="checkbox" id="tg-fam" checked> colour by family</label></div>
      <div id="tg-pred" style="margin-top:14px"></div><div id="tg-chart" style="margin-top:12px"></div><div id="tg-tip" class="small muted"></div></div>
      <div class="card"><h2>What do you notice?</h2><ul class="prose" style="margin:0"><li>Find the repeating “saw-tooth” shape. It restarts every period, which is the <b>periodic law</b> in action.</li><li>Ionization energy and atomic radius move in <b>opposite</b> directions. Why?</li><li>Look for the small dips after Be and N in the ionization energy graph. ${`<span class="pill pb">${icon("scope")}Beyond the Book</span>`} They come from sublevels (s and p).</li></ul></div></div>`));
    const tgRoot = v.lastElementChild;
    const famCol = { alkali: "#E2402F", alkaline: "#D9690A", noble: "#7B4FD8", halogen: "#3B5BDB", transition: "#5B6B85", nonmetal: "#0E9F94", metalloid: "#2F9E44", post: "#C2338F" };
    const draw = () => {
      const P = PROPS[prop];
      AN.$$(".seg button", v).forEach(b => b.setAttribute("aria-pressed", String(b.dataset.p === prop)));
      const pred = AN.$("#tg-pred"); pred.innerHTML = "";
      if (!shown[prop]) {
        const q = Object.assign({ id: "trend-" + prop, type: "mcq" }, PRED[prop]);
        pred.appendChild(AN.Q(q, { mode: "predict", onDone: () => { shown[prop] = true; setTimeout(() => { if (document.contains(tgRoot)) draw(); }, 900); } }));
        AN.$("#tg-chart").innerHTML = `<div class="figure" style="text-align:center;padding:40px 10px;color:var(--muted)">${icon("lock")} The graph appears after you lock in a prediction.</div>`;
        return;
      }
      const fam = AN.$("#tg-fam").checked;
      const pts = AN.ELEMENTS.filter(e => e.z <= 36 && e[prop] != null).map(e => ({ x: e.z, y: e[prop], c: fam ? famCol[e.cat] : undefined, tip: `${e.name} (${e.sym}): ${e[prop]} ${P.unit}`, label: ["alkali", "noble"].includes(e.cat) ? e.sym : "" }));
      AN.$("#tg-chart").innerHTML = `<div class="figure">${F.line(pts, { xmin: 1, xmax: 36, ymax: P.max, ymin: 0, dots: true, xticks: [1, 3, 11, 19, 36].map(k => ({ x: k, label: AN.ELEMENTS[k - 1].sym + " " + k })), y: `${P.name}${P.unit ? " (" + P.unit + ")" : ""}`, x: "atomic number", yfmt: prop === "en" ? (x => x.toFixed(1)) : null, aria: P.name + " for elements 1 to 36" })}${fam ? `<div class="row small" style="justify-content:center;margin-top:6px">${Object.entries(famCol).map(([k, c]) => `<span><span class="sw" style="background:${c}"></span> ${AN.CAT_LABEL[k]}</span>`).join("")}</div>` : ""}</div>`;
      AN.$("#tg-tip").textContent = "Hover or tap a dot to see its value.";
      AN.$$("#tg-chart circle").forEach(cn => cn.addEventListener("click", () => AN.$("#tg-tip").textContent = cn.querySelector("title")?.textContent || ""));
    };
    AN.$$(".seg button", v).forEach(b => b.onclick = () => { prop = b.dataset.p; draw(); });
    AN.$("#tg-fam").onchange = draw;
    draw();
  };

  /* ============ Alkali metals ============ */
  L.alkali = (v) => {
    AN.labVisit("alkali");
    const MET = {
      Li: { speed: 0.6, fizz: 0.25, life: 900, flame: null, note: "Floats and fizzes steadily. Slowly shrinks." },
      Na: { speed: 2.2, fizz: 0.6, life: 380, flame: null, note: "Melts into a shiny ball and zooms across the surface, hissing." },
      K: { speed: 4, fizz: 1, life: 200, flame: "#B57BEA", note: "Bursts into a lilac flame immediately and may pop." },
      Rb: { speed: 6, fizz: 1.6, life: 70, flame: "#E0213A", note: "Reacts explosively. (Simulation only; far too dangerous for a school lab.)" },
      Cs: { speed: 8, fizz: 2.4, life: 35, flame: "#5B8DEF", note: "Explodes violently on contact. It can shatter the container! (Simulation only.)" }
    };
    let unlocked = false;
    v.appendChild(h(`<div class="wrap">${head("Alkali Metals in Water", "Drop a small piece of each Group 1 metal into water with phenolphthalein indicator. Compare their reactivity.")}
      <div id="ak-pred"></div>
      <div class="lab-wrap"><div class="stage"><canvas id="ak-cv"></canvas></div>
      <div class="card stack"><div class="eyebrow">Choose a metal</div><div class="row" id="ak-btns">${Object.keys(MET).map(s => `<button class="btn btn-soft" data-s="${s}" ${["Rb", "Cs"].includes(s) ? "disabled" : ""}>${AN.el(s).name}</button>`).join("")}</div>
        <p class="small muted" id="ak-lock">Rubidium and cesium unlock after your prediction.</p>
        <div class="fb info" id="ak-obs">Drop a metal into the water.</div>
        <p class="small muted">Equation for all of them: 2 M(s) + 2 H₂O(l) → 2 MOH(aq) + H₂(g). The pink colour shows a basic (alkaline) solution formed.</p></div></div>
      <div class="card"><h2>Observation table</h2><div id="ak-table"></div></div></div>`));
    const obsRows = {};
    const pq = { id: "lab-alkali-pre", type: "order", q: "Predict: order these from LEAST to MOST reactive with water.", items: ["lithium", "sodium", "potassium", "rubidium", "cesium"], sol: "Reactivity increases down Group 1: Li < Na < K < Rb < Cs. Bigger atoms lose their single valence electron more easily." };
    AN.$("#ak-pred").appendChild(AN.Q(pq, { mode: "predict", onDone: () => { unlocked = true; AN.$$("#ak-btns button").forEach(b => b.disabled = false); AN.$("#ak-lock").hidden = true; } }));
    const cv = AN.$("#ak-cv"), W = 520, H = 340, c = fitCanvas(cv, W, H);
    let m = null, x = 260, dir = 1, life = 0, pink = 0, bubbles = [], raf, t = 0, sym = null, boom = 0;
    const loop = () => {
      t++; c.fillStyle = css("--surface-2"); c.fillRect(0, 0, W, H);
      c.strokeStyle = "#8D99AE"; c.lineWidth = 4; c.beginPath(); c.moveTo(60, 60); c.lineTo(70, 320); c.lineTo(450, 320); c.lineTo(460, 60); c.stroke();
      c.fillStyle = `rgba(${Math.round(200 + pink * 40)},${Math.round(225 - pink * 140)},${Math.round(245 - pink * 60)},.8)`; c.fillRect(66, 140, 388, 178);
      if (m && life > 0) {
        life--; x += dir * m.speed * (0.6 + Math.random() * 0.8); if (x < 90 || x > 430) dir *= -1;
        const r = 12 * Math.max(0.15, life / m.life);
        c.fillStyle = "#CDD3DB"; c.beginPath(); c.arc(x, 140, r, 0, 6.283); c.fill();
        if (m.flame) { c.fillStyle = m.flame + "BB"; c.beginPath(); c.moveTo(x - r, 136); c.quadraticCurveTo(x, 70 - Math.random() * 30, x + r, 136); c.fill(); }
        for (let k = 0; k < m.fizz * 3; k++) bubbles.push({ x: x + (Math.random() - .5) * 30, y: 145 + Math.random() * 10, v: 0.5 + Math.random() });
        pink = Math.min(1, pink + 0.004 * m.fizz);
        if (life <= 0 && m.speed > 5) boom = 30;
      }
      bubbles.forEach(b => { b.y -= b.v; c.fillStyle = "rgba(255,255,255,.8)"; c.beginPath(); c.arc(b.x, b.y, 2, 0, 6.283); c.fill(); });
      bubbles = bubbles.filter(b => b.y > 60).slice(-400);
      if (boom > 0) { boom--; c.fillStyle = `rgba(255,${150 + boom * 3},40,${boom / 30})`; c.beginPath(); c.arc(x, 140, 120 - boom * 3, 0, 6.283); c.fill(); }
      raf = requestAnimationFrame(loop);
    };
    loop();
    const table = () => AN.$("#ak-table").innerHTML = F.table(["Metal", "Speed of reaction", "Observations"], Object.keys(MET).filter(s => obsRows[s]).map(s => [AN.el(s).name, "●".repeat(Math.ceil(MET[s].speed / 1.6)), MET[s].note]));
    AN.$$("#ak-btns button").forEach(b => b.onclick = () => { sym = b.dataset.s; m = MET[sym]; life = m.life; x = 260; pink = 0; bubbles = []; AN.$("#ak-obs").innerHTML = `<b>${AN.el(sym).name}:</b> ${m.note}`; obsRows[sym] = true; table(); });
    table();
    return () => cancelAnimationFrame(raf);
  };

  L.list = [
    { href: "#table", name: "Periodic Table", desc: "Families, heat maps and a find-it quiz", sec: "1.1 · 1.5", svg: `<svg viewBox="0 0 40 40"><g style="fill:var(--teal)"><rect x="3" y="6" width="7" height="7" rx="2"/><rect x="30" y="6" width="7" height="7" rx="2"/><rect x="3" y="15" width="7" height="7" rx="2"/></g><g style="fill:var(--grape)"><rect x="12" y="24" width="7" height="7" rx="2"/><rect x="21" y="24" width="7" height="7" rx="2"/></g><g style="fill:var(--brand)"><rect x="30" y="15" width="7" height="7" rx="2"/><rect x="30" y="24" width="7" height="7" rx="2"/></g></svg>` },
    { href: "#lab-box", name: "Mystery Box", desc: "Build a model of something you can't see", sec: "1.2", svg: `<svg viewBox="0 0 40 40"><rect x="5" y="9" width="30" height="24" rx="3" style="fill:var(--grape)"/><text x="20" y="27" text-anchor="middle" font-size="16" font-weight="700" style="fill:#fff">?</text></svg>` },
    { href: "#lab-foil", name: "Gold Foil", desc: "Recreate Rutherford's famous experiment", sec: "1.2", svg: `<svg viewBox="0 0 40 40"><rect x="22" y="4" width="5" height="32" style="fill:var(--sun)"/><path d="M2 12h20M2 20h18l-12 -9M2 28h20" style="stroke:var(--beyond);fill:none" stroke-width="2.5"/><circle cx="24.5" cy="20" r="2.5" style="fill:var(--brand)"/></svg>` },
    { href: "#lab-atom", name: "Atom Builder", desc: "Build atoms, isotopes and ions", sec: "1.3 · 1.4", svg: `<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="5" style="fill:var(--brand)"/><circle cx="20" cy="20" r="11" style="fill:none;stroke:var(--muted)"/><circle cx="20" cy="20" r="17" style="fill:none;stroke:var(--muted)"/><circle cx="31" cy="20" r="2.5" style="fill:var(--beyond)"/><circle cx="20" cy="3" r="2.5" style="fill:var(--beyond)"/><circle cx="8" cy="28" r="2.5" style="fill:var(--beyond)"/></svg>` },
    { href: "#lab-halflife", name: "Half-Life Simulator", desc: "Watch 400 nuclei decay", sec: "1.3", svg: `<svg viewBox="0 0 40 40"><g style="fill:var(--teal)"><circle cx="9" cy="9" r="4"/><circle cx="20" cy="9" r="4"/><circle cx="31" cy="9" r="4"/><circle cx="9" cy="20" r="4"/></g><g style="fill:var(--line)"><circle cx="20" cy="20" r="4"/><circle cx="31" cy="20" r="4"/><circle cx="9" cy="31" r="4"/><circle cx="20" cy="31" r="4"/><circle cx="31" cy="31" r="4"/></g></svg>` },
    { href: "#lab-flame", name: "Flame Test Lab", desc: "Match colours to metals; solve 4 unknowns", sec: "1.4", svg: `<svg viewBox="0 0 40 40"><path d="M20 4c3 8 10 10 10 20a10 10 0 0 1-20 0c0-6 4-8 5-12 1 4 3 5 5 5-2-5-2-9 0-13z" style="fill:#D9690A"/><path d="M20 18c2 4 5 6 5 10a5 5 0 0 1-10 0c0-3 3-5 5-10z" style="fill:#F2B200"/></svg>` },
    { href: "#lab-trend", name: "Trend Grapher", desc: "Predict, then graph periodic trends", sec: "1.5", svg: `<svg viewBox="0 0 40 40"><path d="M4 34h32" style="stroke:var(--muted)" stroke-width="2"/><path d="M6 30c3-14 5-18 7-6 3-14 6-20 8-6 3-12 6-18 9-4" style="stroke:var(--brand);fill:none" stroke-width="2.5" stroke-linecap="round"/></svg>` },
    { href: "#lab-alkali", name: "Alkali Metals in Water", desc: "Li, Na, K, Rb, Cs: who reacts hardest?", sec: "1.5", svg: `<svg viewBox="0 0 40 40"><path d="M6 22h28l-3 13H9z" style="fill:var(--teal)" opacity=".5"/><circle cx="20" cy="20" r="5" style="fill:var(--sun)"/><path d="M14 13l-3-4M26 13l3-4M20 11V5" style="stroke:var(--sun)" stroke-width="2" stroke-linecap="round"/></svg>` }
  ];
})();
