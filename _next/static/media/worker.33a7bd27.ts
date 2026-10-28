import { AutoTokenizer, PreTrainedModel, Tensor, env } from "@huggingface/transformers";
import { ACTIONS, MODEL, REVISION, distribution, encodeDecision } from "./encoding";
import type { WorkerReply, WorkerRequest } from "./protocol";

const send = (message: WorkerReply) => self.postMessage(message);
let tokenizer: Awaited<ReturnType<typeof AutoTokenizer.from_pretrained>>;
let model: PreTrainedModel;
let loading: Promise<void> | undefined;
let busy = false;

async function load() {
  env.allowLocalModels = false;
  // One worker thread keeps the page responsive without cross-origin isolation headers.
  if (!env.backends.onnx.wasm) throw new Error("ONNX WebAssembly backend is unavailable.");
  env.backends.onnx.wasm.numThreads = 1;
  const gpu = (navigator as Navigator & { gpu?: { requestAdapter(): Promise<{ features: Set<string> } | null> } }).gpu;
  const adapter = await gpu?.requestAdapter();
  const device = adapter ? "webgpu" : "wasm";
  const dtype = adapter?.features.has("shader-f16") ? "q4f16" : "q4";
  send({ type: "progress", text: `Loading ${dtype} on ${device}…` });
  const options = { revision: REVISION, device, dtype, progress_callback: (event: { status: string; file?: string; progress?: number }) => {
    if (event.status === "progress") send({ type: "progress", text: `${event.file ?? "Model"} · ${Math.round(event.progress ?? 0)}%` });
  } } as const;
  tokenizer = await AutoTokenizer.from_pretrained(MODEL, { revision: REVISION });
  model = await PreTrainedModel.from_pretrained(MODEL, options);
  send({ type: "ready", device, dtype });
}

self.onmessage = async ({ data }: MessageEvent<WorkerRequest>) => {
  try {
    if (data.type === "load") {
      loading ??= load().catch(error => { loading = undefined; throw error; });
      await loading;
      return;
    }
    if (busy) throw new Error("A decision is already in flight.");
    if (!model || !tokenizer) throw new Error("Load the model first.");
    busy = true;
    const state = [...data.messages.map(m => `${m.role}: ${m.text}`), `assistant reply so far: ${JSON.stringify(data.partial)}`].join("\n");
    const prompt = `${data.prompt}\nChoose the next character to append to the assistant reply. space inserts a space; end_turn finishes the reply.`;
    const { ids, positions } = encodeDecision(state, [{ prompt, options: ACTIONS }], word => tokenizer.encode(word, { add_special_tokens: false }));
    const tensor = (values: number[]) => new Tensor("int64", BigInt64Array.from(values.map(BigInt)), [1, values.length]);
    const start = performance.now();
    const result = await model.forward({ input_ids: tensor(ids), attention_mask: tensor(ids.map(() => 1)), marker_positions: tensor(positions) });
    const scores = distribution(Array.from(result.logits.data, Number), ACTIONS);
    send({ type: "result", id: data.id, action: scores[0].action, scores: scores.slice(0, 5), ms: performance.now() - start, tokens: ids.length });
  } catch (error) {
    send({ type: "error", id: data.type === "decide" ? data.id : undefined, message: error instanceof Error ? error.message : String(error) });
  } finally { busy = false; }
};
