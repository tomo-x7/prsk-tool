// ボーナス値(%)ごと
import { createReadStream, createWriteStream, mkdirSync, rm, type WriteStream } from "node:fs";
import { join } from "node:path";
import { OUT } from "./const";
import { CSVStream } from "./util";

process.chdir(import.meta.dirname);
const DATA_OUT = join(OUT, "b");
console.log(DATA_OUT);
mkdirSync(DATA_OUT, { recursive: true });

const source = createReadStream("./data.csv").pipe(new CSVStream());
const outStreams = new Map<number, WriteStream>();
source.on("data", (raw: Buffer | string) => {
	const [scoreRatio, eventBonus, musicRatio, liveRatio, point] = raw.toString().split(",");
	const key = Number.parseInt(eventBonus, 10);
	if (!outStreams.has(key)) {
		outStreams.set(key, createWriteStream(join(DATA_OUT, `${key}.csv`)));
	}
	outStreams.get(key)!.write(`${point},${scoreRatio},${musicRatio},${liveRatio}\n`);
});
source.on("end", async () => {
	const keys = Array.from(outStreams.keys());
	const promises = Array.from(outStreams.entries()).map(
		([key, stream]) =>
			new Promise<void>((resolve) => {
				stream.end();
				stream.once("finish", () => {
					stream.removeAllListeners();
					outStreams.delete(key);
					resolve();
				});
			}),
	);
	await Promise.all(promises);
	// TODO:ソートする
});
