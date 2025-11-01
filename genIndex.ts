import { createReadStream, createWriteStream } from "node:fs";
import { CSVStream } from "./util";

const stream = createReadStream("./data.csv").pipe(new CSVStream());
const out = createWriteStream("./public/p-calc/index.csv");
const obj: Record<string, Set<number> | undefined> = {};
stream.on("data", (raw: Buffer | string) => {
	const [scoreRatio, eventRatio, musicRatio, liveRatio, pointStr] = raw.toString().split(",");
	const point = Number.parseInt(pointStr, 10);
	if (obj[point] == null) obj[point] = new Set();
	obj[point].add(Number.parseInt(eventRatio, 10));
});
stream.on("close", () => {
	for (const key of Object.keys(obj).toSorted((a, b) => Number.parseInt(b, 10) - Number.parseInt(a, 10))) {
		out.write(
			key +
				"," +
				Array.from(obj[key] ?? [])
					.toSorted((a, b) => a - b)
					.join(",") +
				"\n",
		);
	}
});
