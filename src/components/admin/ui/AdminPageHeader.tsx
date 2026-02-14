import type { ReactNode } from "react";

type AdminPageHeaderProps = {
  icon: ReactNode;
  title: string;
  description?: string;
};

export function AdminPageHeader({ icon, title, description }: AdminPageHeaderProps) {
  return (
    <header className="mb-8 flex items-center gap-3">
      <span className="text-neutral-500 dark:text-neutral-400 [&>svg]:h-8 [&>svg]:w-8" aria-hidden>
        {icon}
      </span>
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">{title}</h1>
        {description != null && description !== "" && (
          <p className="mt-1 text-neutral-500 dark:text-neutral-400">{description}</p>
        )}
      </div>
    </header>
  );
}
