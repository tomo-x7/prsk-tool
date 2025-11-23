import { createContext, type PropsWithChildren, useContext, useEffect, useState } from "react";

const TitleContext = createContext<[string, (s: string) => void]>(["", () => void 0]);
const DescContext = createContext<[string, (s: string) => void]>(["", () => void 0]);

export function useMeta() {
	return { title: useContext(TitleContext)[0], description: useContext(DescContext)[0] };
}

export function useSetTitle(title: string) {
	const set = useContext(TitleContext)[1];
	useEffect(() => {
		set(title);
	}, [title, set]);
}
export function useSetDescription(description: string) {
	const set = useContext(DescContext)[1];
	useEffect(() => {
		set(description);
	}, [description, set]);
}

export function MetaProvider({ children }: PropsWithChildren) {
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	useEffect(() => {
		document.title = title === "プロセカツール集" ? "プロセカツール集" : `${title} - プロセカツール集`;
	}, [title]);
	useEffect(() => {
		document.querySelector('meta[name="description"]')?.setAttribute("content", description);
	}, [description]);
	return (
		<TitleContext value={[title, setTitle]}>
			<DescContext value={[description, setDescription]}>{children}</DescContext>
		</TitleContext>
	);
}
