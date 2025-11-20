import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import type { Result, WorkerMessages } from "./types";
import PCalcWorker from "./worker.ts?worker";

// ストア
interface State {
	error: Error | null;
	bonus: number | null;
	max: number | null;
	minPoint:number|null;
	canCalc: boolean;
	now: number | null;
	x: number | null;
	result: null | Result[];
	lock: boolean;
}
export const useStore = create<State>()(
	subscribeWithSelector((set) => ({
		error: null,
		bonus: null,
		max: null,
		minPoint:null,
		canCalc: false,
		now: null,
		x: null,
		result: null,
		lock: false,
	})),
);
const lock = () => useStore.setState({ lock: true });
const unlock = () => useStore.setState({ lock: false });
const error = (err: Error) => useStore.setState({ error: err });
export const useLocked = () => useStore((s) => s.lock);

// 最下部で呼んでる
async function init() {
	console.log("init called");
	await sendWorker("init", null);
}

export async function setBonus() {
	const { bonus, max } = useStore.getState();
	if (bonus == null || max == null) return void error(new Error("bonus or max is null"));
	lock();
	useStore.setState({ canCalc: false, result: null });
	const p = sendWorker("setBonus", { bonus, max });
	if (p == null) return void unlock();
	try {
		const {min}=await p;
		useStore.setState({ canCalc: true,minPoint:min });
	} finally {
		unlock();
	}
}

export async function calc() {
	const { x, canCalc } = useStore.getState();
	if (x == null || !canCalc) return void error(new Error("x is null or cannot calculate"));
	lock();
	useStore.setState({ result: null });
	await sendWorker("calc", x)
		?.then((res) => {
			useStore.setState({ result: res });
		})
		.finally(() => unlock());
	unlock();
}

// Worker通信
let locked = false;
const worker = new PCalcWorker();
function sendWorker<T extends keyof WorkerMessages>(
	key: T,
	data: WorkerMessages[T]["Request"]["data"],
): Promise<WorkerMessages[T]["Response"]["data"]> | undefined {
	if (locked) return void error(new Error("worker locked"));
	locked = true;
	worker.dispatchEvent;
	return new Promise((resolve) => {
		const listner = (evt: MessageEvent<WorkerMessages[T]["Response"]>) => {
			worker.removeEventListener("message", listner);
			locked = false;
			resolve(evt.data.data);
		};
		worker.addEventListener("message", listner);
		worker.postMessage({ type: key, data });
	});
}
worker.addEventListener("error", (e) => {
	useStore.setState({ error: e.error instanceof Error ? e.error : new Error(e.error || e.message) });
	try {
		worker.terminate();
	} catch {}
});

export const initPromise = init();
