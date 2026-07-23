import Spinner from "./Spinner";

/** @param {{ className?: string; label?: string }} props */
export default function LoadingCenter({ className = "", label }) {
  return (
    <div className={["flex justify-center py-24", className].filter(Boolean).join(" ")}>
      <Spinner label={label} />
    </div>
  );
}
