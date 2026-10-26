type Props = {
  repo: string;
  range: string;
  from: string;
  to: string;
  message: string;
  onRepo: (repo: string) => void;
  onRange: (range: string) => void;
  onFrom: (date: string) => void;
  onTo: (date: string) => void;
  onFetch: () => void;
};

export function RepoForm({ repo, range, from, to, message, onRepo, onRange, onFrom, onTo, onFetch }: Props) {
  const today = new Date().toISOString().slice(0, 10);
  return (
    <div className="panel">
      <h2>2. Choose a repo</h2>
      <label>
        GitHub repository
        <input
          value={repo}
          onChange={(e) => onRepo(e.target.value)}
          placeholder="owner/repository or GitHub URL"
        />
      </label>
      <div className="row">
        <label className="grow">
          Look back
          <select value={range} onChange={(e) => onRange(e.target.value)}>
            <option value="7">7 days</option>
            <option value="14">14 days</option>
            <option value="30">30 days</option>
            <option value="90">90 days</option>
            <option value="custom">Custom dates…</option>
          </select>
        </label>
        <button className="primary" onClick={onFetch}>
          Fetch merged PRs
        </button>
      </div>
      {range === "custom" && (
        <div className="row">
          <label className="grow">
            From
            <input type="date" value={from} max={to || today} onChange={(e) => onFrom(e.target.value)} />
          </label>
          <label className="grow">
            To
            <input type="date" value={to} min={from} max={today} onChange={(e) => onTo(e.target.value)} />
          </label>
        </div>
      )}
      {message && <p className="message">{message}</p>}
    </div>
  );
}
