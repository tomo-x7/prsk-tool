import { useState } from "react";
import { FaGithub } from "react-icons/fa6";
import { GiHamburgerMenu } from "react-icons/gi";
import LibDrawer from "react-modern-drawer";
import { Link, Outlet, useMatch } from "react-router-dom";
import { useMeta } from "./util";
import "react-modern-drawer/dist/index.css";

export function Layout() {
	const { title } = useMeta();

	return (
		<div className="">
			<div className="max-md:hidden fixed top-0 bottom-0 w-48 border-r border-gray-400">
				<SideMenu />
			</div>
			<header
				style={{ width: "calc(100dvw - 192px)" }}
				className="h-10 max-md:w-dvw! flex flex-row justify-between items-center px-2 fixed top-0 right-0 max-md:left-0 bg-white z-10 border-b border-gray-400"
			>
				<div>
					<div className="md:hidden">
						<Drawer />
					</div>
				</div>
				<div className="text-xl">{title}</div>
				<div className="flex flex-row">
					<a href="https://github.com/tomo-x7/prsk-tool" target="_blank" rel="noopener noreferrer">
						<FaGithub size={26} />
					</a>
				</div>
			</header>
			<div className="grow flex flex-col items-center md:ml-48 mt-10">
				<div className="min-w-[350px] max-w-[600px] m-2">
					<Outlet />
				</div>
			</div>
		</div>
	);
}
function Drawer() {
	const [isOpen, setIsOpen] = useState(false);
	return (
		<>
			<div className="grid self-center">
				<button type="button" onClick={() => setIsOpen(true)}>
					<GiHamburgerMenu size={30} />
				</button>
			</div>
			<LibDrawer open={isOpen} onClose={() => setIsOpen(false)} direction="left">
				<SideMenu close={() => setIsOpen(false)} />
			</LibDrawer>
		</>
	);
}
function SideMenu({ close }: { close?: () => void }) {
	return (
		<div className="flex flex-col justify-between h-full px-1 py-2">
			<div>
				<SideMenuItem name="トップ" href="/" close={close} />
				<SideMenuItem name="ポイント調整ツール" href="/p-calc" close={close} />
			</div>
			<div className="text-sm">
				<div className="mb-2">
					<a
						className="underline text-blue-600"
						href="https://github.com/tomo-x7/prsk-tool"
						target="_blank"
						rel="noopener noreferrer"
					>
						GitHub Repository
					</a>
				</div>
				<div>
					Developed by{" "}
					<a
						href="https://bsky.app/profile/did:plc:qcwvyds5tixmcwkwrg3hxgxd"
						target="_blank"
						rel="noopener noreferrer"
						className="underline text-blue-600"
					>
						@tomo-x
					</a>
				</div>
				<div className="flex flex-col mt-1">
					<div>Special thanks</div>
					<a
						href="https://bsky.app/profile/did:plc:b7wn6q7j5jxd2n4uvsvlqywn"
						target="_blank"
						rel="noopener noreferrer"
						className="underline text-blue-600"
					>
						@taskna.bsky.social
					</a>
				</div>
			</div>
		</div>
	);
}
function SideMenuItem({ name, href, close }: { name: string; href: string; close?: () => void }) {
	const match = useMatch(href);
	if (match) return <div className="font-bold">{name}</div>;
	return (
		<Link to={href} className="underline text-blue-600" onClick={close}>
			{name}
		</Link>
	);
}
