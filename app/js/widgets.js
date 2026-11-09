/* Atomic North — interactive question widget. The answer stays locked until a real attempt. */
(function () {
  const { h, esc, icon, shuffle } = AN;

  /**
   * opts.mode: "practice" | "check" | "predict" | "review" | "boss"
   * opts.onDone(correct, attempts)
   */
  AN.Q = function (q, opts = {}) {
    const mode = opts.mode || "practice";
    const single = mode === "boss" || mode === "predict";
    let attempts = 0, finished = false, conf = "kinda", hintN = 0;
    const lvl = q.lvl || 1;
    const prev = AN.S.q[q.id];
    const label = mode === "predict" ? `<span class="pill pb">${icon("bulb")}Predict first</span>` : mode === "check" ? `<span class="pill p1">${icon("target")}Check your thinking</span>` : AN.lvPill(lvl, mode === "boss" ? "" : ` · +${AN.LV[lvl].xp} XP`);
    const root = h(`<div class="qbox ${mode === "predict" ? "think" : ""}" data-qid="${q.id}">
      <div class="qhead">${label}${prev?.solved && mode !== "boss" ? `<span class="small muted">${icon("star")} solved before</span>` : ""}</div>
      <div class="qtext">${q.q}</div>
      <div class="qbody"></div>
      ${mode === "predict" ? "" : `<div class="conf">How sure are you?<span role="group" aria-label="Confidence" class="row" style="gap:6px"><button type="button" data-c="guess" aria-pressed="false">Just guessing</button><button type="button" data-c="kinda" aria-pressed="true">Kind of sure</button><button type="button" data-c="sure" aria-pressed="false">Totally sure</button></span></div>`}
      <div class="row qactions"><button type="button" class="btn btn-main act-check">${mode === "predict" ? "Lock in my prediction" : "Check"}</button>${q.hints && !single ? `<button type="button" class="btn btn-soft act-hint">${icon("bulb")}Hint</button>` : ""}</div>
      <div class="hints"></div>
      <div class="fbwrap" aria-live="polite"></div>
      ${single || q.type === "text" ? "" : `<div class="lockline">${icon("lock")}The full solution unlocks after you get it right or make 2 tries.</div>`}
      <div class="solwrap"></div>
    </div>`);
    const body = root.querySelector(".qbody"), fbw = root.querySelector(".fbwrap"), solw = root.querySelector(".solwrap"), checkBtn = root.querySelector(".act-check");
    root.querySelectorAll(".conf button").forEach(b => b.onclick = () => { root.querySelectorAll(".conf button").forEach(x => x.setAttribute("aria-pressed", "false")); b.setAttribute("aria-pressed", "true"); conf = b.dataset.c; });
    const hintBtn = root.querySelector(".act-hint");
    if (hintBtn) hintBtn.onclick = () => {
      if (hintN < q.hints.length) { root.querySelector(".hints").appendChild(h(`<div class="hint"><b>Hint ${hintN + 1}.</b> ${q.hints[hintN]}</div>`)); hintN++; }
      if (hintN >= q.hints.length) hintBtn.hidden = true; else hintBtn.lastChild.textContent = `Hint ${hintN + 1}`;
    };
    const fb = (cls, html) => { fbw.innerHTML = `<div class="fb ${cls}">${html}</div>`; };
    const showSolution = () => {
      const lock = root.querySelector(".lockline"); if (lock) lock.remove();
      if (q.sol && !solw.innerHTML) solw.innerHTML = `<div class="solution"><div class="st">${icon("bulb")}Solution</div><p>${q.sol}</p></div>`;
    };
    const finish = (correct) => {
      finished = true; checkBtn.disabled = true; if (hintBtn) hintBtn.hidden = true;
      AN.record(q, { correct, attempts, conf, mode });
      if (mode === "review") AN.reviewResult(q, correct && attempts === 1);
      showSolution();
      opts.onDone && opts.onDone(correct, attempts);
    };
    const praise = () => AN.shuffle(["Nailed it!", "Correct!", "Yes! That's it.", "Spot on!", "Great thinking!"])[0];
    const afterWrong = (msg) => {
      if (single) { fb(mode === "predict" ? "info" : "no", mode === "predict" ? "<b>Interesting prediction.</b> " + msg.replace(/<b>Not quite\.<\/b> ?/, "") : msg); finish(false); return; }
      if (attempts >= 2) { fb("no", msg + " <br>Here's the full solution. Read it, then try a similar question."); finish(false); }
      else fb("no", msg + " Try again.");
    };

    /* ---------- MCQ ---------- */
    if (q.type === "mcq") {
      let sel = null;
      const order = q.keep ? q.choices.map((_, i) => i) : shuffle(q.choices.map((_, i) => i));
      body.innerHTML = `<div class="choices" role="radiogroup">${order.map((i, k) => `<button type="button" class="choice" role="radio" aria-checked="false" data-i="${i}"><span class="key">${"ABCDEF"[k]}</span><span>${q.choices[i]}</span></button>`).join("")}</div>`;
      body.querySelectorAll(".choice").forEach(b => b.onclick = () => { if (finished) return; body.querySelectorAll(".choice").forEach(x => { x.classList.remove("sel"); x.setAttribute("aria-checked", "false"); }); b.classList.add("sel"); b.setAttribute("aria-checked", "true"); sel = +b.dataset.i; });
      checkBtn.onclick = () => {
        if (sel === null) { fb("info", "Pick an answer first. A guess is fine; that's how you learn."); return; }
        attempts++;
        const btn = body.querySelector(`.choice[data-i="${sel}"]`);
        if (sel === q.answer) { btn.classList.add("right"); fb("ok", `<b>${mode === "predict" ? "Good prediction!" : praise()}</b>`); body.querySelectorAll(".choice").forEach(x => x.disabled = true); finish(true); }
        else {
          btn.classList.add("wrong"); btn.disabled = true;
          const why = q.why?.[sel] || "Not quite.";
          if (mode === "predict") { body.querySelector(`.choice[data-i="${q.answer}"]`).classList.add("right"); fb("info", `<b>Interesting prediction.</b> ${why}`); body.querySelectorAll(".choice").forEach(x => x.disabled = true); finish(false); return; }
          sel = null;
          afterWrong(`<b>Not quite.</b> ${why}`);
          if (finished) { body.querySelector(`.choice[data-i="${q.answer}"]`).classList.add("right"); body.querySelectorAll(".choice").forEach(x => x.disabled = true); }
        }
      };
    }

    /* ---------- numeric ---------- */
    else if (q.type === "num") {
      body.innerHTML = `<div class="ansrow"><label class="small muted" for="in-${q.id}">Your answer</label><input id="in-${q.id}" inputmode="decimal" autocomplete="off" placeholder="?">${q.unit ? `<span class="unit">${q.unit}</span>` : ""}</div>`;
      const inp = body.querySelector("input");
      inp.addEventListener("keydown", e => { if (e.key === "Enter") checkBtn.click(); });
      checkBtn.onclick = () => {
        const raw = inp.value.replace(/[\s,]/g, "").replace(/[^\d.\-−]/g, "").replace("−", "-");
        if (raw === "" || isNaN(+raw)) { fb("info", "Type a number first. Your best estimate counts."); return; }
        attempts++;
        const v = +raw;
        if (Math.abs(v - q.answer) <= (q.tol || 0) + 1e-9) { inp.disabled = true; fb("ok", `<b>${praise()}</b> ${q.answer}${q.unit ? " " + q.unit : ""}.`); finish(true); return; }
        const trapKey = Object.keys(q.traps || {}).find(k => Math.abs(+k - v) < 1e-6);
        afterWrong(trapKey ? `<b>Close thinking, but…</b> ${q.traps[trapKey]}` : `<b>Not quite.</b> ${v > q.answer ? "Your answer is too high." : "Your answer is too low."}${q.hints && hintN === 0 && !single ? " Try a hint." : ""}`);
        if (finished) inp.disabled = true;
      };
    }

    /* ---------- written answer ---------- */
    else if (q.type === "text") {
      body.innerHTML = `<label class="small muted" for="ta-${q.id}">Write your answer in your own words</label><textarea id="ta-${q.id}" placeholder="Type here…">${esc(AN.S.explain["q-" + q.id] || "")}</textarea>`;
      const ta = body.querySelector("textarea");
      ta.addEventListener("input", () => { AN.S.explain["q-" + q.id] = ta.value; AN.save(); });
      checkBtn.textContent = "Submit my answer";
      checkBtn.onclick = () => {
        if (ta.value.trim().length < 15) { fb("info", "Write at least a sentence first. The model answer unlocks after you try."); return; }
        attempts = 1; ta.readOnly = true; checkBtn.disabled = true;
        const ck = `<div class="checklist">${q.checklist.map((c, i) => `<label><input type="checkbox" data-i="${i}"> ${c}</label>`).join("")}</div>`;
        fb("info", `<b>Compare with the model answer.</b> Tick what your answer covered.${ck}<div class="row" style="margin-top:10px"><button type="button" class="btn btn-teal btn-sm act-self">Save my self-check</button>${AN.S.ai.key ? `<button type="button" class="btn btn-line btn-sm act-ai">${icon("chat")}Ask the AI Tutor to mark it</button>` : `<a class="small" href="#settings">Turn on the AI Tutor for real marking</a>`}</div><div class="aiout"></div>`);
        solw.innerHTML = `<div class="solution"><div class="st">${icon("bulb")}Model answer</div><p>${q.model}</p></div>`;
        fbw.querySelector(".act-self").onclick = (e) => {
          const n = fbw.querySelectorAll(".checklist input:checked").length;
          e.target.disabled = true;
          const ok = n >= Math.ceil(q.checklist.length * 0.66);
          fbw.querySelector(".aiout").innerHTML = `<p class="small" style="margin:8px 0 0">${ok ? "Strong answer. Saved!" : "Saved. Try rewriting it to include the missing points; it's the best way to remember them."}</p>`;
          if (!finished) finish(ok);
        };
        const aiBtn = fbw.querySelector(".act-ai");
        if (aiBtn) aiBtn.onclick = async () => {
          aiBtn.disabled = true; const out = fbw.querySelector(".aiout"); out.innerHTML = `<p class="small muted">The tutor is reading your answer…</p>`;
          try {
            const r = await AN.AI.grade({ question: q.q, model: q.model, checklist: q.checklist, answer: ta.value });
            out.innerHTML = `<div class="fb ${r.score >= 2 ? "ok" : "no"}" style="margin-top:10px"><b>AI Tutor: ${r.score}/3</b><br>${esc(r.feedback)}${r.missing?.length ? `<br><span class="small">Still missing: ${r.missing.map(esc).join("; ")}</span>` : ""}</div>`;
            if (!finished) finish(r.score >= 2);
          } catch (err) { out.innerHTML = `<p class="small" style="color:var(--bad)">${esc(err.message)}</p>`; aiBtn.disabled = false; }
        };
      };
    }

    /* ---------- sort into buckets ---------- */
    else if (q.type === "sort") {
      const items = shuffle(q.items.map((it, i) => ({ t: it[0], b: it[1], i })));
      body.innerHTML = `<p class="small muted" style="margin:0">Tap an item, then tap a box. (On a computer you can also drag.)</p><div class="sort-pool" data-b="-1">${items.map(it => `<span class="chipitem" draggable="true" tabindex="0" data-i="${it.i}">${it.t}</span>`).join("")}</div><div class="buckets">${q.buckets.map((b, k) => `<div class="bucket" data-b="${k}" tabindex="0"><h4>${b}</h4><div class="bucket-items"></div></div>`).join("")}</div>`;
      let picked = null;
      const place = (chip, target) => { chip.classList.remove("picked", "wrong", "right"); (target.classList.contains("bucket") ? target.querySelector(".bucket-items") : target).appendChild(chip); picked = null; };
      body.querySelectorAll(".chipitem").forEach(c => {
        c.onclick = (e) => { e.stopPropagation(); if (finished) return; if (picked && picked !== c && !c.closest(".sort-pool")) { place(picked, c.closest(".bucket")); return; } if (picked === c) { c.classList.remove("picked"); picked = null; return; } body.querySelectorAll(".chipitem").forEach(x => x.classList.remove("picked")); c.classList.add("picked"); picked = c; };
        c.onkeydown = e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); c.click(); } };
        c.ondragstart = e => { picked = c; e.dataTransfer.setData("text/plain", c.dataset.i); };
      });
      body.querySelectorAll(".bucket, .sort-pool").forEach(bk => {
        bk.onclick = () => { if (picked && !finished) place(picked, bk); };
        bk.onkeydown = e => { if ((e.key === "Enter" || e.key === " ") && picked) { e.preventDefault(); place(picked, bk); } };
        bk.ondragover = e => { e.preventDefault(); bk.classList.add("over"); };
        bk.ondragleave = () => bk.classList.remove("over");
        bk.ondrop = e => { e.preventDefault(); bk.classList.remove("over"); if (picked && !finished) place(picked, bk); };
      });
      checkBtn.onclick = () => {
        const pool = body.querySelector(".sort-pool");
        if (pool.querySelectorAll(".chipitem").length) { fb("info", "Place every item in a box first."); return; }
        attempts++;
        let wrong = 0;
        body.querySelectorAll(".bucket").forEach(bk => bk.querySelectorAll(".chipitem").forEach(c => { const ok = q.items[+c.dataset.i][1] === +bk.dataset.b; c.classList.add(ok ? "right" : "wrong"); if (!ok) wrong++; }));
        if (!wrong) { fb("ok", `<b>${praise()}</b> Everything is in the right place.`); finish(true); return; }
        afterWrong(`<b>${wrong} item${wrong > 1 ? "s are" : " is"} in the wrong box</b> (shown in pink).`);
        if (!finished) setTimeout(() => body.querySelectorAll(".chipitem.wrong").forEach(c => place(c, pool)), 1400);
        else body.querySelectorAll(".bucket .chipitem").forEach(c => { if (c.classList.contains("wrong")) c.title = "belongs in: " + q.buckets[q.items[+c.dataset.i][1]]; });
      };
    }

    /* ---------- put in order ---------- */
    else if (q.type === "order") {
      let cur = shuffle(q.items.map((t, i) => i)); if (cur.every((v, i) => v === i)) cur.reverse();
      const draw = () => {
        body.innerHTML = `<div class="order-list">${cur.map((i, k) => `<div class="order-item" data-i="${i}"><span class="key mono" style="font-weight:700">${k + 1}.</span><span>${q.items[i]}</span><span class="mv"><button type="button" aria-label="Move up" data-d="-1" data-k="${k}" ${k === 0 || finished ? "disabled" : ""}>↑</button><button type="button" aria-label="Move down" data-d="1" data-k="${k}" ${k === cur.length - 1 || finished ? "disabled" : ""}>↓</button></span></div>`).join("")}</div>`;
        body.querySelectorAll(".mv button").forEach(b => b.onclick = () => { const k = +b.dataset.k, d = +b.dataset.d;[cur[k], cur[k + d]] = [cur[k + d], cur[k]]; draw(); body.querySelector(`.mv button[data-k="${k + d}"][data-d="${d}"]`)?.focus(); });
      };
      draw();
      checkBtn.onclick = () => {
        attempts++;
        const okCount = cur.filter((v, i) => v === i).length;
        if (okCount === cur.length) { finished = true; draw(); finished = false; fb("ok", `<b>${praise()}</b> Perfect order.`); finish(true); return; }
        afterWrong(`<b>${okCount} of ${cur.length} are in the right spot.</b>`);
        if (finished) { cur = q.items.map((_, i) => i); draw(); }
      };
    }
    return root;
  };

  /* ---------- worked example: each step opens only after the student tries it ---------- */
  AN.Worked = function (w, id) {
    const root = h(`<div class="worked"><div class="qhead"><span class="pill p2">${icon("bulb")}Worked example · try each step first</span></div>
      <div class="wk-title">${w.title}</div><div class="qtext">${w.problem}</div><ol class="wk-steps"></ol></div>`);
    const list = root.querySelector(".wk-steps");
    let i = 0;
    const next = () => {
      if (i >= w.steps.length) {
        list.appendChild(h(`<li class="wk-done">${icon("star")} You worked through every step. That's exactly how to set out a test answer.</li>`));
        if (!AN.S.q[id]) { AN.S.q[id] = { tries: 1, solved: true, last: Date.now() }; AN.save(); AN.addXP(10, "worked example"); }
        return;
      }
      const st = w.steps[i], k = i; let tries = 0;
      const li = h(`<li class="wk-step"><div class="wk-ask"><b>Step ${k + 1}.</b> ${st.ask}</div>
        <div class="ansrow">${st.answer != null ? `<input inputmode="decimal" autocomplete="off" placeholder="?" aria-label="Step ${k + 1} answer">${st.unit ? `<span class="unit">${st.unit}</span>` : ""}` : `<input class="wk-text" autocomplete="off" placeholder="Your idea…" aria-label="Step ${k + 1} answer">`}
        <button type="button" class="btn btn-teal btn-sm">${st.answer != null ? "Check" : "Show this step"}</button></div><div class="wk-fb"></div></li>`);
      list.appendChild(li);
      const inp = li.querySelector("input"), btn = li.querySelector("button"), fbx = li.querySelector(".wk-fb");
      const reveal = (ok) => { btn.disabled = true; inp.disabled = true; fbx.innerHTML = `<div class="fb ${ok === false ? "info" : "ok"}">${ok === true ? "<b>Yes!</b> " : ""}${st.show}</div>`; i++; next(); };
      inp.addEventListener("keydown", e => { if (e.key === "Enter") btn.click(); });
      btn.onclick = () => {
        const val = inp.value.trim();
        if (st.answer == null) {
          if (val.length < 2) { fbx.innerHTML = `<div class="fb info">Write your idea first, even a guess. Then the step opens.</div>`; return; }
          return reveal(null);
        }
        const v = +val.replace(/[\s,]/g, "");
        if (val === "" || isNaN(v)) { fbx.innerHTML = `<div class="fb info">Type a number first.</div>`; return; }
        tries++;
        if (Math.abs(v - st.answer) <= (st.tol || 0) + 1e-9) return reveal(true);
        if (tries >= 2) return reveal(false);
        fbx.innerHTML = `<div class="fb no">Not quite: ${v > st.answer ? "too high" : "too low"}. Check your working and try once more.</div>`;
      };
    };
    next();
    return root;
  };
})();
