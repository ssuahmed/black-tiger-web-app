/** Static pickup warehouses shown on `/warehouses/[slug]`. */
export const WAREHOUSES = [
  {
    slug: "bt-warehouse-01-riyadh",
    name: "BT Warehouse #01",
    siteName: "BlackTiger Riyadh Warehouse",
    contactName: "Mohammed Alyemni",
    address:
      "3463 Old Al-Kharj Road, Hyt Unit, Riyadh, 14371 - 6749 Kingdom of Saudi Arabia",
    addressLines: [
      "3463 Old Al-Kharj Road, Hyt Unit",
      "Riyadh, 14371 - 6749",
      "Kingdom of Saudi Arabia",
    ],
    formattedAddress:
      "3463 Old Al-Kharj Road, Hyt Unit, Riyadh, 14371 - 6749 Kingdom of Saudi Arabia",
    city: "Riyadh",
    countryCode: "SA",
    phone: "+966-55-5496568",
    phoneHref: "tel:+966555496568",
    latitude: 24.6382,
    longitude: 46.7725,
    hours: [
      { day: "Monday - Thursday", hours: "08:00 AM - 4:00 PM" },
      { day: "Friday", hours: "Closed" },
      { day: "Saturday - Sunday", hours: "08:00 AM - 4:00 PM" },
    ],
  },
];

export const WAREHOUSES_BY_SLUG = Object.fromEntries(WAREHOUSES.map((row) => [row.slug, row]));

/** @param {string} slug */
export function getWarehouseBySlug(slug) {
  return WAREHOUSES_BY_SLUG[slug] ?? null;
}
