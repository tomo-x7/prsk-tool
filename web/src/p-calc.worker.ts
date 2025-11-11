import wasmUrl from "./p-calc.wasm?url";
import type { Message, Result, Kind } from "./p-calc";

let wasm: WebAssembly.Instance | null = null;

addEventListener("message", async (ev: MessageEvent<Message<Kind>>) => {
	if (ev.data.kind === "_init") {
		const { instance } = await WebAssembly.instantiateStreaming(fetch(wasmUrl), {
			env: {
				fatal: (code: number) => {
					throw new Error(`Fatal error in WebAssembly module. Code: ${code}`);
				},
			},
		});
		wasm = instance;
		postMessage({ id: ev.data.id, data: undefined } satisfies Result<"_init">);
	} else {
		if (wasm == null) throw new Error("WASM module not initialized");
		const kind = ev.data.kind;
		const fn = wasm.exports[kind];
		if (typeof fn !== "function") throw new Error(`Function ${kind} not found in WASM module`);
		const result = (fn as (...args: unknown[]) => Result<Kind>["data"])(...ev.data.param);
		postMessage({ id: ev.data.id, data: result } satisfies Result<Kind>);
	}
});

addEventListener("unhandledrejection",(e)=>{
	throw e.reason instanceof Error ? e.reason : new Error(String(e.reason));
})