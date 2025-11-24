import { lazy, Suspense } from "react";
import { createBrowserRouter, createRoutesFromChildren, Link, Route, RouterProvider } from "react-router-dom";
import { ScaleLoader } from "react-spinners";
import { MetaProvider, useSetDescription, useSetTitle } from "./util.tsx";
import "react-modern-drawer/dist/index.css";
import { Layout } from "./Layout.tsx";

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
function Loading() {
	return (
		<div>
			<ScaleLoader />
		</div>
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
