import type { PR } from "@/lib/github";

type Props = {
  prs: PR[];
  selected: number[];
  estimate: number;
  tone: string;
  busy: boolean;
  onToggle: (number: number) => void;
  onTone: (tone: string) => void;
  onGenerate: () => void;
};

export function PRChecklist({ prs, selected, estimate, tone, busy, onToggle, onTone, onGenerate }: Props) {
  return (
    <section className="panel list">
      <div className="sectionhead">
        <h2>3. Select changes</h2>
        <span>~{estimate} input tokens</span>
      </div>
      {prs.map((pr) => (
        <label className="pr" key={pr.number}>
          <input
            type="checkbox"
            checked={selected.includes(pr.number)}
            onChange={() => onToggle(pr.number)}
          />
          <span>
            <b>
              #{pr.number} {pr.title}
            </b>
            <small>
              {pr.author} · {pr.labels.join(", ") || "unlabelled"}
            </small>
          </span>
        </label>
      ))}
      <div className="row bottom">
        <label className="grow">
          Tone
          <select value={tone} onChange={(e) => onTone(e.target.value)}>
            <option>Technical</option>
            <option>Friendly</option>
            <option>Marketing</option>
          </select>
        </label>
        <button className="primary" disabled={busy} onClick={onGenerate}>
          {busy ? "Generating…" : "Generate release notes"}
        </button>
      </div>
    </section>
  );
}
