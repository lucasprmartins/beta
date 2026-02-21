import { Link } from "@tanstack/react-router";
import { HeaderLogo } from "@/components/header-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/features/auth";
import { menuItems } from "@/lib/navigation";

export function Header({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <nav className="sticky top-0 z-30 h-15 border-base-300 border-b bg-base-100">
        <div className="relative flex h-full items-center px-4">
          <HeaderLogo />

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

          <div className="ml-auto flex items-center gap-4">
            <ThemeToggle />
            <UserMenu />
          </div>
        </div>
      </nav>

      <main className="flex-1">{children}</main>
    </div>
  );
}
