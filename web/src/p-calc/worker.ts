import wasmUrl from "./p-calc.wasm?url";
import type { DataMap, Exports, Func, Result, WorkerMessages } from "./types";
import { fetchBonusArray } from "./util";

let wasm: (WebAssembly.Instance & { exports: Exports }) | null = null;
let globalData: DataMap | null = null;
let curBonus: number | null = null;
function assertWasm<T>(wasm: T | null): asserts wasm is T {
	if (wasm == null) throw new Error("WASM module not initialized");
}

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
const setBonus: Func<"setBonus"> = async ({ data: { bonus, max } }) => {
	assertWasm(wasm);
	wasm.exports.resetAll();
	const startPointer = wasm.exports.setBonusArray();
	const i32arr = new Int32Array(wasm.exports.memory.buffer, startPointer);
	let length = 0;
	const {data,min} = await fetchBonusArray(
		bonus,
		(n) => n <= max,
		(n) => {
			i32arr[length] = n;
			length++;
		},
	);
	globalData = data;
	curBonus = bonus;
	wasm.exports.setBonusFin(length);
	return {min};
};
function getResultData(x: number) {
	assertWasm(wasm);
	wasm.exports.buildResult(x);
	return { pointer: wasm.exports.getResultPointer(), size: wasm.exports.getResultSize() };
}
function readResult({ pointer, size }: { pointer: number; size: number }): Result[] {
	assertWasm(wasm);
	if (globalData == null) throw new Error("data not set");
	if (curBonus == null) throw new Error("curBonus not set");
	const I32Arr = new Int32Array(wasm.exports.memory.buffer, pointer, size);
	const result: Result[] = [];
	console.log(I32Arr);
	for (const v of I32Arr) {
		const arr = globalData.get(v);
		if (arr == null || arr.length === 0) throw new Error("invalid");
		const r = arr.sort((a, b) => a.liveB - b.liveB)[0];
		result.push({ ...r, bonus: curBonus, point: v });
	}
	return result;
}
const calc: Func<"calc"> = async ({ data: x }) => {
	assertWasm(wasm);
	if (globalData == null) throw new Error("data not set");
	if (curBonus == null) throw new Error("curBonus not set");
	wasm.exports.resetDp();
	wasm.exports.calc(x);
	if (wasm.exports.getResult(0) < x) {
		// simple mode
		const data = getResultData(0);
		return readResult(data);
	} else {
		throw new Error("ベータ版のため未対応なケースです。再度実行するにはリロードしてください。");
	}
};

const functions = {
	init,
	setBonus,
	calc,
} satisfies { [K in keyof WorkerMessages]: Func<K> };

addEventListener("message", async (ev: MessageEvent<WorkerMessages[keyof WorkerMessages]["Request"]>) => {
	// @ts-expect-error 型推論が効かない
	const res = await functions[ev.data.type](ev.data);
	postMessage({
		type: ev.data.type,
		data: res,
		// @ts-expect-error 型推論が効かない
	} satisfies WorkerMessages[typeof ev.data.type]["Response"]);
});

// 非同期エラーを同期エラーに変換してメインスレッドで回収
addEventListener("unhandledrejection", (e) => {
	throw e.reason instanceof Error ? e.reason : new Error(String(e.reason));
});
