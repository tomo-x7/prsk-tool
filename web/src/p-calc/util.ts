import type { DataMap } from "./types";

export async function fetchBonusArray(bonus: number, filter: (n: number) => boolean, write: (n: number) => void) {
	const body = await fetch(`http://prsk-tool.tomo-x.win/p-calc/b/${bonus}.csv`).then((r) => r.body);
	if (body == null) return null;
	const stream = body.pipeThrough(new TextDecoderStream()).pipeThrough(new CSVStream());
	const reader = stream.getReader();
	const data: DataMap = new Map();
	while (true) {
		const { done, value } = await reader.read();
		if (done) break;
		const [point, score, music, liveB] = (value as string).split(",").map((s) => {
			const n = Number.parseInt(s, 10);
			if (Number.isNaN(n)) return null;
			return n;
		});
		if (point == null || score == null || music == null || liveB == null) continue;
		if (filter(score) === false) continue;
		write(point);
		if (data.get(bonus) == null) data.set(bonus, []);
		data.get(bonus)!.push({ point, music, score, liveB });
	}
	return data;
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
