import { lazy, type ReactNode, Suspense } from "react";
import { FaBluesky, FaGithub } from "react-icons/fa6";
import { createBrowserRouter, createRoutesFromChildren, Link, Outlet, Route, RouterProvider } from "react-router-dom";
import { ScaleLoader } from "react-spinners";
import { MetaProvider, useMeta, useSetDescription, useSetTitle } from "./util.tsx";

const to = () => new Promise((resolve) => setTimeout(resolve, 3000));
const PCalcInner = lazy(() => import("./p-calc"));

function PCalc() {
	useSetTitle("ポイント調整ツールβ");
	useSetDescription("イベント編成のままでポイント調整が簡単にできるツール。");
	return (
		<Suspense fallback={<Loading />}>
			<PCalcInner />
		</Suspense>
	);
}

const router = createBrowserRouter(
	createRoutesFromChildren(
		<Route element={<Layout />}>
			<Route path="p-calc" Component={PCalc} />
			<Route index element={<Top />} />
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

function S({ e, t, d }: { e: ReactNode; t: string; d: string }) {
	useSetTitle(t);
	useSetDescription(d);
	return <>{e}</>;
}
function Loading() {
	return (
		<div>
			<ScaleLoader />
		</div>
	);
}
function Top() {
	useSetTitle("プロセカツール集");
	useSetDescription("プロセカ関係の便利なツールとか。今はポイント調整ツールがあるよ。");
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
			<RouterProvider router={router} />
		</MetaProvider>
	);
}
