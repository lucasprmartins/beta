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
