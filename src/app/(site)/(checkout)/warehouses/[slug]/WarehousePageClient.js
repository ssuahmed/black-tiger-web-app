"use client";

import { getWarehouseBySlug } from "@/data/warehouses";

/** @param {{ slug: string }} props */
export default function WarehousePageClient({ slug }) {
  const warehouse = getWarehouseBySlug(slug);
  if (!warehouse) return null;

  const address = warehouse.formattedAddress;
  const mapsQuery =
    Number.isFinite(warehouse.latitude) && Number.isFinite(warehouse.longitude)
      ? `${warehouse.latitude},${warehouse.longitude}`
      : address;
  const mapEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(mapsQuery)}&z=15&output=embed`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address || mapsQuery)}`;

  return (
    <div className="warehouse-page font-sf-pro">
      <div className="warehouse-page__grid">
        <div className="warehouse-page__info">
          <h1 className="warehouse-page__title">{warehouse.name}</h1>
          <address className="warehouse-page__address">
            {warehouse.addressLines.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </address>
          <p className="warehouse-page__phone">
            <a href={warehouse.phoneHref}>{warehouse.phone}</a>
          </p>
          <a
            className="btn btn-primary warehouse-page__directions"
            href={directionsUrl}
            target="_blank"
            rel="noreferrer"
          >
            Get Directions
          </a>

          <section className="warehouse-page__hours" aria-labelledby="warehouse-hours-heading">
            <h2 id="warehouse-hours-heading" className="warehouse-page__hours-title">
              Branch Hours
            </h2>
            <table className="warehouse-page__hours-table">
              <thead>
                <tr>
                  <th scope="col">Day</th>
                  <th scope="col">Hours</th>
                </tr>
              </thead>
              <tbody>
                {warehouse.hours.map((row) => (
                  <tr key={row.day}>
                    <td>{row.day}</td>
                    <td>{row.hours}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>

        <aside className="warehouse-page__map">
          <iframe
            title={`${warehouse.name} map`}
            src={mapEmbedUrl}
            className="warehouse-page__map-frame"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </aside>
      </div>
    </div>
  );
}
