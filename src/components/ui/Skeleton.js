export default function Skeleton({ className = "", style, ...rest }) {
  return <div className={["skeleton", className].filter(Boolean).join(" ")} style={style} {...rest} />;
}
