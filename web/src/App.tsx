import { lazy, type ReactNode, Suspense } from "react";
import { FaBluesky, FaGithub } from "react-icons/fa6";
import { createBrowserRouter, createRoutesFromChildren, Link, Outlet, Route, RouterProvider } from "react-router-dom";
import { MetaProvider, useSetTitle, useMeta, useSetDescription } from "./util.tsx";
import { ScaleLoader } from "react-spinners";

const to = () => new Promise((resolve) => setTimeout(resolve, 3000));
const PCalc = lazy(
	// () => to().then
	(() => import("./p-calc/index.tsx")));

const router = createBrowserRouter(
	createRoutesFromChildren(
		<Route element={<Layout />}>
			<Route
				path="p-calc"
				element={
					<S
						e={<PCalc />}
						t="ポイント調整ツールβ"
						d="イベント編成のままでポイント調整が簡単にできるツール。"
					/>
				}
			/>
			<Route
				index
				element={
					<S
						e={<Top />}
						t="プロセカツール集"
						d="プロセカ関係の便利なツールとか。今はポイント調整ツールがあるよ。"
					/>
				}
			/>
			<Route path="*" element={"Not Found"} />
		</Route>,
	),
);

function Layout() {
	const { title } = useMeta();
	return (
		<div>
			<header className="h-10 w-full flex flex-row justify-between">
				<div></div>
				<div>{title}</div>
				<div className="flex flex-row">
					<a href="https://github.com/tomo-x7/prsk-tool" target="_blank" rel="noopener noreferrer">
						<FaGithub size={26} />
					</a>
				</div>
			</header>
			<div>
				<Suspense fallback={"Layout suspense"}>
					<Outlet />
				</Suspense>
			</div>
		</div>
	);
}

function S({ e, t, d }: { e: ReactNode; t: string; d: string }) {
	useSetTitle(t);
	useSetDescription(d);
	return <Suspense fallback={<Loading />}>{e}</Suspense>;
}
function Loading() {
	return <div><ScaleLoader /></div>;
}
function Top() {
	return (
		<div>
			<div>
				<h2>
					<Link className="text-blue-600 underline" to="/p-calc">
						ポイント調整ツールβ
					</Link>
				</h2>
				<p>イベント編成のままでポイント調整が簡単にできるツール。</p>
			</div>
		</div>
	);
}

export function App() {
	return (
		<MetaProvider>
			<Suspense fallback={"App suspense"}>
				<RouterProvider router={router} />
			</Suspense>
		</MetaProvider>
	);
}
