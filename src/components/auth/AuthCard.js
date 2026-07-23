import BrandLogo from "@/components/ui/BrandLogo";
import SiteContainer from "@/components/layout/SiteContainer";

export default function AuthCard({ title, subtitle, children, footer }) {
  return (
    <div className="box-border min-h-screen-stretch bg-white py-10 md:py-16">
      <SiteContainer>
        <div className="mx-auto flex max-w-md flex-col items-center">
          <BrandLogo variant="auth" className="mb-8" />
          {title ? (
            <h1 className="font-magistral text-2xl font-bold tracking-wide text-zinc-900 md:text-3xl">{title}</h1>
          ) : null}
          {subtitle ? <p className="mt-2 text-center text-sm text-zinc-500">{subtitle}</p> : null}
          <div className="mt-8 w-full">{children}</div>
          {footer ? <div className="mt-8 w-full text-center text-sm text-zinc-500">{footer}</div> : null}
        </div>
      </SiteContainer>
    </div>
  );
}
