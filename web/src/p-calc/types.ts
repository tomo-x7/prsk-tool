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
export type Request<Type extends keyof WorkerMessages, Data = null> = { data: Data; type: Type };
export type Response<Type extends keyof WorkerMessages, Data = null> = { data: Data; type: Type };
export type Func<Type extends keyof WorkerMessages> = (
	p: WorkerMessages[Type]["Request"],
) => Promise<WorkerMessages[Type]["Response"]["data"]>;
export interface WorkerMessages {
	init: {
		Request: Request<"init">;
		Response: Response<"init">;
	};
	setBonus: {
		Request: Request<"setBonus", { bonus: number; max: number }>;
		Response: Response<"setBonus", { min: number }>;
	};
	calc: {
		Request: Request<"calc", number>;
		Response: Response<"calc", Result[] | -1>;
	};
}
export interface Result {
	point: number;
	bonus: number;
	music: number;
	score: number;
	liveB: number;
}
export type DataMap = Map<number, Omit<Result, "bonus" | "point">[]>;
