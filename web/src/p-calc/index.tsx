import { use, useState } from "react";
import { createCallable } from "react-call";
import { Button, Card, NumberInput } from "../Components";
import { calc, initPromise, setBonus, useLocked, useStore } from "./algo";
import { LIVEB_REVERSE_MAP, MUSIC_MAP } from "./const";
import type { Result } from "./types";

export default function PCalc() {
	use(initPromise);
	const error = useStore((s) => s.error);
	const locked = useLocked();
	const canCalc = useStore((s) => s.canCalc);
	const result = useStore((s) => s.result);
	if (error) {
		return (
			<div>
				<Card>
					<div className="text-red-600">エラーが発生しました: {String(error)}</div>
				</Card>
			</div>
		);
	}
	return (
		<div>
			<div>イベント編成そのままでできるポイント調整ツールです。</div>
			<div>イベントボーナスは小数には対応していません(WL時)。</div>
			<BonusView />
			{canCalc && <CalcView />}
			{result && <ResultView />}
			{locked && <div className="inset-0 fixed z-50 bg-black/50" />}
			<musicList.Root />
		</div>
	);
}

function BonusView() {
	const gBonus = useStore((s) => s.bonus);
	const gMax = useStore((s) => s.max);
	const canCalc = useStore((s) => s.canCalc);
	const [bonusStr, setBonusStr] = useState(useStore.getState().bonus?.toString() ?? "");
	const [maxN, setMaxN] = useState(useStore.getState().max ?? 20);
	const locked = useLocked();
	const [err, setErr] = useState<string | null>(null);
	const changed = bonusStr !== String(gBonus) || maxN !== gMax;
	const apply = () => {
		if (bonusStr === "") return void setErr("値を入力してください");
		const bonusN = Number.parseInt(bonusStr, 10);
		if (Number.isNaN(bonusN) || Number.isNaN(maxN)) return void setErr("数値を入力してください");
		if (bonusN < 0 || bonusN > 435) return void setErr("ボーナスは0〜435の範囲で入力してください");
		if (maxN < 0 || maxN > 99) return void setErr("最大スコアは0〜99の範囲で入力してください");
		setErr(null);
		useStore.setState({ bonus: bonusN, max: maxN });
		setBonusStr(bonusN.toString());
		setBonus();
	};
	return (
		<Card>
			<NumberInput
				label="編成のイベントボーナス"
				value={bonusStr}
				onChange={setBonusStr}
				min={0}
				max={435}
				disabled={locked}
			/>
			<label className="flex gap-2">
				総合力目安:
				<div className="relative w-20">
					<select
						className="border w-full focus:outline-2 outline-black appearance-none"
						value={maxN}
						onChange={(ev) => setMaxN(Number.parseInt(ev.currentTarget.value, 10))}
					>
						<option value={20} label="10万〜" />
						<option value={30} label="15万〜" />
						<option value={40} label="20万〜" />
						<option value={50} label="25万〜" />
						<option value={60} label="30万〜" />
						<option value={70} label="35万〜" />
						<option value={80} label="40万〜" />
					</select>
					<div className="absolute pointer-events-none right-1 inset-y-0 flex items-center">
						<svg x="0px" y="0px" viewBox="0 0 512 512" width={16} height={16}>
							<g>
								<polygon
									fill="#000"
									points="440.189,92.085 256.019,276.255 71.83,92.085 0,163.915 256.019,419.915 512,163.915 	"
								/>
							</g>
						</svg>
					</div>
				</div>
			</label>
			{err && <div style={{ color: "red" }}>{err}</div>}
			<Button disabled={!changed || !bonusStr || !maxN || locked} onClick={apply}>
				{canCalc || !changed ? "更新" : "次へ"}
			</Button>
		</Card>
	);
}

