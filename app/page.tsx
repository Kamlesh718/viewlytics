"use client";

import { useState } from "react";

type Analysis = {
  summary: string;
  score: number;
  accessibility: number;
  suggestions: string[];
};

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Analysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const prompt = `
You are Viewlytics, an AI webpage auditor designed to help users understand and improve any webpage.
Your job is to analyze the webpage content and return ONLY JSON — no extra text.

Explain WHY the page needs improvements and WHY this analysis is useful for the user.

Return JSON in this exact structure:

{
  "whyThisProjectExists": string,
  "summary": string,
  "score": number,
  "accessibility": number,
  "suggestions": string[]
}

Where:
- "whyThisProjectExists" = Explain why analyzing webpages matters, why optimization is important, and why tools like Viewlytics exist.
- "summary" = Clear, concise explanation of what the page contains.
- "score" = Overall performance score (0-100).
- "accessibility" = Accessibility score (0-100).
- "suggestions" = Practical, prioritized improvements.

CONTENT TO ANALYZE:
${url}
`;

  async function genAI() {
    setLoading(true);
    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      let text = data.text;

      // 🧹 Remove ```json and ``` and ```anything
      text = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      try {
        const parsed = JSON.parse(text);
        setResult(parsed);
      } catch (err) {
        console.error("Invalid JSON from Gemini:", err);
        setError("Gemini returned invalid JSON format.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function validateUrl(u: string) {
    try {
      // allow user to paste without protocol
      const parsed = u.startsWith("http")
        ? new URL(u)
        : new URL("https://" + u);
      return parsed.href;
    } catch {
      return null;
    }
  }

  async function handleAnalyze(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);
    const parsed = validateUrl(url.trim());
    if (!parsed) {
      setError("Please enter a valid URL");
      return;
    }

    setResult(null);

    genAI();
  }

  function downloadJSON() {
    if (!result) return;
    const blob = new Blob([JSON.stringify({ url, result }, null, 2)], {
      type: "application/json",
    });
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = "viewlytics-analysis.json";
    a.click();
    URL.revokeObjectURL(href);
  }

  return (
    <main className="min-h-screen bg-linear-to-b from-slate-900 via-slate-800 to-slate-900 text-slate-100">
      <div className="max-w-6xl mx-auto px-6 py-20">
        <header className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight flex items-center gap-3">
              <span className="w-12 h-12 rounded-lg bg-linear-to-br from-indigo-500 to-pink-500 shadow-lg flex items-center justify-center text-white">
                V
              </span>
              <span>Viewlytics</span>
            </h1>
            <p className="mt-2 text-slate-300 max-w-md">
              Inspect any webpage and get clear suggestions to improve
              performance, accessibility and SEO.
            </p>
          </div>
          <nav className="hidden md:flex gap-6 text-slate-300">
            <a className="hover:text-white" href="#features">
              Features
            </a>
            <a className="hover:text-white" href="#demo">
              Demo
            </a>
            <a className="hover:text-white" href="#footer">
              Docs
            </a>
          </nav>
        </header>

        <section className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-3xl font-semibold">
              Analyze any URL in seconds
            </h2>
            <p className="mt-4 text-slate-300">
              Paste a website URL and Viewlytics will scan the page and provide
              an actionable summary with prioritized suggestions.
            </p>

            <form onSubmit={handleAnalyze} className="mt-6 flex gap-3">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com or example.com"
                className="flex-1 rounded-md px-4 py-3 bg-slate-800 border border-slate-700 placeholder-slate-400 outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 rounded-md px-4 py-3 font-medium text-white disabled:opacity-60"
              >
                {loading ? (
                  <svg
                    className="animate-spin h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth="4"
                    ></circle>
                    <path
                      d="M22 12a10 10 0 00-10-10"
                      stroke="white"
                      strokeWidth="4"
                      strokeLinecap="round"
                    ></path>
                  </svg>
                ) : (
                  <span>Analyze</span>
                )}
              </button>
            </form>

            {error && <p className="mt-3 text-sm text-rose-400">{error}</p>}

            <div className="mt-8 flex gap-4">
              <div className="bg-slate-800 p-4 rounded-lg shadow-sm">
                <h3 className="text-slate-200 text-sm">Quick check</h3>
                <p className="mt-1 text-slate-400 text-sm">
                  Performance • Accessibility • Best practices
                </p>
              </div>
            </div>
          </div>

          <div id="demo">
            <div className="bg-linear-to-tr from-slate-800 to-slate-700 rounded-2xl p-6 shadow-xl border border-slate-700">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-lg font-semibold">Analysis</h4>
                </div>
              </div>

              <div className="mt-5">
                {!result ? (
                  <div className="rounded-md border border-dashed border-slate-700 p-6 text-slate-400">
                    No analysis yet. Paste a URL and click Analyze.
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      {/* Summary box — scrollable for long content */}
                      <div className="flex-1">
                        <p className="text-slate-300 font-medium mb-2">
                          Summary
                        </p>
                        <div className="bg-slate-900 p-4 rounded-md border border-slate-700 text-slate-300 text-sm max-h-46 overflow-auto whitespace-pre-wrap wrap-break-word">
                          {result.summary}
                        </div>
                      </div>

                      {/* Metrics card */}
                      <div className="w-full md:w-44 shrink-0 bg-slate-800 p-3 rounded-md border border-slate-700">
                        <p className="text-xs text-slate-400">Performance</p>
                        <div className="mt-2 flex items-center gap-3">
                          <div className="text-3xl font-bold text-white leading-none">
                            {result.score}
                          </div>
                          <div className="flex-1">
                            <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                              <div
                                className="h-2 bg-green-400"
                                style={{
                                  width: `${Math.min(
                                    Math.max(result.score, 0),
                                    100
                                  )}%`,
                                }}
                              />
                            </div>
                            <p className="text-xs text-slate-400 mt-2">
                              Accessibility: {result.accessibility}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Suggestions — each suggestion in its own card, scrollable list if many */}
                    <div>
                      <p className="text-slate-300 font-medium mb-2">
                        Top suggestions
                      </p>

                      <div className="space-y-2 max-h-48 overflow-auto pr-2">
                        {result.suggestions.map((s, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-3 bg-slate-900 border border-slate-700 rounded-md p-3 text-sm text-slate-300"
                          >
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500 text-white text-xs shrink-0">
                              {i + 1}
                            </span>
                            <div className="whitespace-pre-wrap wrap-break-word leading-relaxed">
                              {s}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 mt-2">
                      <button
                        onClick={downloadJSON}
                        className="bg-slate-700 px-3 py-2 rounded-md text-sm text-slate-200"
                      >
                        Download JSON
                      </button>
                      <button
                        onClick={() =>
                          navigator.clipboard.writeText(
                            JSON.stringify(
                              {
                                summary: result.summary,
                                score: result.score,
                                suggestions: result.suggestions,
                                accessibility: result.accessibility,
                              },
                              null,
                              2
                            )
                          )
                        }
                        className="bg-indigo-500 px-3 py-2 rounded-md text-sm text-white"
                      >
                        Copy Summary
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="mt-14 grid md:grid-cols-3 gap-6">
          <div className="bg-slate-800 p-6 rounded-xl">
            <h5 className="text-white font-semibold">Performance Audits</h5>
            <p className="text-slate-400 text-sm mt-2">
              Get prioritized fixes to speed up page loads and interactions.
            </p>
          </div>
          <div className="bg-slate-800 p-6 rounded-xl">
            <h5 className="text-white font-semibold">Accessibility</h5>
            <p className="text-slate-400 text-sm mt-2">
              Actionable accessibility guidance to reach more users.
            </p>
          </div>
        </section>

        <section
          id="ai"
          className="mt-12 bg-linear-to-r from-slate-800 to-slate-700 rounded-xl p-6 border border-slate-700"
        >
          <h3 className="text-lg font-semibold text-white">
            Powered by Gemini
          </h3>
          <p className="mt-2 text-slate-300 max-w-3xl text-sm">
            Viewlytics uses Gemini (via the Gemini API) to parse page content
            and generate the analysis. Gemini interprets the page and crafts the
            summary, score and suggestions based on the provided prompt and the
            page content. Because Gemini is a generative model, the exact
            wording and some recommendations can vary between runs — this
            project demonstrates how AI can provide targeted audits, but outputs
            may differ each time depending on the page content and model
            behavior.
          </p>

          <div className="mt-4 grid md:grid-cols-2 gap-4">
            <div className="bg-slate-900 p-4 rounded-md border border-slate-700">
              <p className="text-sm text-slate-400">Why it depends on Gemini</p>
              <ul className="mt-2 text-slate-300 text-sm list-disc list-inside">
                <li>
                  Gemini analyzes raw page content and produces human-friendly
                  suggestions.
                </li>
                <li>
                  Results depend on the prompt and the page snapshot sent for
                  analysis.
                </li>
                <li>
                  Outputs are probabilistic — run-to-run differences are
                  expected.
                </li>
              </ul>
            </div>
          </div>
        </section>

        <footer
          id="footer"
          className="mt-16 border-t border-slate-700 pt-8 text-slate-400 flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <p>
            © {new Date().getFullYear()} Viewlytics — Scan, understand, improve.
          </p>
          <div className="flex gap-4">
            <a className="hover:text-white" href="#">
              Privacy
            </a>
            <a className="hover:text-white" href="#">
              Docs
            </a>
            <a className="hover:text-white" href="#">
              GitHub
            </a>
          </div>
        </footer>
      </div>
    </main>
  );
}
