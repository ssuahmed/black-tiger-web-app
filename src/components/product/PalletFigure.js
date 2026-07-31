/**
 * Line-art box / pallet illustrations used beside the bulk pricing tables.
 * @param {{ variant?: 'boxes' | 'pallet' }} props
 */
export default function PalletFigure({ variant = "boxes" }) {
  return variant === "pallet" ? <FullPallet /> : <BoxAndPallet />;
}

function BoxAndPallet() {
  return (
    <svg viewBox="0 0 220 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <g stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round">
        <Box x={8} y={44} w={54} h={44} d={16} />
        <Box x={112} y={30} w={48} h={38} d={14} />
        <Box x={112} y={70} w={48} h={30} d={14} />
        <path d="M104 100h96l14-12h-96z" />
        <path d="M104 100v8h96v-8" />
        <path d="M200 100l14-12v8l-14 12v-8z" />
      </g>
    </svg>
  );
}

function FullPallet() {
  const layers = [0, 1, 2, 3];
  return (
    <svg viewBox="0 0 180 190" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <g stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round">
        {layers.map((i) => (
          <Box key={i} x={18} y={12 + i * 36} w={104} h={34} d={26} />
        ))}
        <path d="M10 158h116l26-22H36z" />
        <path d="M10 158v12h116v-12" />
        <path d="M126 158l26-22v12l-26 22v-12z" />
      </g>
    </svg>
  );
}

/** Simple isometric box: front face + top and side faces offset by `d`. */
function Box({ x, y, w, h, d }) {
  return (
    <>
      <rect x={x} y={y + d} width={w} height={h} />
      <path d={`M${x} ${y + d}L${x + d} ${y}h${w}l${-d} ${d}z`} />
      <path d={`M${x + w} ${y + d}l${d} ${-d}v${h}l${-d} ${d}z`} />
      <path d={`M${x + w * 0.45} ${y + d + h * 0.3}h${w * 0.1}`} />
    </>
  );
}