function CalcView() {
	const xg = useStore((s) => s.x);
	const minPoint=useStore(s=>s.minPoint)
	const [nowStr, setNowStr] = useState(useStore.getState().now?.toString() ?? "");
	const [targetStr, setTargetStr] = useState(() => {
		const now = useStore.getState().now;
		const x = useStore.getState().x;
		if (now != null && x != null) {
			return (now + x).toString();
		}
		return "";
	});
	const locked = useLocked();
	const [err, setErr] = useState<string | null>(null);
	const nowNum = Number.parseInt(nowStr, 10);
	const targetNum = Number.parseInt(targetStr, 10);
	const changed = targetNum - nowNum !== xg;
	const apply = () => {
		if (nowStr === "" || targetStr === "") return void setErr("値を入力してください");
		if (Number.isNaN(nowNum) || Number.isNaN(targetNum) || nowNum < 0 || targetNum < 0)
			return void setErr("正の数値を入力してください");
		if (nowNum >= targetNum) return void setErr("目標値は現在のポイントより大きい値を入力してください");
		if (targetNum - nowNum > 300000) return void setErr("30万ポイント差までのみ対応しています");
		if (targetNum - nowNum < (minPoint??100)) return void setErr(`現在の編成では${minPoint}以上のみ可能です`);
		useStore.setState({ x: targetNum - nowNum, now: nowNum });
		setNowStr(nowNum.toString());
		setTargetStr(targetNum.toString());
		setErr(null);
		calc();
	};
	return (
		<Card>
			<NumberInput label="現在のポイント" value={nowStr} onChange={setNowStr} disabled={locked} />
			<NumberInput label="目標値" value={targetStr} onChange={setTargetStr} disabled={locked}  />
			{err && <div style={{ color: "red" }}>{err}</div>}
			<Button disabled={locked || !changed || !nowStr || !targetStr} onClick={apply}>
				計算
			</Button>
		</Card>
	);
}

function ResultView() {
	const result = useStore((s) => s.result);
	const x = useStore((s) => s.x);
	if (!result) return null;
	return (
		<Card>
			<div>必要ポイント: {x}P</div>
			<div>計算結果</div>
			<div className="flex flex-col gap-1">
				{result.map((r, i) => (
					<ResultEntry key={Object.values(r).join("")} data={r} />
				))}
			</div>
		</Card>
	);
}
function ResultEntry({ data }: { data: Result }) {
	return (
		<div className="border">
			<div>{data.bonus}%編成</div>
			<div>
				スコア: {scoreMin(data.score)}〜{scoreMax(data.score)}
			</div>
			<div>{parseLiveB(data.liveB)}炊き</div>
			<button
				type="button"
				className="text-blue-600 underline cursor-pointer"
				onClick={() => musicList.call({ p: data.music })}
			>
				楽曲基礎点: {data.music}
			</button>
			<div>{data.point}P</div>
		</div>
	);
}

const musicList = createCallable<{ p: number }>(({ p, call }) => {
	const arr = MUSIC_MAP[p];
	if (arr == null) throw new Error("無効な楽曲データ");
	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: for close
		<div onClick={() => call.end()} className="fixed inset-0 bg-black/50 justify-center items-center flex z-50">
			{/* biome-ignore lint/a11y/noStaticElementInteractions: for close */}
			<div
				onClick={(ev) => ev.stopPropagation()}
				className="bg-white p-4 flex flex-1 flex-col max-h-[90dvh] overflow-hidden w-xl max-w-dvh "
			>
				<div className="text-base">基礎点が{p}の楽曲一覧</div>
				<div className="overflow-y-auto" style={{ height: "calc(100% - 1rem)" }}>
					{arr.map((name) => (
						<div key={name}>・{name}</div>
					))}
				</div>
				<button type="button" onClick={() => call.end()} className="text-blue-600 underline cursor-pointer">
					閉じる
				</button>
			</div>
		</div>
	);
});

const parseLiveB = (liveb: number) => LIVEB_REVERSE_MAP[liveb] ?? "無効なデータ";
const scoreMin = (score: number) => score * 20000;
const scoreMax = (score: number) => score * 20000 + 19999;
