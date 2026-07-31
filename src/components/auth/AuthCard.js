import BrandLogo from "@/components/ui/BrandLogo";

export default function AuthCard({ title, subtitle, children, footer }) {
  return (
    <div className="auth-shell">
      <div className="auth-shell__inner">
        <BrandLogo variant="auth" className="auth-shell__logo" priority />
        {title ? <h1 className="auth-shell__title">{title}</h1> : null}
        {subtitle ? <p className="auth-shell__subtitle">{subtitle}</p> : null}
        <div className="auth-shell__body">{children}</div>
        {footer ? <div className="auth-shell__footer">{footer}</div> : null}
      </div>
    </div>
  );
}
