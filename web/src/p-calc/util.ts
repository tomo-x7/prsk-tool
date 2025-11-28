import type { DataMap } from "./types";

type DataItem = { point: number; score: number; music: number; liveB: number };
export async function fetchBonusArray(bonus: number, filter: (n: DataItem) => boolean, write: (n: DataItem) => void) {
	const res = await fetch(`/p-calc/b/${bonus}.csv`);
	if (!res.ok) throw new Error(`データ取得エラー: ${res.statusText}`);
	const body = res.body;
	if (body == null) throw new Error(`Response body is null. ${res.statusText}`);
	const stream = body.pipeThrough(new TextDecoderStream()).pipeThrough(new CSVStream());
	const reader = stream.getReader();
	const data: DataMap = new Map();
	let min = Number.MAX_SAFE_INTEGER;
	while (true) {
		const { done, value } = await reader.read();
		if (done) break;
		const [point, score, music, liveB] = (value as string).split(",").map((s) => {
			const n = Number.parseInt(s, 10);
			if (Number.isNaN(n)) return null;
			return n;
		});
		if (point == null || score == null || music == null || liveB == null) continue;
		const item: DataItem = { point, score, music, liveB };
		if (filter(item) === false) continue;
		write(item);
		min = Math.min(min, point);
		if (data.get(point) == null) data.set(point, []);
		data.get(point)!.push({ music, score, liveB });
	}
	return { data, min };
}

export class CSVStream extends TransformStream {
	buf = "";
	constructor() {
		super({
			start: () => {},
			transform: (data: string, controller) => {
				const strArr = (this.buf + data.toString()).split("\n");
				for (const str of strArr.slice(0, -1)) {
					// 空行除外
					if (!str) continue;
					controller.enqueue(str.trim());
				}
				this.buf = strArr.at(-1) || "";
			},
			flush: (controller) => {
				if (this.buf) controller.enqueue(this.buf);
			},
		});
	}
}
