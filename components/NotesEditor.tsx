"use client";
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
  return (
    <section className="editor">
      <div>
        <div className="sectionhead">
          <h2>Your release notes</h2>
          <div className="row">
            <button className="secondary" onClick={onRegenerate}>
              Regenerate
            </button>
            <button className="secondary" onClick={() => navigator.clipboard.writeText(notes)}>
              Copy Markdown
            </button>
            <button className="secondary" onClick={() => download(notes)}>
              Download
            </button>
          </div>
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
