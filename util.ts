import { Transform, TransformCallback } from "stream";

export class CSVStream extends Transform {
	buf = "";
	_transform(data: string | Buffer, encoding: any, callback: TransformCallback) {
		const strArr = (this.buf + data.toString()).split("\n");
		for (const str of strArr.slice(0, -1)) {
			// 空行除外
			if (!str) continue;
			this.push(str.trim());
		}
		this.buf = strArr.at(-1) || "";
		callback();
	}
}
