import type { MouseEvent, PropsWithChildren, ReactNode } from "react";

export function NumberInput({
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
		<div className="">
			<label className="flex gap-2 items-center">
				<div>{label}:</div>
				<input
					className="flex-0 border invalid:border-red-600 invalid:outline-red-600 min-w-16 focus:outline-2 outline-black"
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
	return <div className="border rounded-md p-4 shadow-md my-2 box-border">{children}</div>;
}
