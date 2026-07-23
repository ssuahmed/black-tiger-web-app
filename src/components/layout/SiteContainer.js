/**
 * Horizontally padded content block: same inset as the site header (`--page-gutter-x`
 * + safe-area), capped at 1920px and centered.
 */
export default function SiteContainer({ children, className = "", ...rest }) {
  return (
    <div className={`site-container ${className}`.trim()} {...rest}>
      {children}
    </div>
  );
}
