export default function EmptyState({
  icon,
  title,
  description,
  action,
  className = "",
}) {
  return (
    <div className={["empty-state", className].filter(Boolean).join(" ")}>
      {icon ? <div className="empty-state__icon">{icon}</div> : null}
      {title ? <h2 className="font-magistral empty-state__title ">{title}</h2> : null}
      {description ? <p className="empty-state__description">{description}</p> : null}
      {action ? <div className="empty-state__action">{action}</div> : null}
    </div>
  );
}