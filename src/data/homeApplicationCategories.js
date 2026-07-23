import { routes } from "@/lib/routes";

/**
 * Homepage application accordion — aligned with Figma `homepage.jpg`.
 * Links route to PLP; `application` query reserved for future facet filtering.
 */

/** @typedef {{ slug: string; label: string; icon: string }} ApplicationItem */
/** @typedef {{ id: string; title: string; slug: string; applications: ApplicationItem[] }} ApplicationCategory */

/** @type {ApplicationCategory[]} */
export const HOME_APPLICATION_ACCORDIONS = [
  {
    id: "passenger-car",
    title: "Passenger Car",
    slug: "passenger-cars",
    applications: [
      { slug: "petrol-engine", label: "Petrol Engine", icon: "petrol" },
      { slug: "diesel-engine", label: "Diesel Engine", icon: "diesel" },
      { slug: "gear-transmission", label: "Gear & Transmission", icon: "gear" },
      { slug: "cvt", label: "CVT Fluids", icon: "cvt" },
      { slug: "coolant", label: "Coolants", icon: "coolant" },
      { slug: "brake-fluid", label: "Brake Fluid", icon: "brake" },
      { slug: "grease", label: "Grease", icon: "grease" },
      { slug: "hybrid", label: "Hybrid & EV", icon: "hybrid" },
    ],
  },
  {
    id: "trucks-heavy",
    title: "Trucks & Heavy Equipment",
    slug: "commercial",
    applications: [
      { slug: "diesel-engine", label: "Diesel Engine", icon: "diesel" },
      { slug: "transmission", label: "Transmission", icon: "gear" },
      { slug: "axle-differential", label: "Axle & Differential", icon: "axle" },
      { slug: "hydraulic", label: "Hydraulic", icon: "hydraulic" },
      { slug: "coolant", label: "Coolants", icon: "coolant" },
      { slug: "grease", label: "Grease", icon: "grease" },
      { slug: "def", label: "DEF / AdBlue", icon: "fluid" },
    ],
  },
  {
    id: "motorcycle-atv",
    title: "Motorcycle & ATV",
    slug: "motorcycle-atv",
    applications: [
      { slug: "four-stroke", label: "4-Stroke Engine", icon: "petrol" },
      { slug: "two-stroke", label: "2-Stroke Engine", icon: "two-stroke" },
      { slug: "gear-oil", label: "Gear Oil", icon: "gear" },
      { slug: "fork-oil", label: "Fork Oil", icon: "fork" },
      { slug: "brake-fluid", label: "Brake Fluid", icon: "brake" },
      { slug: "chain-lube", label: "Chain Lube", icon: "chain" },
    ],
  },
  {
    id: "industrial",
    title: "Industrial Oil",
    slug: "industrial",
    applications: [
      { slug: "hydraulic", label: "Hydraulic", icon: "hydraulic" },
      { slug: "compressor", label: "Compressor", icon: "compressor" },
      { slug: "turbine", label: "Turbine", icon: "turbine" },
      { slug: "circulating", label: "Circulating", icon: "circulating" },
      { slug: "heat-transfer", label: "Heat Transfer", icon: "heat" },
      { slug: "gear", label: "Industrial Gear", icon: "gear" },
    ],
  },
  {
    id: "metalworking",
    title: "Metalworking Oils",
    slug: "metalworking",
    applications: [
      { slug: "cutting", label: "Cutting", icon: "cutting" },
      { slug: "forming", label: "Forming", icon: "forming" },
      { slug: "rust-preventive", label: "Rust Preventive", icon: "rust" },
      { slug: "quenching", label: "Quenching", icon: "quenching" },
      { slug: "grinding", label: "Grinding", icon: "grinding" },
    ],
  },
  {
    id: "marine",
    title: "Marine Oil",
    slug: "marine",
    applications: [
      { slug: "marine-diesel", label: "Marine Diesel", icon: "diesel" },
      { slug: "marine-gear", label: "Marine Gear", icon: "gear" },
      { slug: "hydraulic", label: "Hydraulic", icon: "hydraulic" },
      { slug: "grease", label: "Grease", icon: "grease" },
      { slug: "turbine", label: "Turbine", icon: "turbine" },
    ],
  },
  {
    id: "military",
    title: "Military-Grade Lubricants",
    slug: "military",
    applications: [
      { slug: "engine", label: "Engine Oils", icon: "petrol" },
      { slug: "hydraulic", label: "Hydraulic", icon: "hydraulic" },
      { slug: "gear", label: "Gear Oils", icon: "gear" },
      { slug: "grease", label: "Grease", icon: "grease" },
      { slug: "turbine", label: "Turbine", icon: "turbine" },
    ],
  },
  {
    id: "drilling",
    title: "Drilling Fluid",
    slug: "drilling",
    applications: [
      { slug: "water-based", label: "Water-Based", icon: "fluid" },
      { slug: "oil-based", label: "Oil-Based", icon: "fluid" },
      { slug: "synthetic", label: "Synthetic", icon: "fluid" },
      { slug: "completion", label: "Completion Fluids", icon: "drill" },
    ],
  },
  {
    id: "oil-gas",
    title: "Oil & Gas",
    slug: "oil-gas",
    applications: [
      { slug: "exploration", label: "Exploration", icon: "drill" },
      { slug: "production", label: "Production", icon: "compressor" },
      { slug: "pipeline", label: "Pipeline", icon: "pipeline" },
      { slug: "compressor", label: "Compressor", icon: "compressor" },
      { slug: "grease", label: "Grease", icon: "grease" },
    ],
  },
];

/** @param {ApplicationCategory} category @param {ApplicationItem} app */
export function applicationHref(category, app) {
  const base = routes.category(category.slug);
  const q = new URLSearchParams({ application: app.slug });
  return `${base}?${q.toString()}`;
}
