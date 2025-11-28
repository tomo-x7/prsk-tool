import { lazy, Suspense } from "react";
import { createBrowserRouter, createRoutesFromChildren, Link, Route, RouterProvider } from "react-router-dom";
import { ScaleLoader } from "react-spinners";
import { Layout } from "./Layout.tsx";
import { MetaProvider, useSetDescription, useSetTitle } from "./util.tsx";

import "react-modern-drawer/dist/index.css";

const PCalcInner = lazy(() => import("./p-calc"));

function PCalc() {
	useSetTitle("プロセカポイント調整ツールβ");
	useSetDescription(
		"ポイント調整が最も簡単にできるツール。イベント編成がそのまま使えます。編成と目標ポイントを入力するだけで、ポイント調整の手順が自動生成されます。",
	);
	return (
		<Suspense fallback={<Loading />}>
			<PCalcInner />
		</Suspense>
	);
}
function Loading() {
	return (
		<div className="w-full flex justify-center">
			<ScaleLoader width={12} height={105} margin={6} />
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
	useSetDescription("プロセカ関係の便利なツールとか");
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
