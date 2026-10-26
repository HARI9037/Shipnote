import { PROVIDERS, type ProviderId } from "@/lib/providers";

type Props = {
  provider: ProviderId;
  apiKey: string;
  model: string;
  baseUrl: string;
  remember: boolean;
  onProvider: (provider: ProviderId) => void;
  onKey: (key: string) => void;
  onModel: (model: string) => void;
  onBaseUrl: (url: string) => void;
  onRemember: (remember: boolean) => void;
  onClear: () => void;
  onTest: () => void;
};

export function ProviderSettings(p: Props) {
  return (
    <div className="panel">
      <h2>1. Connect your model</h2>
      <div className="row">
        {(Object.keys(PROVIDERS) as ProviderId[]).map((id) => (
          <button
            className={p.provider === id ? "pill active" : "pill"}
            onClick={() => p.onProvider(id)}
            key={id}
          >
            {PROVIDERS[id].label}
          </button>
        ))}
      </div>
      <label>
        API key
        <input
          type="password"
          autoComplete="off"
          value={p.apiKey}
          onChange={(e) => p.onKey(e.target.value)}
          placeholder="Paste your key"
        />
      </label>
      <div className="row">
        <label className="grow">
          Model
          <input value={p.model} onChange={(e) => p.onModel(e.target.value)} />
        </label>
        {p.provider === "custom" && (
          <label className="grow">
            Base URL
            <input
              value={p.baseUrl}
              onChange={(e) => p.onBaseUrl(e.target.value)}
              placeholder="https://…/v1"
            />
          </label>
        )}
      </div>
      <div className="actions">
        <label className="check">
          <input type="checkbox" checked={p.remember} onChange={(e) => p.onRemember(e.target.checked)} />{" "}
          Remember on this device
        </label>
        <button className="textbtn" onClick={p.onClear}>
          Clear key
        </button>
        <button className="secondary" onClick={p.onTest}>
          Test connection
        </button>
      </div>
    </div>
  );
}
