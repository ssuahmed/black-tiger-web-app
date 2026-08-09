/** @param {{ title: string; description?: string; action?: import('react').ReactNode; filters?: import('react').ReactNode }} props */
export default function AccountPageHeader({ title, description, action, filters }) {
  return (
    <div className="acc-page-header">
      <div className="acc-page-header__copy">
        <h1 className="acc-page-header__title font-sf-pro">{title}</h1>
        {description ? <p className="acc-page-header__desc">{description}</p> : null}
      </div>
      {filters || action ? (
        <div className="acc-page-header__tools">
          {filters ? <div className="acc-page-header__filters">{filters}</div> : null}
          {action ? <div className="acc-page-header__action">{action}</div> : null}
        </div>
      ) : null}
    </div>
  );
}
