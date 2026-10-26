type Props = {
  repo: string;
  range: string;
  message: string;
  onRepo: (repo: string) => void;
  onRange: (range: string) => void;
  onFetch: () => void;
};

export function RepoForm({ repo, range, message, onRepo, onRange, onFetch }: Props) {
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
          </select>
        </label>
        <button className="primary" onClick={onFetch}>
          Fetch merged PRs
        </button>
      </div>
      {message && <p className="message">{message}</p>}
    </div>
  );
}
