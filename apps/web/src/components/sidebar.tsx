import type { Icon } from "@phosphor-icons/react";
import {
  CubeIcon,
  HouseIcon,
  MoonIcon,
  SidebarSimpleIcon,
  SunIcon,
} from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { SignOutButton } from "@/features/auth";

interface MenuItem {
  label: string;
  icon: Icon;
  to: string;
}

const DRAWER_ID = "app-sidebar";

const menuItems: MenuItem[] = [
  { label: "Dashboard", icon: HouseIcon, to: "/dashboard" },
];

export function Sidebar({ children }: { children: React.ReactNode }) {
  return (
    <div className="drawer lg:drawer-open">
      <input className="drawer-toggle" id={DRAWER_ID} type="checkbox" />

      <div className="drawer-content flex min-h-screen flex-col">
        <nav className="sticky top-0 z-30 flex h-15 items-center border-base-300 border-b bg-base-100 px-4">
          <label
            aria-label="toggle sidebar"
            className="btn btn-square btn-ghost"
            htmlFor={DRAWER_ID}
          >
            <SidebarSimpleIcon className="h-5 w-5" weight="bold" />
          </label>
          <div className="ml-auto flex items-center gap-2">
            <label className="swap swap-rotate">
              <input
                className="theme-controller"
                type="checkbox"
                value="dark"
              />
              <SunIcon className="swap-off h-5 w-5" weight="bold" />
              <MoonIcon className="swap-on h-5 w-5" weight="bold" />
            </label>
            <SignOutButton />
          </div>
        </nav>

        <main className="flex-1">{children}</main>
      </div>

      <div className="drawer-side z-40 is-drawer-close:overflow-visible">
        <label
          aria-label="close sidebar"
          className="drawer-overlay"
          htmlFor={DRAWER_ID}
        />

        <div className="flex min-h-full is-drawer-close:w-15 is-drawer-open:w-64 flex-col bg-base-200">
          <div className="flex h-15 items-center justify-center">
            <CubeIcon
              className="is-drawer-open:hidden h-6 w-6 text-base-content"
              weight="bold"
            />
            <span className="is-drawer-close:hidden font-bold text-base-content text-lg">
              Beta
            </span>
          </div>

          <ul className="menu w-full grow gap-1">
            {menuItems.map((item) => (
              <li key={item.to}>
                <Link
                  activeProps={{ className: "menu-active" }}
                  className="is-drawer-close:tooltip is-drawer-close:tooltip-right"
                  data-tip={item.label}
                  to={item.to}
                >
                  <item.icon className="h-5 w-5 shrink-0" weight="bold" />
                  <span className="is-drawer-close:hidden">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
