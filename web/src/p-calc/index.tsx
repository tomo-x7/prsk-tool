import { use, useState } from "react";
import { calc, initPromise, setBonus, useLocked, useStore } from "./algo";
// import {useStore} from "zustand"

export default function PCalc() {
	use(initPromise);
	const error = useStore((s) => s.error);
	const locked = useLocked();
	const canCalc = useStore((s) => s.canCalc);
	const result = useStore((s) => s.result);
	if (error) {
		return <div>エラーが発生しました: {error.message}</div>;
	}
	return (
		<div>
			<div>ポ調ツールβ</div>
			<Bonus />
			{canCalc && <Calc />}
			{result && <Result />}
			{locked && <div className="inset-0 fixed z-50 bg-black/50" />}
		</div>
	);
}

function Bonus() {
	const gBonus = useStore((s) => s.bonus);
	const gMax = useStore((s) => s.max);
	const [bonusStr, setBonusStr] = useState("");
	const [maxStr, setMaxStr] = useState("");
	const locked = useLocked();
	const [err, setErr] = useState<string | null>(null);
	const changed = bonusStr !== String(gBonus) || maxStr !== String(gMax);
	const apply = () => {
		if (bonusStr === "" || maxStr === "") return void setErr("値を入力してください");
		const bonusN = Number.parseInt(bonusStr, 10);
		const maxN = Number.parseInt(maxStr, 10);
		if (Number.isNaN(bonusN) || Number.isNaN(maxN)) return void setErr("数値を入力してください");
		if (bonusN < 0 || bonusN > 435) return void setErr("ボーナスは0〜435の範囲で入力してください");
		if (maxN < 0 || maxN > 99) return void setErr("最大スコアは0〜99の範囲で入力してください");
		setErr(null);
		useStore.setState({ bonus: bonusN, max: maxN });
		setBonus();
	};
	return (
		<div>
			<NumberInput label="ボーナス" value={bonusStr} onChange={setBonusStr} min={0} max={435} disabled={locked} />
			<NumberInput
				label="最大スコア(20000で割った値、低め推奨)"
				value={maxStr}
				onChange={setMaxStr}
				min={0}
				max={99}
				disabled={locked}
			/>
			{err && <div style={{ color: "red" }}>{err}</div>}
			<button
				type="button"
				className="bg-blue-600 disabled:bg-gray-600 text-white"
				disabled={!changed || !bonusStr || !maxStr || locked}
				onClick={apply}
			>
				次へ
			</button>
		</div>
	);
}

function Calc() {
	const xg = useStore((s) => s.x);
	const [nowStr, setNowStr] = useState("");
	const [targetStr, setTargetStr] = useState("");
	const locked = useLocked();
	const [err, setErr] = useState<string | null>(null);
	const nowNum = Number.parseInt(nowStr, 10);
	const targetNum = Number.parseInt(targetStr, 10);
	const changed = targetNum - nowNum !== xg;
	const apply = () => {
		if (nowStr === "" || targetStr === "") return void setErr("値を入力してください");
		if (Number.isNaN(nowNum) || Number.isNaN(targetNum)) return void setErr("数値を入力してください");
		useStore.setState({ x: targetNum - nowNum });
		setErr(null);
		calc();
	};
	return (
		<div>
			<NumberInput label="現在のポイント" value={nowStr} onChange={setNowStr} disabled={locked} />
			<NumberInput label="目標値" value={targetStr} onChange={setTargetStr} disabled={locked} />
			<button type="button" disabled={locked || !changed || !nowStr || !targetStr} onClick={apply}>
				計算
			</button>
		</div>
	);
}

function Result() {
	const result = useStore((s) => s.result);
	if (!result) return null;
	return <div>{JSON.stringify(result)}</div>;
}

function NumberInput({
	onChange,
	value,
	label,
	min,
	max,
	disabled,
}: {
	value: string;
	onChange: (e: string) => void;
	label: string;
	min?: number;
	max?: number;
	disabled?: boolean;
}) {
	return (
		<div>
			<label>
				{label}:
				<input
					className="border user-invalid:border-red-600"
					type="number"
					required
					value={value}
					onChange={(e) => onChange(e.target.value)}
					min={min}
					max={max}
					disabled={disabled}
				/>
			</label>
		</div>
	);
}
