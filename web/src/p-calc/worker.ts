import wasmUrl from "./p-calc.wasm?url";
import type { Exports, Func, WorkerMessages } from "./types";
import { fetchBonusArray } from "./util";

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
	const startPointer=wasm.exports.setBonusArray()
	const i32arr=new Int32Array(wasm.exports.memory.buffer,startPointer)
	let length=0;
	fetchBonusArray(bonus,(n)=>{
		i32arr[length]=n;
		length++;
	})
	wasm.exports.setBonusFin(length);
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
		data: res,
	} satisfies WorkerMessages[typeof ev.data.type]["Response"]);
});

// 非同期エラーを同期エラーに変換してメインスレッドで回収
addEventListener("unhandledrejection", (e) => {
	throw e.reason instanceof Error ? e.reason : new Error(String(e.reason));
});
