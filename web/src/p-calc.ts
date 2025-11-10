import wasm from "./p-calc.wasm?url";

interface Exports {
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
interface CreateResult {
	next: (bonus: number) => Promise<SetBonusResult>;
}
interface SetBonusResult {
	next: (p: number) => Promise<CalcResult>;
}
interface CalcResult {
	next: (p: number) => void;
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
		exports.calc(p);
		const canSimple = exports.getResult(0) < p;
		return { next: () => void 0 };
	};
}
