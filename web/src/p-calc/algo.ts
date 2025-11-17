import { create } from "zustand";
import type { WorkerMessages } from "./types";
import PCalcWorker from "./worker.ts?worker";

// ストア
interface State {
	// wasmなどの初期化終了
	initLoaded: boolean;
	bonus: number | null;
	error: Error | null;
	result: null | number[];
	lock:boolean
}
interface Action {
	loadfin: () => void;
}
export const store = create<State & Action>()((set) => ({
	bonus: null,
	error: null,
	initLoaded: false,
	loadfin: () => set({ initLoaded: true }),
	result: null,lock:false,
}));




// 最下部で呼んでる
async function init() {
	await sendWorker("init", null);
	store.getState().loadfin();
}

// Worker通信
let locked = false;
const worker = new PCalcWorker();
function sendWorker<T extends keyof WorkerMessages>(
	key: T,
	data: WorkerMessages[T]["Request"]["data"],
): Promise<WorkerMessages[T]["Response"]["data"]>|undefined {
	if(locked)return void store.setState({error:new Error("worker locked")})
	locked=true;
	return new Promise((resolve) => {
		const listner = (evt: MessageEvent<WorkerMessages[T]["Response"]>) => {
			worker.removeEventListener("message", listner);
			locked=false;
			resolve(evt.data.data);
		};
		worker.addEventListener("message", listner);
		worker.postMessage({ type: key,  data });
	});
}
worker.addEventListener("error", (e) => {
	store.setState({ error: e.error instanceof Error?e.error:new Error(e.error) });
});

init();
