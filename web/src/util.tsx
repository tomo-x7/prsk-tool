import { createContext, type PropsWithChildren, useContext, useEffect, useState } from "react";

const Context = createContext<[string, (s: string) => void]>(["", () => void 0]);

export function useTitle(): string {
	return useContext(Context)[0];
}

export function useSetTitle(title: string) {
	const set = useContext(Context)[1];
	useEffect(() => {
		set(title);
	}, [title, set]);
}

export function TitleProvider({ children }: PropsWithChildren) {
	const [title, setTitle] = useState("");
	useEffect(() => {
		document.title = title === "プロセカツール集" ? "プロセカツール集" : `${title} - プロセカツール集`;
		console.log("Title set to", document.title);
	}, [title]);
	return <Context.Provider value={[title, setTitle]}>{children}</Context.Provider>;
}
