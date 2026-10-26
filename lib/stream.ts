/** Pulls the text delta out of one SSE `data:` line from OpenAI-compatible, Anthropic or Google streams. */
export function extractDelta(line: string): string {
  if (!line.startsWith("data:")) return "";
  try {
    const j = JSON.parse(line.slice(5));
    return (
      j.choices?.[0]?.delta?.content || j.delta?.text || j.candidates?.[0]?.content?.parts?.[0]?.text || ""
    );
  } catch {
    return "";
  }
}

/** Reads an SSE response body, buffering partial lines across chunks, and reports the accumulated text. */
export async function readNotesStream(body: ReadableStream<Uint8Array>, onText: (text: string) => void) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let out = "";
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      const delta = extractDelta(line);
      if (delta) {
        out += delta;
        onText(out);
      }
    }
  }
  const tail = extractDelta(buffer);
  if (tail) {
    out += tail;
    onText(out);
  }
  return out;
}
