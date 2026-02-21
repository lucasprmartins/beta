import {
  CubeIcon,
  MoonIcon,
  SidebarSimpleIcon,
  SunIcon,
} from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { UserMenu } from "@/features/auth";
import { menuItems } from "@/lib/navigation";

const DRAWER_ID = "app-sidebar";

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
          <div className="ml-auto flex items-center gap-1">
            <label className="swap swap-rotate btn btn-ghost btn-circle">
              <input
                className="theme-controller"
                type="checkbox"
                value="dark"
              />
              <SunIcon className="swap-off h-5 w-5" weight="bold" />
              <MoonIcon className="swap-on h-5 w-5" weight="bold" />
            </label>
            <UserMenu />
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
          <div className="flex h-15 items-center justify-center gap-2">
            <CubeIcon className="h-6 w-6 text-base-content" weight="fill" />
            <span className="is-drawer-close:hidden font-bold text-base-content text-lg">
              Beta
            </span>
          </div>

          <ul className="menu w-full grow gap-1">
            {menuItems.map((item) => (
              <li key={item.to}>
                <Link
                  activeProps={{
                    className:
                      "!bg-primary/20 !text-primary font-bold hover:!bg-primary/10 hover:!text-secondary",
                  }}
                  className="hover:!bg-base-content/5 is-drawer-close:tooltip is-drawer-close:tooltip-right text-secondary hover:text-base-content"
                  data-tip={item.label}
                  to={item.to}
                >
                  {({ isActive }) => (
                    <>
                      <item.icon
                        className="h-5 w-5 shrink-0"
                        weight={isActive ? "fill" : "bold"}
                      />
                      <span className="is-drawer-close:hidden">
                        {item.label}
                      </span>
                    </>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
