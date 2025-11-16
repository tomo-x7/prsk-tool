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
}
export type Request<Type extends keyof WorkerMessages, Data = null> = { id: number; data: Data; type: Type };
export type Response<Type extends keyof WorkerMessages, Data = null> = { id: number; data: Data; type: Type };
export type Func<Type extends keyof WorkerMessages> = (
	p: WorkerMessages[Type]["Request"],
) => Promise<WorkerMessages[Type]["Response"]["data"]>;
export interface WorkerMessages {
	init: {
		Request: Request<"init">;
		Response: Response<"init">;
	};
	setBonus: {
		Request: Request<"setBonus", number>;
		Response: Response<"setBonus">;
	};
}
