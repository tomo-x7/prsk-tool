import { createReadStream, createWriteStream } from "node:fs";
import { join } from "node:path";
import { OUT } from "./const";
import { CSVStream } from "./util";

process.chdir(import.meta.dirname);

const stream = createReadStream("./data.csv").pipe(new CSVStream());
const out = createWriteStream(join(OUT, "p-index.csv"));
const pRecord: Record<string, Set<number> | undefined> = {};
stream.on("data", (raw: Buffer | string) => {
	const [scoreRatio, eventRatio, musicRatio, liveRatio, pointStr] = raw.toString().split(",");
	const point = Number.parseInt(pointStr, 10);

	if (pRecord[point] == null) pRecord[point] = new Set();
	pRecord[point].add(Number.parseInt(eventRatio, 10));
});
stream.on("end", () => {
	for (const key of Object.keys(pRecord).toSorted((a, b) => Number.parseInt(b, 10) - Number.parseInt(a, 10))) {
		out.write(
			key +
				"," +
				Array.from(pRecord[key] ?? [])
					.toSorted((a, b) => a - b)
					.join(",") +
				"\n",
		);
	}
});
