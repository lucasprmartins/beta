import { CubeIcon, MoonIcon, SunIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { UserMenu } from "@/features/auth";
import { menuItems } from "@/lib/navigation";

export function Header({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <nav className="sticky top-0 z-30 h-15 border-base-300 border-b bg-base-100">
        <div className="relative flex h-full items-center px-4">
          <div className="flex items-center gap-2">
            <CubeIcon className="h-6 w-6 text-base-content" weight="fill" />
            <span className="font-bold text-base-content text-lg">Beta</span>
          </div>

          <ul className="menu menu-horizontal absolute left-1/2 -translate-x-1/2 gap-1 p-0">
            {menuItems.map((item) => (
              <li key={item.to}>
                <Link
                  activeProps={{
                    className:
                      "!bg-primary/20 !text-primary font-bold hover:!bg-primary/10 hover:!text-secondary",
                  }}
                  className="hover:!bg-base-content/5 text-secondary hover:text-base-content"
                  to={item.to}
                >
                  {({ isActive }) => (
                    <>
                      <item.icon
                        className="h-4 w-4 shrink-0"
                        weight={isActive ? "fill" : "bold"}
                      />
                      {item.label}
                    </>
                  )}
                </Link>
              </li>
            ))}
          </ul>

          <div className="ml-auto flex items-center gap-1">
            <label className="btn btn-ghost btn-circle swap swap-rotate">
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
        </div>
      </nav>

      <main className="flex-1">{children}</main>
    </div>
  );
}
