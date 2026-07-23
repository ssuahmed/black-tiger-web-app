import ContactForm from "@/components/contact/ContactForm";
import { blockImage, blockText } from "@/lib/content/blocks";

/** Contact Us — content from Odoo CMS via Commerce API */
export default function ContactPageContent({ blocks }) {
  const heroTitle = blockText(blocks, "hero.title", "CONTACT US");
  const heroBg = blockImage(blocks, "hero.background_image", "/images/home/section-1.png");
  const formHeading = blockText(blocks, "form.heading", "CONTACT BLACK TIGER");

  return (
    <div className="contact-page">
      <section
        className="contact-hero"
        style={{ backgroundImage: `url('${heroBg}')` }}
        aria-label="Contact us"
      >
        <h1 className="contact-hero__title">{heroTitle}</h1>
      </section>

      <div className="contact-page__main">
        <div className="contact-form-card">
          <h2 className="contact-form-card__heading">{formHeading}</h2>
          <hr className="contact-form-card__rule" />
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
