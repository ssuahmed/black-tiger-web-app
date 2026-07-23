import fs from "fs";
import path from "path";

const COMPONENTS_DIR = path.join(process.cwd(), "src", "components");

/**
 * Recursively collect React component modules under src/components.
 * @returns {Array<{ name: string, category: string, filePath: string, importPath: string, hasCssModule: boolean }>}
 */
export function getComponentCatalog() {
  if (!fs.existsSync(COMPONENTS_DIR)) return [];

  /** @type {Array<{ name: string, category: string, filePath: string, importPath: string, hasCssModule: boolean }>} */
  const items = [];

  function walk(currentDir, category) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        const nextCategory = category || entry.name;
        walk(fullPath, nextCategory);
        continue;
      }

      if (!entry.name.endsWith(".js") || entry.name === "index.js") continue;

      const name = entry.name.replace(/\.js$/, "");
      const relativeDir = path.relative(COMPONENTS_DIR, currentDir).split(path.sep).join("/");
      const importPath = relativeDir
        ? `@/components/${relativeDir}/${name}`
        : `@/components/${name}`;

      items.push({
        name,
        category: category || "root",
        filePath: path.relative(process.cwd(), fullPath).split(path.sep).join("/"),
        importPath,
        hasCssModule: fs.existsSync(path.join(currentDir, `${name}.module.css`)),
      });
    }
  }

  walk(COMPONENTS_DIR, "");

  return items.sort((a, b) => {
    if (a.category !== b.category) return a.category.localeCompare(b.category);
    return a.name.localeCompare(b.name);
  });
}

/**
 * @param {ReturnType<typeof getComponentCatalog>} catalog
 */
export function groupCatalogByCategory(catalog) {
  /** @type {Record<string, typeof catalog>} */
  const groups = {};

  for (const item of catalog) {
    if (!groups[item.category]) groups[item.category] = [];
    groups[item.category].push(item);
  }

  return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
}
