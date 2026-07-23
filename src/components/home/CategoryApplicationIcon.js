const GLYPHS = {
  petrol: PetrolGlyph,
  diesel: DieselGlyph,
  gear: GearGlyph,
  cvt: CvtGlyph,
  coolant: CoolantGlyph,
  brake: BrakeGlyph,
  grease: GreaseGlyph,
  hybrid: HybridGlyph,
  hydraulic: HydraulicGlyph,
  axle: AxleGlyph,
  fluid: FluidGlyph,
"two-stroke": TwoStrokeGlyph,
  fork: ForkGlyph,
  chain: ChainGlyph,
  compressor: CompressorGlyph,
  turbine: TurbineGlyph,
  circulating: CirculatingGlyph,
  heat: HeatGlyph,
  cutting: CuttingGlyph,
  forming: FormingGlyph,
  rust: RustGlyph,
  quenching: QuenchingGlyph,
  grinding: GrindingGlyph,
  drill: DrillGlyph,
  pipeline: PipelineGlyph,
};

/** @param {{ name: string; className?: string }} props */
export default function CategoryApplicationIcon({ name, className = "" }) {
  const Glyph = GLYPHS[name] ?? GearGlyph;
  return <Glyph className={["block h-full w-full", className].filter(Boolean).join(" ")} aria-hidden />;
}

function PetrolGlyph({ className }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="14" width="28" height="20" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M16 14V10h16v4M20 24h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function DieselGlyph({ className }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M12 32h24M14 32l2-14h16l2 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="18" cy="34" r="2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="30" cy="34" r="2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function GearGlyph({ className }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="6" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M24 12v4M24 32v4M12 24h4M32 24h4M15.5 15.5l2.8 2.8M29.7 29.7l2.8 2.8M32.5 15.5l-2.8 2.8M18.3 29.7l-2.8 2.8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CvtGlyph({ className }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="16" cy="24" rx="6" ry="10" stroke="currentColor" strokeWidth="1.5" />
      <ellipse cx="32" cy="24" rx="6" ry="10" stroke="currentColor" strokeWidth="1.5" />
      <path d="M22 24h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function CoolantGlyph({ className }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M24 10v20M18 16l6-6 6 6M18 34l6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BrakeGlyph({ className }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="12" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="24" cy="24" r="4" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function GreaseGlyph({ className }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M18 14h12l-2 22H20L18 14z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M20 20h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function HybridGlyph({ className }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M14 28h8l4-8h12v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 32h28" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M32 20v-4h6v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function HydraulicGlyph({ className }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect x="14" y="12" width="20" height="24" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M20 20h8M20 26h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function AxleGlyph({ className }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M10 24h28M16 24v-6M32 24v-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="16" cy="30" r="3" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="32" cy="30" r="3" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function FluidGlyph({ className }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M24 10c0 8-10 12-10 20a10 10 0 0 0 20 0c0-8-10-12-10-20z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function TwoStrokeGlyph({ className }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="10" stroke="currentColor" strokeWidth="1.5" />
      <path d="M24 14v10l6 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function ForkGlyph({ className }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M18 10v28M30 10v28M18 18h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function ChainGlyph({ className }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect x="12" y="18" width="10" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <rect x="26" y="18" width="10" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M22 24h4" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function CompressorGlyph({ className }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect x="12" y="16" width="24" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M18 24h12M30 20v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function TurbineGlyph({ className }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="4" stroke="currentColor" strokeWidth="1.5" />
      <path d="M24 12v6M24 30v6M12 24h6M30 24h6M16 16l4 4M28 28l4 4M32 16l-4 4M20 28l-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function CirculatingGlyph({ className }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M30 18a10 10 0 1 0 0 12M18 30a10 10 0 1 0 0-12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function HeatGlyph({ className }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M24 38c-6-4-4-10-2-14 2-4 2-8 0-12 2 4 2 8 0 12 2 4 4 10-2 14z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function CuttingGlyph({ className }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="10" stroke="currentColor" strokeWidth="1.5" />
      <path d="M24 14v20M14 24h20" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function FormingGlyph({ className }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M14 32h20M16 32l4-16h8l4 16" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function RustGlyph({ className }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M14 30h20M16 30l6-18h4l6 18" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function QuenchingGlyph({ className }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M20 14h8v8h-8zM16 30h16l-2 6H18l-2-6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function GrindingGlyph({ className }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="22" r="8" stroke="currentColor" strokeWidth="1.5" />
      <path d="M18 36h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function DrillGlyph({ className }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M24 10v22M20 32l4 6 4-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18 18h12l-2 6h-8l-2-6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function PipelineGlyph({ className }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M10 24h28M34 20v8M14 20v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
