import { cn } from "@/lib/cn";

/** @param {{ children: import('react').ReactNode; className?: string; as?: 'h1' | 'h2' }} props */
export default function PageTitle({ children, className = "", as: Tag = "h1" }) {
  return (
    <Tag
      className={cn(
        "font-magistral font-bold tracking-wide",
        Tag === "h1" ? "text-2xl md:text-3xl" : "text-xl md:text-2xl",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
