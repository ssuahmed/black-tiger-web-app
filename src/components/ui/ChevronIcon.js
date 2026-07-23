import { cn } from "@/lib/cn";

/** @param {{ open?: boolean; className?: string }} props */
export default function ChevronIcon({ open = false, className = "" }) {
  return (
    <span
      className={cn(
      "block h-2.5 w-[1.125rem] shrink-0 bg-neutral-400 transition-transform duration-200 [-webkit-mask:url('/icons/chevron-down.png')_center/contain_no-repeat] [mask:url('/icons/chevron-down.png')_center/contain_no-repeat]",
        open && "rotate-180",
        className,
      )}
      aria-hidden
    />
  );
}
