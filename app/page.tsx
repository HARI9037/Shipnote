"use client";
import { useEffect, useMemo, useState } from "react";
import { NotesEditor } from "@/components/NotesEditor";
import { PRChecklist } from "@/components/PRChecklist";
import { ProviderSettings } from "@/components/ProviderSettings";
import { RepoForm } from "@/components/RepoForm";
import type { PR } from "@/lib/github";
import { clearKey, isRemembered, loadKey, saveKey } from "@/lib/keystore";
import { PROVIDERS, type ProviderId } from "@/lib/providers";
import { readNotesStream } from "@/lib/stream";

const JSON_HEADERS = { "content-type": "application/json" };

export default function Home() {
  const [provider, setProvider] = useState<ProviderId>("openai");
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState(PROVIDERS.openai.model);
  const [baseUrl, setBaseUrl] = useState("");
  const [remember, setRemember] = useState(false);
  const [repo, setRepo] = useState("");
  const [range, setRange] = useState("14");
  const [prs, setPrs] = useState<PR[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [tone, setTone] = useState("Friendly");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  // Keys are stored per provider so one provider's key is never sent to another.
  useEffect(() => {
    setApiKey(loadKey(provider));
    setRemember(isRemembered(provider));
  }, [provider]);

  const estimate = useMemo(() => {
    const chars = selected.reduce(
      (n, id) => n + (prs.find((p) => p.number === id)?.title.length ?? 0) + 100,
      0,
    );
    return Math.ceil(chars / 4);
  }, [selected, prs]);

  function changeProvider(next: ProviderId) {
    setProvider(next);
    setModel(PROVIDERS[next].model);
  }

  function changeKey(value: string) {
    setApiKey(value);
    saveKey(provider, value, remember);
  }

  function changeRemember(value: boolean) {
    setRemember(value);
    saveKey(provider, apiKey, value);
  }

  function clear() {
    setApiKey("");
    clearKey(provider);
  }

  function toggle(number: number) {
    setSelected((s) => (s.includes(number) ? s.filter((n) => n !== number) : [...s, number]));
  }

  async function test() {
    setMessage("Testing…");
    const res = await fetch("/api/test", {
      method: "POST",
      headers: { ...JSON_HEADERS, "x-llm-key": apiKey },
      body: JSON.stringify({ provider, model, baseUrl }),
    });
    const data = await res.json().catch(() => ({}));
    setMessage(data.ok ? "Connection works." : (data.error ?? "Test failed."));
  }

  async function load() {
    setMessage("Fetching merged PRs…");
    const since = new Date(Date.now() - Number(range) * 864e5).toISOString().slice(0, 10);
    const res = await fetch("/api/prs", {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify({ repo, since }),
    });
    const data = await res.json().catch(() => ({}));
    if (data.error || !data.prs) return setMessage(data.error ?? "Could not fetch pull requests.");
    setPrs(data.prs);
    setSelected(data.prs.map((p: PR) => p.number));
    setMessage(`${data.prs.length} merged PRs found.`);
  }

  async function generate() {
    setBusy(true);
    setMessage("Generating…");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { ...JSON_HEADERS, "x-llm-key": apiKey },
        body: JSON.stringify({
          provider,
          model,
          baseUrl,
          repo,
          range,
          tone,
          prs: prs.filter((p) => selected.includes(p.number)),
        }),
      });
      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        setMessage(data.error ?? "Generation failed.");
        return;
      }
      const text = await readNotesStream(res.body, setNotes);
      setMessage(text ? "Ready to edit." : "The model returned no text. Try a different model.");
    } catch {
      setMessage("Network error. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main>
      <header>
        <span className="logo">
          shipnote<span>·</span>
        </span>
        <a href="#privacy">Your key stays yours →</a>
      </header>
      <section className="hero">
        <p className="eyebrow">OPEN-SOURCE RELEASE NOTES</p>
        <h1>
          Turn merged PRs into
          <br />
          <em>notes people read.</em>
        </h1>
        <p className="lede">
          Point at a GitHub repo. Bring your own AI key. Get a clean, editable changelog in seconds.
        </p>
      </section>
      <section className="grid">
        <ProviderSettings
          provider={provider}
          apiKey={apiKey}
          model={model}
          baseUrl={baseUrl}
          remember={remember}
          onProvider={changeProvider}
          onKey={changeKey}
          onModel={setModel}
          onBaseUrl={setBaseUrl}
          onRemember={changeRemember}
          onClear={clear}
          onTest={test}
        />
        <RepoForm
          repo={repo}
          range={range}
          message={message}
          onRepo={setRepo}
          onRange={setRange}
          onFetch={load}
        />
      </section>
      {prs.length > 0 && (
        <PRChecklist
          prs={prs}
          selected={selected}
          estimate={estimate}
          tone={tone}
          busy={busy}
          onToggle={toggle}
          onTone={setTone}
          onGenerate={generate}
        />
      )}
      {notes && <NotesEditor notes={notes} onChange={setNotes} onRegenerate={generate} />}
      <footer id="privacy">
        <b>Private by design.</b> Your key is kept in this browser session (or local storage only when you
        choose “Remember”). It is sent over HTTPS to this app for each provider request, used in memory, and
        never stored, logged, or sent to analytics. Self-host Shipnote to keep the entire path under your
        control.
      </footer>
    </main>
  );
}
