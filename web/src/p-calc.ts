import wasm from "./p-calc.wasm?url";
import PCalcWorker from "./p-calc.worker?worker";

export interface Exports {
	memory: WebAssembly.Memory;
	setBonusArray: () => number;
	setBonusFin: (size: number) => void;
	calc: (x: number) => void;
	getResult: (x: number) => number;
	buildResult: (x: number) => number;
	getResultPointer: () => number;
	getResultSize: () => number;
	resetDp: () => void;
	resetAll: () => void;
	// worker用
	_init: () => void;
}
export type Kind = keyof Omit<Exports, "memory">;
export type Result<T extends Kind> = { data: ReturnType<Exports[T]>; id: number };
export interface Message<T extends Kind> {
	kind: T;
	param: Parameters<Exports[T]>;
	id: number;
}
type PromiseLike<T> = T | Promise<T>;
interface CreateResult {
	next: (bonus: number) => PromiseLike<SetBonusResult>;
}
interface SetBonusResult {
	next: (p: number) => PromiseLike<CalcResult>;
}
interface CalcResult {
	next: (p: number) => PromiseLike<void>;
}

export async function createPCalc(): Promise<CreateResult> {
	const { instance } = await WebAssembly.instantiateStreaming(fetch(wasm), {
		env: {
			fatal: (code: number) => {
				throw new Error(`Fatal error in WebAssembly module. Code: ${code}`);
			},
		},
	});
	const exports = instance.exports as unknown as Exports;
	return { next: setBonusOuter(instance, exports) };
}

function setBonusOuter(instance: WebAssembly.Instance, exports: Exports) {
	return async (bonus: number): Promise<SetBonusResult> => {
		exports.resetAll();
		return { next: calcOuter(instance, exports) };
	};
}

function calcOuter(instance: WebAssembly.Instance, exports: Exports): (p: number) => Promise<CalcResult> {
	return async (p: number): Promise<CalcResult> => {
		exports.resetDp();
		exports.calc(p);
		const simple = exports.getResult(0) < p;
		return { next: () => void 0 };
	};
}

let id = 1;
const worker = new PCalcWorker();
function doWasm<T extends Kind>(body: Omit<Message<T>, "id">): Promise<Result<T>["data"]> {
	return new Promise((resolve) => {
		const curId = id++;
		const listner = (evt: MessageEvent<Result<T>>) => {
			if (evt.data.id !== curId) return;
			worker.removeEventListener("message", listner);
			resolve(evt.data.data);
		};
		worker.addEventListener("message", listner);
		worker.postMessage({ ...body, id: curId } satisfies Message<T>);
	});
}
worker.addEventListener("error", () => {});
