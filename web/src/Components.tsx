import {
	useEffect,
	useImperativeHandle,
	useState,
	type CSSProperties,
	type MouseEvent,
	type PropsWithChildren,
	type ReactNode,
	type Ref,
	type RefObject,
} from "react";

export function NumberInput({
	onChange,
	value,
	label,
	min,
	max,
	disabled,
	width,
}: {
	value: string;
	onChange: (e: string) => void;
	label: string;
	min?: number;
	max?: number;
	disabled?: boolean;
	width?: number;
}) {
	return (
		<div className="">
			<label className="flex gap-2 items-center">
				<div>{label}:</div>
				<input
					className="border invalid:border-red-600 invalid:outline-red-600 focus:outline-2 outline-black"
					type="number"
					required
					value={value}
					onChange={(e) => onChange(e.target.value)}
					min={min}
					max={max}
					disabled={disabled}
					inputMode="numeric"
					style={{ width: width ?? 64 }}
				/>
			</label>
		</div>
	);
}
export function Button({
	onClick,
	children,
	disabled,
	className,
}: {
	children: ReactNode;
	onClick: (e: MouseEvent<HTMLButtonElement>) => void;
	disabled?: boolean;
	className?: string;
}) {
	return (
		<button
			type="button"
			className={`block px-4 py-1 rounded bg-blue-600 disabled:bg-gray-600 text-white ${className ?? ""}`}
			onClick={onClick}
			disabled={disabled}
		>
			{children}
		</button>
	);
}
export function Card({ children }: PropsWithChildren) {
	return <div className="border rounded-md p-4 max-min:p-2 shadow-md my-2 mx-0.5 box-border">{children}</div>;
}

const OpacDuration = 500;
const SlideDuration = 500;
const transitions = [
	`opacity ${OpacDuration}ms 0s`,
	`height ${SlideDuration}ms ${OpacDuration}ms`,
	`margin-bottom ${SlideDuration}ms ${OpacDuration}ms`,
	`border-width ${SlideDuration}ms ${OpacDuration}ms`,
].join(",");
const animationStyle = {
	transition: transitions,
	opacity: 0,
	height: 0,
	marginBottom: 0,
	borderWidth: 0,
} satisfies CSSProperties;
export function AnimatedErase({
	erased,
	children,
	height,
	className,
}: {
	children: ReactNode;
	erased: boolean;
	height: number;
	className?: string;
}) {
	const [fin, setFin] = useState(false);
	if (erased && fin) return null;
	return (
		<div
			className={className}
			style={erased ? animationStyle : { height }}
			onTransitionEnd={(e) => e.propertyName === "height" && setFin(true)}
		>
			{children}
		</div>
	);
}
