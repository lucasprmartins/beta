import type { Icon } from "@phosphor-icons/react";
import { HouseIcon } from "@phosphor-icons/react";

export interface MenuItem {
  label: string;
  icon: Icon;
  to: string;
}

export const menuItems: MenuItem[] = [
  { label: "Dashboard", icon: HouseIcon, to: "/dashboard" },
];

export const NAV_ACTIVE_CLASS =
  "!bg-primary/20 !text-primary font-bold hover:!bg-primary/10 hover:!text-secondary";
