/** Homepage section 6 — full-width brand banner (Figma section-6) */
export default function HomeSection6({ imageUrl = "/images/home/section-6.png" }) {
  return (
    <section
      className="home-section-6"
      style={{ backgroundImage: `url('${imageUrl}')` }}
      aria-label="Brand banner"
    />
  );
}
