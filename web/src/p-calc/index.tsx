import { type CSSProperties, use, useEffect, useState } from "react";
import { createCallable } from "react-call";
import { MoonLoader } from "react-spinners";
import { AnimatedErase, Button, Card, NumberInput } from "../Components";
import { calc, initPromise, setBonus, useLocked, useStore } from "./algo";
import { LIVEB_REVERSE_MAP, MUSIC_MAP } from "./const";
import type { Result } from "./types";
import { useDisplayMin } from "../Contexts";

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
			<div className="max-min:text-sm">イベント編成そのままでできるポイント調整ツールです。</div>
			<div className="max-min:text-sm">イベントボーナスは小数には対応していません(WL時)。</div>
			<BonusView />
			{canCalc && <CalcView />}
			{result && <ResultView />}
			{locked && <Loading />}
			<musicList.Root />
		</div>
	);
}
function Loading() {
	return (
		<div className="inset-0 fixed z-50 bg-black/50 flex justify-center items-center">
			<MoonLoader color="#fff" size={128} />
		</div>
	);
}

function BonusView() {
	const gBonus = useStore((s) => s.bonus);
	const gMax = useStore((s) => s.max);
	const gNoSix = useStore((s) => s.noSixPlus);
	const canCalc = useStore((s) => s.canCalc);
	const [bonusStr, setBonusStr] = useState(useStore.getState().bonus?.toString() ?? "");
	const [maxN, setMaxN] = useState(useStore.getState().max ?? 10);
	const [noSix, setNoSix] = useState(useStore.getState().noSixPlus);
	const locked = useLocked();
	const [err, setErr] = useState<string | null>(null);
	const changed = bonusStr !== String(gBonus) || maxN !== gMax || noSix !== gNoSix;
	const apply = () => {
		if (bonusStr === "") return void setErr("値を入力してください");
		const bonusN = Number.parseInt(bonusStr, 10);
		if (Number.isNaN(bonusN) || Number.isNaN(maxN)) return void setErr("数値を入力してください");
		if (bonusN < 0 || bonusN > 435) return void setErr("ボーナスは0〜435の範囲で入力してください");
		if (maxN < 0 || maxN > 99) return void setErr("最大スコアは0〜99の範囲で入力してください");
		setErr(null);
		useStore.setState({ bonus: bonusN, max: maxN, noSixPlus: noSix });
		setBonusStr(bonusN.toString());
		setBonus();
	};
	return (
		<Card>
			<div className="flex flex-col gap-3">
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
							<option value={10} label="10万〜" />
							<option value={20} label="15万〜" />
							<option value={30} label="20万〜" />
							<option value={40} label="25万〜" />
							<option value={50} label="30万〜" />
							<option value={60} label="35万〜" />
							<option value={70} label="40万〜" />
							<option value={99} label="無制限" />
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
				<label>
					<input type="checkbox" checked={noSix} onChange={(e) => setNoSix(e.target.checked)} />
					6炊き以上を使わない
				</label>
				{err && <div style={{ color: "red" }}>{err}</div>}
				<Button className="mt-1" disabled={!changed || !bonusStr || !maxN || locked} onClick={apply}>
					{canCalc || !changed ? "更新" : "次へ"}
				</Button>
			</div>
		</Card>
	);
}

