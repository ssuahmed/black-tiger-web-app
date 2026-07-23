import { forwardRef } from "react";

/**
 * Full-bleed or fixed-ratio block with optional `backgroundImage`.
 *
 * **Children** render inside `.site-section__inner`, stacked above the background
 * (`z-index` in CSS). Style the wrapper with `innerClassName` or `innerProps`
 * (e.g. flex centering, padding).
 *
 * Below `lg`, non-flow sections keep aspect via padding; set `preserveAspectOnMobile={false}`
 * for blocks that should grow with content height.
 *
 * If `height` is omitted, empty, or `"auto"`, section height stays `auto` and the mobile
 * aspect padding hack is skipped (`site-section--auto-height`).
 */
const SiteSection = forwardRef(function SiteSection(
  {
    width = "100vw",
    height,
    backgroundImage,
    backgroundPosition = "center",
    backgroundSize = "cover",
    children,
    className = "",
    innerClassName = "",
    innerProps,
    preserveAspectOnMobile = true,
    style,
    ...rest
  },
  ref,
) {
  const bg =
    backgroundImage == null || backgroundImage === ""
      ? undefined
      : typeof backgroundImage === "string" && backgroundImage.startsWith("url(")
        ? backgroundImage
        : `url(${backgroundImage})`;

  const { className: innerPropsClassName, ...restInnerProps } = innerProps ?? {};

  const implicitAutoHeight = height == null || height === "" || height === "auto";

  const innerClass = ["site-section__inner", innerClassName, innerPropsClassName]
    .filter(Boolean)
    .join(" ")
    .trim();

  return (
    <section
      ref={ref}
      {...rest}
      className={`site-section ${preserveAspectOnMobile ? "" : "site-section--flow"} ${implicitAutoHeight ? "site-section--auto-height" : ""} ${className}`.trim()}
      style={{
      "--ss-w": width,
        ...(!implicitAutoHeight && { "--ss-h": height }),
        ...(bg && { backgroundImage: bg }),
        backgroundPosition,
        backgroundSize,
        backgroundRepeat: "no-repeat",
        ...style,
      }}
    >
      <div {...restInnerProps} className={innerClass}>
        {children}
      </div>
    </section>
  );
});

SiteSection.displayName = "SiteSection";

export default SiteSection;
