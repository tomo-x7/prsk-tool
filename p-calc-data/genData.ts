import { createReadStream, createWriteStream, mkdirSync, rm, type WriteStream } from "node:fs";
import { CSVStream } from "./util";
import { join } from "node:path";
import { OUT } from "./const";

process.chdir(import.meta.dirname);

function genTemp() {
	const source = createReadStream("./data.csv").pipe(new CSVStream());
	const tempStreams: Record<string, WriteStream | undefined> = {};
	for (let i = 0; i < 100; i += 1) {
		mkdirSync(join(OUT, i.toString()), { recursive: true });
		tempStreams[i.toString()] = createWriteStream(join(OUT, i.toString(), "temp.csv"), {});
	}
	source.on("data", (raw: Buffer | string) => {
		const [scoreRatio, eventRatio, musicRatio, liveRatio, point] = raw.toString().split(",");
		const key = Number.parseInt(point, 10) % 100;
		tempStreams[key]!.write(`${raw}\n`);
	});
	return new Promise<void>((resolve) => {
		source.on("end", () => {
			const promises = Object.entries(tempStreams).map(
				([k, stream]) =>
					new Promise<void>((resolve) => {
						stream?.end();
						stream?.once("finish", () => {
							stream?.removeAllListeners();
							tempStreams[k] = undefined;
							resolve();
						});
						if (stream == null) resolve();
					}),
			);
			Promise.allSettled(promises).then(() => resolve());
		});
	});
}

await genTemp();

for (let i = 0; i < 100; i++) {
	const source = createReadStream(join(OUT, i.toString(), "temp.csv")).pipe(new CSVStream());
	const outStreams = new Map<number, WriteStream>();
	source.on("data", (raw: Buffer | string) => {
		const [scoreRatio, eventRatio, musicRatio, liveRatio, point] = raw.toString().split(",");
		const key = Number.parseInt(point, 10);
		if (!outStreams.has(key)) {
			outStreams.set(key, createWriteStream(join(OUT, i.toString(), `${key}.csv`)));
		}
		outStreams.get(key)!.write(`${scoreRatio},${eventRatio},${musicRatio},${liveRatio}\n`);
	});
	source.on("end", () => {
		for (const [key, stream] of outStreams.entries()) {
			stream.end();
			stream.once("finish", () => {
				stream.removeAllListeners();
				outStreams.delete(key);
			});
		}
		rm(join(OUT, i.toString(), "temp.csv"), () => {});
	});
}
