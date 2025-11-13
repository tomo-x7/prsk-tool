import PCalcWorker from "./worker.ts?worker";

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
	param: Parameters<Exports[T]> extends never[] ? undefined : Parameters<Exports[T]>;
	id: number;
}

async function init() {
	await doWasm({ kind: "_init", param: undefined });
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

init();