function CalcView() {
	const xg = useStore((s) => s.x);
	const minPoint = useStore((s) => s.minPoint);
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
	const result = useStore((s) => s.result);
	const changed = targetNum - nowNum !== xg || result == null;
	const apply = () => {
		if (nowStr === "" || targetStr === "") return void setErr("値を入力してください");
		if (Number.isNaN(nowNum) || Number.isNaN(targetNum) || nowNum < 0 || targetNum < 0)
			return void setErr("正の数値を入力してください");
		if (nowNum >= targetNum) return void setErr("目標値は現在のポイントより大きい値を入力してください");
		if (targetNum - nowNum > 300000) return void setErr("30万ポイント差までのみ対応しています");
		if (targetNum - nowNum < (minPoint ?? 100)) return void setErr(`現在の編成では${minPoint??100}ポイント差以上のみ可能です`);
		useStore.setState({ x: targetNum - nowNum, now: nowNum });
		setNowStr(nowNum.toString());
		setTargetStr(targetNum.toString());
		setErr(null);
		calc();
	};
	return (
		<Card>
			<div className="flex flex-col gap-3">
				<NumberInput label="現在のポイント" value={nowStr} onChange={setNowStr} disabled={locked} width={130} />
				<NumberInput label="目標値" value={targetStr} onChange={setTargetStr} disabled={locked} width={130} />
				{err && <div style={{ color: "red" }}>{err}</div>}
				<Button className="mt-1" disabled={locked || !changed || !nowStr || !targetStr} onClick={apply}>
					計算
				</Button>
			</div>
		</Card>
	);
}

function ResultView() {
	const result = useStore((s) => s.result);
	const x = useStore((s) => s.x);
	const prev = useStore((s) => s.now);
	const [forKey, setForKey] = useState(0);
	if (result==null) return null;
	if (result === -1) {
		return <Card>今の編成だけでは作れないポイントです。今後別編成の使用にも対応予定</Card>;
	}
	return (
		<Card>
			<div className="max-min:text-sm">必要ポイント: {x}P</div>
			<div className="flex justify-between mt-2 mb-1 max-min:text-sm">
				<div>計算結果</div>
				<button className="text-blue-600 underline" type="button" onClick={() => setForKey((s) => s + 1)}>
					すべて再表示
				</button>
			</div>
			<div className="flex flex-col">
				{mapResult(result, prev ?? 0).map(({ data, prev }, i) => (
					<ResultEntry key={Object.values(data).join("") + prev + forKey} data={data} prev={prev} />
				))}
			</div>
		</Card>
	);
}
function mapResult(input: Result[], initPrev: number) {
	const res: { data: Result; prev: number }[] = [];
	let prev = initPrev;
	for (const data of input) {
		res.push({ data, prev });
		prev += data.point;
	}
	return res;
}

function ResultEntry({ data, prev }: { data: Result; prev: number }) {
	const [erased, setErased] = useState(false);
	const isMin=useDisplayMin();
	
	return (
		<AnimatedErase erased={erased} height={isMin?65:80} className="border flex overflow-hidden mb-2 max-min:text-sm">
			<div className="grow">
				<div>
					{data.bonus}%・{parseLiveB(data.liveB)}炊
				</div>
				<div>
					スコア:{scoreMin(data.score)}〜{scoreMax(data.score)}
				</div>
				<button
					type="button"
					className="text-blue-600 underline cursor-pointer"
					onClick={() => musicList.call({ p: data.music })}
				>
					楽曲基礎点: {data.music}
				</button>
			</div>
			<div className="grow flex flex-col justify-end-safe ">
				<div>{data.point}{isMin?" P":"ポイント"}</div>
				<div>
					{prev} → {prev + data.point}
				</div>
			</div>
			<div className="flex-none flex flex-col justify-center">
				<button type="button" onClick={() => setErased(true)}>
					<svg x="0px" y="0px" width={isMin?24:32} height={isMin?24:32} viewBox="0 0 512 512">
						<g>
							<polygon
								fill="#000"
								points="440.469,73.413 218.357,295.525 71.531,148.709 0,220.229 146.826,367.055 218.357,438.587 289.878,367.055 512,144.945"
							/>
						</g>
					</svg>
				</button>
			</div>
		</AnimatedErase>
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
				<div className="text-lg max-min:text-base">基礎点が{p}の楽曲一覧</div>
				<div className="text-base max-min:text-sm overflow-y-auto" style={{ height: "calc(100% - 1rem)" }}>
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
