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
		<div>
			<label>
				{label}:
				<input
					className="border invalid:border-red-600"
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
			className={`bg-blue-600 disabled:bg-gray-600 text-white ${className ?? ""}`}
			onClick={onClick}
			disabled={disabled}
		>
			{children}
		</button>
	);
}
export function Card({ children }: PropsWithChildren) {
	return <div className="border rounded-md p-4 shadow-md my-2">{children}</div>;
}
