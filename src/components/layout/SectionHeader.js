import Link from "next/link";
import { cn } from "@/lib/cn";

/**
 * @param {{ title: string; action?: { label: string; href: string }; className?: string; titleClassName?: string }} props
 */
export default function SectionHeader({ title, action, className = "", titleClassName = "" }) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-4", className)}>
      <h2 className={cn("font-magistral text-xl font-bold tracking-wide md:text-2xl", titleClassName)}>{title}</h2>
      {action ? (
        <Link href={action.href} className="text-sm font-semibold text-primary hover:underline">
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}
