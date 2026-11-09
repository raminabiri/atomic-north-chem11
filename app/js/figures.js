/* Atomic North — SVG figures drawn in code (theme-aware through CSS variables) */
(function () {
  const F = AN.FIG = {};
  const ink = "fill:var(--ink)", mut = "fill:var(--muted)";
  const T = (x, y, s, o = {}) => `<text x="${x}" y="${y}" font-size="${o.size || 13}" text-anchor="${o.anchor || "middle"}" font-weight="${o.w || 500}" style="${o.style || ink};font-family:${o.mono ? "var(--f-mono)" : "var(--f-body)"}">${s}</text>`;
  const wrap = (svg, cap) => `<figure class="figure">${svg}${cap ? `<figcaption class="cap">${cap}</figcaption>` : ""}</figure>`;
  F.wrap = wrap;

  /* classification of matter tree */
  F.matterTree = () => {
    const box = (x, y, w, label, fill) => `<rect x="${x - w / 2}" y="${y}" width="${w}" height="36" rx="10" style="fill:${fill}"/>${T(x, y + 23, label, { w: 700, style: "fill:#fff" })}`;
    const line = (x1, y1, x2, y2) => `<path d="M${x1} ${y1} V${(y1 + y2) / 2} H${x2} V${y2}" style="stroke:var(--muted);fill:none" stroke-width="1.6"/>`;
    return wrap(`<svg viewBox="0 0 640 250" role="img" aria-label="Matter splits into pure substances and mixtures. Pure substances split into elements and compounds. Mixtures split into mechanical mixtures and solutions.">
      ${line(320, 46, 170, 90)}${line(320, 46, 470, 90)}${line(170, 126, 90, 170)}${line(170, 126, 250, 170)}${line(470, 126, 390, 170)}${line(470, 126, 550, 170)}
      ${box(320, 10, 120, "Matter", "#16233B")}${box(170, 90, 170, "Pure substance", "#0E9F94")}${box(470, 90, 120, "Mixture", "#D9690A")}
      ${box(90, 170, 120, "Element", "#7B4FD8")}${box(250, 170, 130, "Compound", "#3B5BDB")}${box(390, 170, 140, "Mechanical", "#C2338F")}${box(550, 170, 120, "Solution", "#E2402F")}
      ${T(90, 228, "e.g. copper, O₂", { size: 12, style: mut })}${T(250, 228, "e.g. water, NaCl", { size: 12, style: mut })}${T(390, 228, "e.g. trail mix", { size: 12, style: mut })}${T(550, 228, "e.g. salt water", { size: 12, style: mut })}
    </svg>`, "Every sample of matter fits somewhere on this tree.");
  };

  /* periodic table history timeline */
  F.timeline = (items, cap) => {
    const w = 660, step = (w - 80) / (items.length - 1);
    let s = `<line x1="40" y1="70" x2="${w - 40}" y2="70" style="stroke:var(--line)" stroke-width="4" stroke-linecap="round"/>`;
    items.forEach((it, i) => {
      const x = 40 + i * step, up = i % 2 === 0;
      s += `<circle cx="${x}" cy="70" r="9" style="fill:${it.c || "var(--teal)"}"/>${T(x, up ? 44 : 104, it.year, { w: 700, mono: true, size: 13 })}${T(x, up ? 26 : 122, it.who, { size: 12, w: 600 })}${T(x, up ? 10 : 138, it.what, { size: 11, style: mut })}`;
    });
    return wrap(`<svg viewBox="0 0 ${w} 150" role="img" aria-label="${cap}">${s}</svg>`, cap);
  };

  /* mini coloured periodic table (families) */
  F.miniTable = (highlight) => {
    let s = "";
    AN.ELEMENTS.forEach(e => {
      if (e.row > 7) return;
      const x = 10 + (e.col - 1) * 34, y = 10 + (e.row - 1) * 34, dim = highlight && !highlight.includes(e.cat);
      s += `<g opacity="${dim ? .25 : 1}"><rect x="${x}" y="${y}" width="31" height="31" rx="5" class="c-${e.cat}" style="fill:currentColor"/><text x="${x + 15.5}" y="${y + 20}" font-size="11" text-anchor="middle" font-weight="700" style="fill:#16233B;font-family:var(--f-mono)">${e.sym}</text></g>`;
    });
    return `<svg viewBox="0 0 632 260" role="img" aria-label="Periodic table coloured by family">${s}</svg>`;
  };
  F.familyTable = () => {
    // colour-only rects use the class's text colour as fill; give each class its swatch
    const sw = { alkali: "#FF9F8F", alkaline: "#FFC97A", transition: "#A9BFE6", post: "#9ED7BA", metalloid: "#C9E38A", nonmetal: "#86DDD3", halogen: "#8CC4F5", noble: "#C4AEFF", lanth: "#F2B3DF", act: "#E7A9C3" };
    let s = "";
    AN.ELEMENTS.forEach(e => {
      const r = e.row > 7 ? e.row + 0.3 : e.row;
      const x = 6 + (e.col - 1) * 35, y = 6 + (r - 1) * 33;
      s += `<rect x="${x}" y="${y}" width="32" height="30" rx="5" style="fill:${sw[e.cat]}"/><text x="${x + 16}" y="${y + 19.5}" font-size="11" text-anchor="middle" font-weight="700" style="fill:#16233B;font-family:var(--f-mono)">${e.sym}</text>`;
    });
    let lg = "", lx = 6;
    Object.keys(sw).forEach((k, i) => {
      const col = i % 5, rowi = Math.floor(i / 5);
      lx = 6 + col * 126;
      lg += `<rect x="${lx}" y="${348 + rowi * 22}" width="13" height="13" rx="3" style="fill:${sw[k]}"/>${T(lx + 19, 359 + rowi * 22, AN.CAT_LABEL[k], { anchor: "start", size: 11.5 })}`;
    });
    return wrap(`<div class="scroll-x"><svg viewBox="0 0 640 396" style="min-width:560px" role="img" aria-label="Periodic table coloured by chemical family">${s}${lg}</svg></div>`, "Families of elements. Groups run down, periods run across.");
  };

  /* atomic models timeline */
  F.models = () => {
    const y = 70;
    const dalton = `<circle cx="80" cy="${y}" r="34" style="fill:#7B4FD8"/>`;
    let raisin = `<circle cx="240" cy="${y}" r="36" style="fill:#F2B200" opacity=".85"/>`;
    [[-16, -14], [12, -18], [-4, 4], [18, 10], [-20, 16], [4, 22]].forEach(([dx, dy]) => raisin += `<circle cx="${240 + dx}" cy="${y + dy}" r="5" style="fill:#16233B"/><text x="${240 + dx}" y="${y + dy + 3.5}" font-size="8" text-anchor="middle" style="fill:#fff">−</text>`);
    let ruth = `<circle cx="400" cy="${y}" r="38" style="fill:none;stroke:var(--muted)" stroke-dasharray="3 4"/><circle cx="400" cy="${y}" r="5" style="fill:#E2402F"/>`;
    [[-25, -18], [22, -24], [28, 14], [-14, 26]].forEach(([dx, dy]) => ruth += `<circle cx="${400 + dx}" cy="${y + dy}" r="4" style="fill:#3B5BDB"/>`);
    let bohr = `<circle cx="560" cy="${y}" r="5" style="fill:#E2402F"/>`;
    [18, 30, 42].forEach(r => bohr += `<circle cx="560" cy="${y}" r="${r}" style="fill:none;stroke:var(--muted)"/>`);
    bohr += `<circle cx="578" cy="${y}" r="4" style="fill:#3B5BDB"/><circle cx="542" cy="${y}" r="4" style="fill:#3B5BDB"/><circle cx="560" cy="${y - 30}" r="4" style="fill:#3B5BDB"/><circle cx="560" cy="${y + 42}" r="4" style="fill:#3B5BDB"/>`;
    const labels = [[80, "Dalton · 1803", "solid sphere"], [240, "Thomson · 1897", "raisin bun"], [400, "Rutherford · 1911", "tiny nucleus"], [560, "Bohr · 1913", "energy levels"]];
    const lab = labels.map(([x, a, b]) => T(x, 140, a, { w: 700, size: 12.5 }) + T(x, 157, b, { size: 12, style: mut })).join("");
    return wrap(`<svg viewBox="0 0 640 168" role="img" aria-label="Four atomic models in order: Dalton solid sphere, Thomson raisin bun, Rutherford nuclear atom, Bohr energy levels">${dalton}${raisin}${ruth}${bohr}${lab}</svg>`, "Each new experiment forced a better model.");
  };

  /* nuclide symbol */
  F.nuclide = (A, Z, sym, charge = "") => `<span class="nuclide" style="display:inline-flex;align-items:center;font-family:var(--f-mono);line-height:1;vertical-align:middle"><span style="display:flex;flex-direction:column;text-align:right;font-size:.62em;margin-right:1px"><span>${A}</span><span>${Z}</span></span><b style="font-size:1.25em">${sym}</b>${charge ? `<sup style="font-size:.65em;line-height:1;align-self:flex-start">${charge}</sup>` : ""}</span>`;

  /* Bohr (energy level) diagram */
  F.bohr = (z, n = null, size = 220, ionCharge = 0) => {
    const e = AN.ELEMENTS[z - 1];
    const sh = AN.shells(Math.max(0, z - ionCharge));
    const c = size / 2;
    const neutrons = n == null ? Math.round(e.mass) - z : n;
    let s = `<circle cx="${c}" cy="${c}" r="${size * .12}" style="fill:#E2402F"/>${T(c, c - 2, z + "p", { size: size * .055, w: 700, style: "fill:#fff" })}${T(c, c + size * .06, neutrons + "n", { size: size * .055, w: 700, style: "fill:#fff" })}`;
    sh.forEach((cnt, i) => {
      const r = size * (.2 + i * .085);
      s += `<circle cx="${c}" cy="${c}" r="${r}" style="fill:none;stroke:var(--muted)" stroke-width="1.2"/>`;
      for (let k = 0; k < cnt; k++) {
        const pairs = cnt > 2, ang = pairs ? (Math.floor(k / 2) * (Math.PI / 2)) + (k % 2 ? .22 : -.22) - Math.PI / 2 : k * Math.PI - Math.PI / 2;
        const extra = cnt > 8 ? 0 : 0;
        s += `<circle cx="${c + r * Math.cos(ang + extra)}" cy="${c + r * Math.sin(ang + extra)}" r="${size * .022}" style="fill:#3B5BDB"/>`;
      }
    });
    return `<svg viewBox="0 0 ${size} ${size}" width="${size}" role="img" aria-label="Bohr diagram: ${z} protons, ${neutrons} neutrons, electrons ${sh.join(", ")}">${s}</svg>`;
  };

  /* bar chart */
  F.bars = (data, o = {}) => {
    const W = 640, H = o.h || 260, L = 54, B = 40, top = 18, max = o.max || Math.max(...data.map(d => d.v)) * 1.1;
    const bw = (W - L - 16) / data.length;
    let s = "";
    for (let i = 0; i <= 4; i++) { const v = max * i / 4, y = H - B - (H - B - top) * i / 4; s += `<line x1="${L}" x2="${W - 10}" y1="${y}" y2="${y}" style="stroke:var(--line)"/>${T(L - 6, y + 4, Math.round(v), { anchor: "end", size: 11, mono: true, style: mut })}`; }
    data.forEach((d, i) => {
      const h = (H - B - top) * (d.v / max), x = L + i * bw + bw * .15, y = H - B - h;
      s += `<rect x="${x}" y="${y}" width="${bw * .7}" height="${h}" rx="3" style="fill:${d.c || "var(--teal)"}"><title>${d.label}: ${d.v}</title></rect>${T(x + bw * .35, H - B + 16, d.label, { size: 11, w: 600 })}`;
      if (o.values) s += T(x + bw * .35, y - 5, d.v, { size: 10.5, mono: true, style: mut });
    });
    if (o.y) s += `<text transform="translate(14 ${(H - B) / 2 + 10}) rotate(-90)" font-size="11.5" text-anchor="middle" style="${mut};font-family:var(--f-body)">${o.y}</text>`;
    if (o.x) s += T(W / 2, H - 4, o.x, { size: 11.5, style: mut });
    return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${o.aria || "bar chart"}">${s}</svg>`;
  };

  /* line chart (x numeric) */
  F.line = (pts, o = {}) => {
    const W = 640, H = o.h || 280, L = 56, B = 42, top = 16, R = 14;
    const xmin = o.xmin ?? Math.min(...pts.map(p => p.x)), xmax = o.xmax ?? Math.max(...pts.map(p => p.x));
    const ymax = o.ymax ?? Math.max(...pts.map(p => p.y)) * 1.08, ymin = o.ymin ?? 0;
    const X = x => L + (W - L - R) * (x - xmin) / (xmax - xmin), Y = y => H - B - (H - B - top) * (y - ymin) / (ymax - ymin);
    let s = "";
    for (let i = 0; i <= 4; i++) { const v = ymin + (ymax - ymin) * i / 4; s += `<line x1="${L}" x2="${W - R}" y1="${Y(v)}" y2="${Y(v)}" style="stroke:var(--line)"/>${T(L - 6, Y(v) + 4, o.yfmt ? o.yfmt(v) : Math.round(v), { anchor: "end", size: 11, mono: true, style: mut })}`; }
    (o.xticks || []).forEach(t => s += T(X(t.x), H - B + 16, t.label, { size: 11, mono: !!o.monoTicks, style: mut }));
    if (o.area) s += `<path d="M${X(pts[0].x)} ${Y(ymin)} ${pts.map(p => `L${X(p.x)} ${Y(p.y)}`).join(" ")} L${X(pts[pts.length - 1].x)} ${Y(ymin)}Z" style="fill:var(--teal)" opacity=".12"/>`;
    s += `<path d="${pts.map((p, i) => `${i ? "L" : "M"}${X(p.x)} ${Y(p.y)}`).join(" ")}" style="fill:none;stroke:${o.colour || "var(--teal)"}" stroke-width="2.5" stroke-linejoin="round"/>`;
    pts.forEach(p => { if (p.label || o.dots) s += `<circle cx="${X(p.x)}" cy="${Y(p.y)}" r="${p.label ? 4.5 : 3}" style="fill:${p.c || o.colour || "var(--teal)"}"><title>${p.tip || p.label || p.y}</title></circle>`; if (p.label) s += T(X(p.x), Y(p.y) - 9, p.label, { size: 11, w: 700 }); });
    if (o.y) s += `<text transform="translate(14 ${(H - B) / 2 + 8}) rotate(-90)" font-size="11.5" text-anchor="middle" style="${mut};font-family:var(--f-body)">${o.y}</text>`;
    if (o.x) s += T((W + L) / 2, H - 6, o.x, { size: 11.5, style: mut });
    return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${o.aria || "line chart"}">${s}</svg>`;
  };

  /* chlorine mass spectrum */
  F.massSpec = () => wrap(F.bars([{ label: "³⁵Cl", v: 75.8, c: "#0E9F94" }, { label: "³⁷Cl", v: 24.2, c: "#7B4FD8" }], { h: 220, max: 100, values: true, y: "% abundance", x: "mass of isotope (u)", aria: "Chlorine-35 is 75.8 percent, chlorine-37 is 24.2 percent" }), "A mass spectrometer sorts chlorine atoms by mass. Most are chlorine-35.");

  /* penetration of radiation */
  F.penetration = () => {
    const rows = [["α  alpha", "#E2402F", 150], ["β  beta", "#D9690A", 300], ["γ  gamma", "#7B4FD8", 560]];
    let s = `<rect x="150" y="10" width="14" height="180" rx="3" style="fill:#F2E3B3"/><rect x="300" y="10" width="20" height="180" rx="3" style="fill:#B9C4D2"/><rect x="460" y="10" width="40" height="180" rx="3" style="fill:#6B7787"/>`;
    s += T(157, 208, "paper", { size: 12, style: mut }) + T(310, 208, "aluminum", { size: 12, style: mut }) + T(480, 208, "lead / concrete", { size: 12, style: mut });
    rows.forEach(([lab, c, stop], i) => {
      const y = 45 + i * 55, end = stop === 560 ? 520 : stop;
      s += `<line x1="70" y1="${y}" x2="${end}" y2="${y}" style="stroke:${c}" stroke-width="4" ${stop === 560 ? 'stroke-dasharray="0"' : ""}/><path d="M${end} ${y - 6} l10 6 l-10 6z" style="fill:${c}"/>${T(10, y + 4, lab, { anchor: "start", size: 13, w: 700 })}`;
      if (stop === 560) s += `<line x1="500" y1="${y}" x2="600" y2="${y}" style="stroke:${c}" stroke-width="2" stroke-dasharray="4 4" opacity=".6"/>`;
    });
    return wrap(`<svg viewBox="0 0 640 220" role="img" aria-label="Alpha is stopped by paper, beta by aluminium, gamma needs thick lead or concrete">${s}</svg>`, "How far each kind of radiation gets.");
  };

  /* decay curve */
  F.decay = () => {
    const pts = []; for (let t = 0; t <= 5; t += .1) pts.push({ x: t, y: 100 * Math.pow(.5, t) });
    [0, 1, 2, 3, 4].forEach(k => pts.find(p => Math.abs(p.x - k) < .01).label = (100 / 2 ** k) + "%");
    return wrap(F.line(pts, { xmin: 0, xmax: 5, ymax: 110, area: true, xticks: [0, 1, 2, 3, 4, 5].map(k => ({ x: k, label: k })), y: "% of sample left", x: "number of half-lives", aria: "Decay curve halving each half-life" }), "After every half-life, half of what is left decays.");
  };

  /* hydrogen line spectrum vs continuous */
  F.spectra = () => {
    let grad = `<defs><linearGradient id="rainbow" x1="0" x2="1"><stop offset="0" stop-color="#7A2BD6"/><stop offset=".18" stop-color="#3B2BE0"/><stop offset=".36" stop-color="#16A8E0"/><stop offset=".52" stop-color="#2ED15A"/><stop offset=".68" stop-color="#F3E21C"/><stop offset=".82" stop-color="#F58A12"/><stop offset="1" stop-color="#E01818"/></linearGradient></defs>`;
    const X = nm => 60 + (nm - 400) / 300 * 520;
    let s = grad + `<rect x="60" y="22" width="520" height="40" rx="4" fill="url(#rainbow)"/>${T(30, 47, "white light", { size: 11, anchor: "middle", style: mut })}`;
    s += `<rect x="60" y="92" width="520" height="40" rx="4" style="fill:#0B0F1A"/>`;
    [[410, "#7A2BD6"], [434, "#4B2BE0"], [486, "#16C7D9"], [656, "#E81818"]].forEach(([nm, c]) => s += `<rect x="${X(nm) - 2}" y="92" width="4" height="40" style="fill:${c}"/>${T(X(nm), 150, nm, { size: 11, mono: true, style: mut })}`);
    s += T(30, 117, "hydrogen", { size: 11, style: mut });
    s += T(320, 172, "wavelength (nm): violet → red", { size: 11.5, style: mut });
    return wrap(`<svg viewBox="0 0 640 182" role="img" aria-label="Continuous spectrum of white light compared with hydrogen's four visible lines at 410, 434, 486 and 656 nanometres">${s}</svg>`, "Top: continuous spectrum. Bottom: hydrogen's line spectrum, its colour fingerprint.");
  };

  /* Bohr energy level transitions */
  F.levels = () => {
    const ys = [210, 120, 80, 60, 48];
    let s = "";
    ys.forEach((y, i) => s += `<line x1="80" x2="420" y1="${y}" y2="${y}" style="stroke:var(--muted)" stroke-width="${i ? 1.5 : 2.5}"/>${T(60, y + 4, "n=" + (i + 1), { size: 12, mono: true, anchor: "end" })}`);
    const arrow = (x, y1, y2, c, lab) => `<line x1="${x}" x2="${x}" y1="${y1}" y2="${y2}" style="stroke:${c}" stroke-width="3"/><path d="M${x - 6} ${y2 + (y2 > y1 ? -9 : 9)} L${x} ${y2} L${x + 6} ${y2 + (y2 > y1 ? -9 : 9)}" style="fill:none;stroke:${c}" stroke-width="3"/>${T(x, Math.max(y1, y2) + 18, lab, { size: 11, w: 600 })}`;
    s += arrow(140, 210, 82, "#F2B200", "absorbs energy");
    s += arrow(260, 80, 118, "#E81818", "red light");
    s += arrow(330, 60, 118, "#16C7D9", "blue-green");
    s += arrow(395, 48, 118, "#7A2BD6", "violet");
    s += T(480, 214, "ground state", { size: 12, style: mut, anchor: "start" }) + T(480, 64, "excited states", { size: 12, style: mut, anchor: "start" });
    return wrap(`<svg viewBox="0 0 600 250" role="img" aria-label="An electron absorbs energy and jumps to a higher level, then drops back and emits light of a specific colour">${s}</svg>`, "Up = energy absorbed. Down = light given off. Bigger drop, more energetic light.");
  };

  /* trend arrows summary */
  F.trendArrows = () => {
    let s = `<rect x="70" y="40" width="430" height="200" rx="14" style="fill:var(--surface-2)"/>`;
    s += T(285, 145, "periodic table", { size: 15, w: 700, style: mut });
    const ar = (x1, y1, x2, y2, c, lab, lx, ly, anchor = "middle") => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" style="stroke:${c}" stroke-width="5" stroke-linecap="round"/><circle cx="${x2}" cy="${y2}" r="7" style="fill:${c}"/>${T(lx, ly, lab, { size: 12.5, w: 700, anchor, style: `fill:${c}` })}`;
    s += ar(90, 22, 470, 22, "#E2402F", "ionization energy & electronegativity increase →", 280, 14);
    s += ar(520, 230, 520, 60, "#E2402F", "↑ IE & EN", 528, 50, "start");
    s += ar(470, 262, 90, 262, "#0E9F94", "← atomic radius increases", 280, 282);
    s += ar(40, 60, 40, 230, "#0E9F94", "radius ↓", 40, 250);
    return wrap(`<svg viewBox="0 0 600 292" role="img" aria-label="Ionization energy and electronegativity increase to the right and up. Atomic radius increases to the left and down.">${s}</svg>`, "Two opposite trends: size grows down and to the left; grip on electrons grows up and to the right.");
  };

  /* atomic radius circles, period 3 */
  F.radiusCircles = (syms) => {
    let x = 30, s = "";
    syms.forEach(sym => { const e = AN.el(sym), r = e.radius / 5.2; x += r; s += `<circle cx="${x}" cy="70" r="${r}" style="fill:var(--teal)" opacity=".85"/>${T(x, 74, sym, { size: 12, w: 700, style: "fill:#fff" })}${T(x, 132, e.radius, { size: 11, mono: true, style: mut })}`; x += r + 14; });
    return `<svg viewBox="0 0 ${x + 10} 142" role="img" aria-label="Atomic radii in picometres">${s}</svg>`;
  };

  /* data table helper */
  F.table = (head, rows, cls = "") => `<div class="scroll-x"><table class="data ${cls}"><thead><tr>${head.map(h => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
})();
