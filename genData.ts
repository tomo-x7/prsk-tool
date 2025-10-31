// @ts-check
import { appendFileSync, createReadStream, createWriteStream, writeFileSync } from "node:fs";
import { CSVStream } from "./util";

const stream = createReadStream("./data.csv").pipe(new CSVStream());
const out = createWriteStream("./public/p-calc/index.csv");
const obj: Record<string, Set<number> | undefined> = {};
stream.on("data", (raw: Buffer | string) => {
	const [scoreRatio, eventRatio, musicRatio, liveRatio, point] = raw.toString().split(",");
	addFile(point, `${scoreRatio},${eventRatio},${musicRatio},${liveRatio}`);
});

function addFile(point: string, data: string) {
	appendFileSync(`./public/p-calc/${point}.csv`, `${data}\n`, {});
}
