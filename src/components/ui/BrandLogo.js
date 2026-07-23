import Image from "next/image";

export default function BrandLogo({ className = "", variant = "header", priority = false }) {
  const variantClass = variant === "hero" ? "brand-logo brand-logo--lg" : "brand-logo";

  return (
    <Image
      src="/logo.png"
      alt="Black Tiger"
      width={320}
      height={76}
      priority={priority}
      className={[variantClass, className].filter(Boolean).join(" ")}
    />
  );
}
