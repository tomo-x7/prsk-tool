import { createReadStream, createWriteStream, mkdirSync, rm, type WriteStream } from "node:fs";
import { CSVStream } from "./util";

process.chdir(import.meta.dirname);

function genTemp() {
	const source = createReadStream("./data.csv").pipe(new CSVStream());
	const tempStreams: Record<string, WriteStream | undefined> = {};
	for (let i = 0; i < 100; i += 1) {
		mkdirSync(`./public/p-calc/${i}`, { recursive: true });
		tempStreams[i.toString()] = createWriteStream(`./public/p-calc/${i}/temp.csv`, {});
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
	const source = createReadStream(`./public/p-calc/${i}/temp.csv`).pipe(new CSVStream());
	const outStreams = new Map<number, WriteStream>();
	source.on("data", (raw: Buffer | string) => {
		const [scoreRatio, eventRatio, musicRatio, liveRatio, point] = raw.toString().split(",");
		const key = Number.parseInt(point, 10);
		if (!outStreams.has(key)) {
			outStreams.set(key, createWriteStream(`./public/p-calc/${i}/${key}.csv`));
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
		rm(`./public/p-calc/${i}/temp.csv`, () => {});
	});
}
