import { lazy, type ReactNode, Suspense } from "react";
import { FaBluesky, FaGithub } from "react-icons/fa6";
import { createBrowserRouter, createRoutesFromChildren, Link, Outlet, Route, RouterProvider } from "react-router-dom";
import { TitleProvider, useSetTitle, useTitle } from "./util.tsx";

const to = () => new Promise((resolve) => setTimeout(resolve, 0));
const PCalc = lazy(() => to().then(() => import("./p-calc/index.tsx")));

const router = createBrowserRouter(
	createRoutesFromChildren(
		<Route element={<Layout />}>
			<Route path="p-calc" element={<S e={<PCalc />} t="ポイント調整ツールβ" />} />
			<Route index element={<Top />} />
			<Route path="*" element={"Not Found"} />
		</Route>,
	),
);

function Layout() {
	const title = useTitle();
	return (
		<div>
			<header className="h-10 w-full flex flex-row justify-between">
				<div></div>
				<div>{title}</div>
				<div className="flex flex-row">
					<a href="https://github.com/tomo-x7/prsk-tool" target="_blank" rel="noopener noreferrer">
						<FaGithub />
					</a>
					<a
						href="https://bsky.app/profile/did:plc:qcwvyds5tixmcwkwrg3hxgxd"
						target="_blank"
						rel="noopener noreferrer"
					>
						<FaBluesky />
					</a>
				</div>
			</header>
			<div>
				<Outlet />
			</div>
		</div>
	);
}

function S({ e, t }: { e: ReactNode; t: string }) {
	useSetTitle(t);
	return <Suspense fallback={<Loading />}>{e}</Suspense>;
}
function Loading() {
	// useSetTitle("");
	return <div>Loading...</div>;
}
function Top() {
	useSetTitle("プロセカツール集");
	return (
		<div>
			<div>ベータ版なう</div>
			<Link to="/p-calc">ポイント調整ツール</Link>
		</div>
	);
}

export function App() {
	return (
		<TitleProvider>
			<Suspense fallback={<div>Loading...</div>}>
				<RouterProvider router={router} />
			</Suspense>
		</TitleProvider>
	);
}
