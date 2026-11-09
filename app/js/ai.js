/* Atomic North — optional AI Tutor (Claude API, student's own key; raw HTTP because the app has no build step) */
(function () {
  const URL = "https://api.anthropic.com/v1/messages";
  AN.AI_MODELS = [
    { id: "claude-opus-5-5", name: "Claude Opus 5.5", note: "best quality · $4 / $20 per million tokens (in/out)" },
    { id: "claude-sonnet-5-5", name: "Claude Sonnet 5.5", note: "balanced · $2 / $10 per million tokens" },
    { id: "claude-haiku-5-5", name: "Claude Haiku 5.5", note: "cheapest · $0.10 / $0.50 per million tokens" }
  ];
  const SYSTEM = `You are a friendly, encouraging chemistry tutor inside "Atomic North", a study app for Grade 11 students in Ontario, Canada (course SCH3U). Write in Canadian English (colour, centre, metre, aluminum).
The student is studying Chapter 1, The Nature of Matter: classifying matter, diagnostic tests, metals/nonmetals/metalloids, history of the periodic table, groups and families, atomic models (Dalton, Thomson, Rutherford, Bohr), subatomic particles, atomic number and mass number, isotopes, weighted atomic mass, alpha/beta/gamma radiation, half-life, uses of radioisotopes, line spectra, flame tests, energy-level diagrams for elements 1 to 20, valence electrons, ions, atomic radius, ionization energy, electron affinity, electronegativity and reactivity trends.
Teach, don't just tell: when a student asks for an answer to a problem, first ask a guiding question or give a hint, and only walk through the full solution if they have tried or ask again. Keep replies short (under 150 words) and use plain language suited to a 16-year-old. Stay at the Grade 11 level; if you go further than that, start that part with "Beyond the book:". If a question is unrelated to chemistry or schoolwork, gently steer back to chemistry.`;

  async function call(body) {
    const key = AN.S.ai.key; if (!key) throw new Error("Add your Claude API key in Settings first.");
    const model = AN.S.ai.model || "claude-opus-5-5";
    const headers = { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2026-10-21", "anthropic-dangerous-direct-browser-access": "true" };
    const payload = Object.assign({ model }, body);
    if (model === "claude-opus-5-5" || model === "claude-sonnet-5-5") { headers["anthropic-beta"] = "server-side-fallback-2026-07-01"; payload.fallbacks = "default"; }
    let res;
    try { res = await fetch(URL, { method: "POST", headers, body: JSON.stringify(payload) }); }
    catch (e) { throw new Error("Couldn't reach the AI Tutor. Check your internet connection."); }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = data?.error?.message || res.statusText;
      if (res.status === 401) throw new Error("Your API key was rejected. Check it in Settings.");
      if (res.status === 429) throw new Error("Too many requests right now. Wait a minute and try again.");
      if (res.status === 402 || /credit/i.test(msg)) throw new Error("Your Claude account is out of credit. Add credit at console.anthropic.com.");
      throw new Error("AI Tutor error: " + msg);
    }
    if (data.stop_reason === "refusal") throw new Error("The tutor couldn't answer that one. Try rephrasing your question.");
    return (data.content || []).filter(b => b.type === "text").map(b => b.text).join("\n").trim();
  }

  AN.AI = {
    async test() { return call({ max_tokens: 200, output_config: { effort: "low" }, messages: [{ role: "user", content: "Reply with just: Ready to help!" }] }); },
    async chat(history) {
      return call({ max_tokens: 4000, system: SYSTEM, output_config: { effort: "medium" }, messages: history });
    },
    async grade({ question, model, checklist, answer }) {
      const text = await call({
        max_tokens: 2000, system: SYSTEM, output_config: {
          effort: "low",
          format: { type: "json_schema", schema: { type: "object", additionalProperties: false, required: ["score", "feedback", "missing"], properties: { score: { type: "integer", description: "0 to 3" }, feedback: { type: "string" }, missing: { type: "array", items: { type: "string" } } } } }
        },
        messages: [{ role: "user", content: `Mark this Grade 11 student's written answer.\n\nQuestion: ${question}\n\nModel answer (for you only): ${model}\n\nKey points:\n- ${checklist.join("\n- ")}\n\nStudent's answer:\n"""${answer}"""\n\nGive a score from 0 to 3 (3 = covers all key points correctly). Write 2-3 sentences of kind, specific feedback addressed to the student ("you"). List any key points still missing, in a few words each.` }]
      });
      const r = JSON.parse(text);
      r.score = Math.max(0, Math.min(3, Math.round(+r.score || 0)));
      return r;
    }
  };
})();
