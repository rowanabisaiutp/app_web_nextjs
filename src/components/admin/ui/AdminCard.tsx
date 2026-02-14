import type { ReactNode } from "react";

const cardBase =
  "rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 overflow-hidden";
const headerBase =
  "px-5 py-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center gap-3 flex-wrap";
const headerTitle = "text-lg font-medium text-neutral-900 dark:text-white";
const headerSubtitle = "text-sm text-neutral-500 dark:text-neutral-400 mt-0.5";
const iconMuted = "h-5 w-5 text-neutral-500 dark:text-neutral-400 shrink-0";

type AdminCardProps = {
  children: ReactNode;
  title?: string;
  icon?: ReactNode;
  subtitle?: string;
  headerAction?: ReactNode;
  headerBetween?: boolean;
  className?: string;
};

export function AdminCard({
  children,
  title,
  icon,
  subtitle,
  headerAction,
  headerBetween = false,
  className = "",
}: AdminCardProps) {
  const hasHeader = title != null || icon != null || subtitle != null || headerAction != null;

  return (
    <section className={`${cardBase} ${className}`.trim()}>
      {hasHeader && (
        <div
          className={`${headerBase} ${headerBetween ? "justify-between" : ""}`}
          aria-hidden={!title}
        >
          <div className="flex items-center gap-3 flex-wrap">
            {icon != null && (
              <span className={iconMuted} aria-hidden>
                {icon}
              </span>
            )}
            {(title != null || subtitle != null) && (
              <div>
                {title != null && <h2 className={headerTitle}>{title}</h2>}
                {subtitle != null && subtitle !== "" && (
                  <p className={headerSubtitle}>{subtitle}</p>
                )}
              </div>
            )}
          </div>
          {headerAction != null && <div className="flex items-center">{headerAction}</div>}
        </div>
      )}
      {children}
    </section>
  );
}
