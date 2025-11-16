import wasmUrl from "./p-calc.wasm?url";
import type { Exports, Func, WorkerMessages } from "./types";

let wasm: (WebAssembly.Instance & { exports: Exports }) | null = null;

const init: Func<"init"> = async () => {
	if (wasm != null) return null;
	const { instance } = await WebAssembly.instantiateStreaming(fetch(wasmUrl), {
		env: {
			fatal: (code: number) => {
				throw new Error(`Fatal error in WebAssembly module. Code: ${code}`);
			},
		},
	});
	wasm = instance as WebAssembly.Instance & { exports: Exports };
	return null;
};
const setBonus: Func<"setBonus"> = async ({ data: bonus }) => {
	if (wasm == null) throw new Error("WASM module not initialized");
	return null;
};

const functions = {
	init,
	setBonus,
} satisfies { [K in keyof WorkerMessages]: Func<K> };

addEventListener("message", async (ev: MessageEvent<WorkerMessages[keyof WorkerMessages]["Request"]>) => {
	// @ts-expect-error 型推論が効かない
	const res = await functions[ev.data.type](ev.data);
	postMessage({
		type: ev.data.type,
		id: ev.data.id,
		data: res,
	} satisfies WorkerMessages[typeof ev.data.type]["Response"]);
});

addEventListener("unhandledrejection", (e) => {
	throw e.reason instanceof Error ? e.reason : new Error(String(e.reason));
});
