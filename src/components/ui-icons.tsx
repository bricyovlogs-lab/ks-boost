import { ReactNode } from "react";

export function StatIcon({ children }: { children: ReactNode }) {
  return <span className="stat-icon-svg">{children}</span>;
}
function BaseSvg({ children }: { children: ReactNode }) {
  return <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">{children}</svg>;
}
export const HomeIcon = () => <BaseSvg><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.8V21h14V9.8" /></BaseSvg>;
export const UsersIcon = () => <BaseSvg><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></BaseSvg>;
export const KeyIcon = () => <BaseSvg><circle cx="7.5" cy="15.5" r="5.5" /><path d="m21 2-9.6 9.6" /><path d="M15 5h4v4" /><path d="M17 7 20 10" /></BaseSvg>;
export const CardIcon = () => <BaseSvg><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></BaseSvg>;
export const TicketIcon = () => <BaseSvg><path d="M3 9a3 3 0 1 0 0 6v3h18v-3a3 3 0 1 0 0-6V6H3v3Z" /><path d="M13 6v12" /></BaseSvg>;
export const ChartIcon = () => <BaseSvg><path d="M3 3v18h18" /><path d="m7 14 4-4 3 3 5-7" /></BaseSvg>;
export const BoltIcon = () => <BaseSvg><path d="M13 2 4 14h7l-1 8 10-14h-7l0-6Z" /></BaseSvg>;
export const MoneyIcon = () => <BaseSvg><path d="M12 1v22" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7H14.5a3.5 3.5 0 0 1 0 7H6" /></BaseSvg>;
export const SearchIcon = () => <BaseSvg><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></BaseSvg>;
