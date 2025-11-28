import { createContext, useContext, useEffect, useState } from "react";

const DisplayMinContext = createContext(false);

export function useDisplayMin() {
	return useContext(DisplayMinContext);
}

export function DisplaySizeProvider({ children }: { children: React.ReactNode }) {
	const [isSm, setIsSm] = useState(false);
	useEffect(() => {
		const mq = window.matchMedia("(max-width: 400px");
		const listener = (ev: MediaQueryListEvent) => setIsSm(ev.matches);
		setIsSm(mq.matches);
		mq.addEventListener("change", listener);
		return () => mq.removeEventListener("change", listener);
	}, []);
	return <DisplayMinContext value={isSm}>{children}</DisplayMinContext>;
}
