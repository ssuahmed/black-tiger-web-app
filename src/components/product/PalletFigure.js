import Image from "next/image";

/**
 * Box / pallet illustrations used beside the bulk pricing tables.
 * @param {{ variant?: 'boxes' | 'pallet' }} props
 */
export default function PalletFigure({ variant = "boxes" }) {
  if (variant === "pallet") {
    return (
      <Image
        src="/images/full-pallet.png"
        alt=""
        width={160}
        height={183}
        className="pdp-table__figure-img pdp-table__figure-img--full"
        aria-hidden
        unoptimized
      />
    );
  }

  return (
    <Image
      src="/images/partial-pallet.png"
      alt=""
      width={292}
      height={134}
      className="pdp-table__figure-img pdp-table__figure-img--partial"
      aria-hidden
      unoptimized
    />
  );
}
