import { describe, expect, it } from "vitest";
import { extractDelta, readNotesStream } from "../lib/stream";

function streamOf(chunks: string[]) {
  const enc = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    start(controller) {
      for (const c of chunks) controller.enqueue(enc.encode(c));
      controller.close();
    },
  });
}

describe("extractDelta", () => {
  it("reads OpenAI-compatible, Anthropic and Google events", () => {
    expect(extractDelta('data: {"choices":[{"delta":{"content":"a"}}]}')).toBe("a");
    expect(
      extractDelta('data: {"type":"content_block_delta","delta":{"type":"text_delta","text":"b"}}'),
    ).toBe("b");
    expect(extractDelta('data: {"candidates":[{"content":{"parts":[{"text":"c"}]}}]}')).toBe("c");
  });
  it("ignores other lines, [DONE] and malformed JSON", () => {
    expect(extractDelta("event: ping")).toBe("");
    expect(extractDelta("data: [DONE]")).toBe("");
    expect(extractDelta("data: {broken")).toBe("");
  });
});

describe("readNotesStream", () => {
  it("does not lose text when a data line is split across chunks", async () => {
    const seen: string[] = [];
    const text = await readNotesStream(
      streamOf([
        'data: {"choices":[{"delta":{"con',
        'tent":"Hel"}}]}\ndata: {"choices":[{"delta":{"content":"lo"}}]}\n',
      ]),
      (t) => seen.push(t),
    );
    expect(text).toBe("Hello");
    expect(seen.at(-1)).toBe("Hello");
  });
  it("handles multi-byte characters split across chunks", async () => {
    const enc = new TextEncoder().encode('data: {"choices":[{"delta":{"content":"é"}}]}\n');
    const cut = enc.indexOf(0xc3) + 1;
    const body = new ReadableStream<Uint8Array>({
      start(c) {
        c.enqueue(enc.slice(0, cut));
        c.enqueue(enc.slice(cut));
        c.close();
      },
    });
    expect(await readNotesStream(body, () => {})).toBe("é");
  });
  it("reads a final line that has no trailing newline", async () => {
    expect(
      await readNotesStream(streamOf(['data: {"choices":[{"delta":{"content":"end"}}]}']), () => {}),
    ).toBe("end");
  });
});
