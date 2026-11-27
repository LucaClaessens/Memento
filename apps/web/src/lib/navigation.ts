export type TabIcon = "pen" | "notebook";

export interface NavigationTab {
  href: string;
  label: string;
  icon: TabIcon;
}

/** Primary destinations in display order. Add tabs here as features land. */
export const tabs: readonly NavigationTab[] = [
  { href: "/", label: "Write", icon: "pen" },
  { href: "/thoughts", label: "Thoughts", icon: "notebook" },
];

/** A non-root tab is active on its own route and any nested route. */
export function isTabActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** True when the on-screen keyboard has taken a meaningful share of the viewport. */
export function isKeyboardOpen(
  windowHeight: number,
  viewportHeight: number
): boolean {
  const shrink = windowHeight - viewportHeight;
  return shrink > 120 && viewportHeight < windowHeight * 0.8;
}
