import { create, } from "zustand";
import type { WorkerMessages } from "./types";
import PCalcWorker from "./worker.ts?worker";

// ストア
interface State {
	state: "loading" | "inited" | "error";
	bonus: number | null;
}
interface Action{

}
const store = create<State & Action>()((set)=>({
	state: "loading",
	bonus: null,
}));



// 最下部で呼んでる
async function init() {
	await sendWorker("init", null);
}

// Worker通信
let id = 1;
const worker = new PCalcWorker();
function sendWorker<T extends keyof WorkerMessages>(
	key: T,
	data: WorkerMessages[T]["Request"]["data"],
): Promise<WorkerMessages[T]["Response"]["data"]> {
	return new Promise((resolve) => {
		const curId = id++;
		const listner = (evt: MessageEvent<WorkerMessages[T]["Response"]>) => {
			if (evt.data.id !== curId) return;
			worker.removeEventListener("message", listner);
			resolve(evt.data.data);
		};
		worker.addEventListener("message", listner);
		worker.postMessage({ type: key, id: curId, data });
	});
}
worker.addEventListener("error", () => {});

init();
