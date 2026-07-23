/** @param {{ title: string; description?: string; action?: import('react').ReactNode }} props */
export default function AccountPageHeader({ title, description, action }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="font-magistral m-0 text-2xl font-bold text-neutral-900">{title}</h1>
        {description ? <p className="mt-1 mb-0 text-sm text-neutral-600">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
