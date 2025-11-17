import { lazy, type ReactNode, Suspense } from "react";
import { createBrowserRouter, createRoutesFromChildren, Link, Outlet, Route, RouterProvider } from "react-router-dom";

const to = () => new Promise((resolve) => setTimeout(resolve, 0));
const PCalc = lazy(() => to().then(() => import("./p-calc/index.tsx")));

const router = createBrowserRouter(
	createRoutesFromChildren(
		<Route element={<Layout />}>
			<Route path="p-calc" element={s(<PCalc />)} />
			<Route index element={<Top />} />
			<Route path="*" element={"Not Found"} />
		</Route>,
	),
);

function Layout() {
	return (
		<div>
			<Outlet />
		</div>
	);
}

function s(r: ReactNode) {
	return <Suspense fallback={<div>Loading...</div>}>{r}</Suspense>;
}

function Top() {
	return (
		<div>
			トップページ
			<div>ベータ版なう</div>
			<Link to="/p-calc">ポ調ツール</Link>
		</div>
	);
}

export function App() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<RouterProvider router={router} />
		</Suspense>
	);
}
