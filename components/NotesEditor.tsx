"use client";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

type Props = { notes: string; onChange: (notes: string) => void; onRegenerate: () => void };

function download(notes: string) {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([notes], { type: "text/markdown" }));
  link.download = "CHANGELOG.md";
  link.click();
  URL.revokeObjectURL(link.href);
}

export function NotesEditor({ notes, onChange, onRegenerate }: Props) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;

    const timeout = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  async function copyMarkdown() {
    try {
      await navigator.clipboard.writeText(notes);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section className="editor">
      <div>
        <div className="sectionhead">
          <h2>Your release notes</h2>
          <div className="row">
            <button className="secondary" onClick={onRegenerate}>
              Regenerate
            </button>
            <button className="secondary" onClick={copyMarkdown}>
              Copy Markdown
            </button>
            <button className="secondary" onClick={() => download(notes)}>
              Download
            </button>
          </div>
          <span role="status" aria-live="polite">
            {copied ? "Copied to clipboard!" : ""}
          </span>
        </div>
        <textarea value={notes} onChange={(e) => onChange(e.target.value)} />
      </div>
      <div className="preview">
        <h3>Live preview</h3>
        <ReactMarkdown>{notes}</ReactMarkdown>
      </div>
    </section>
  );
}
