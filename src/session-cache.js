/**
 * Wraps a CatalogSource so repeat visits within the same browser tab
 * don't hit the Drive API again. Caching is best-effort: when storage is
 * unavailable the source is simply called every time.
 *
 * @param {import('./catalog-model.js').CatalogSource} source
 * @returns {import('./catalog-model.js').CatalogSource}
 */
export function withSessionCache(source, { key, ttlMinutes }) {
  const ttlMs = ttlMinutes * 60_000;

  return {
    async loadCategories() {
      const cached = readEntry(key);
      if (cached && Date.now() - cached.savedAt < ttlMs) return cached.categories;

      const categories = await source.loadCategories();
      writeEntry(key, { savedAt: Date.now(), categories });
      return categories;
    },
  };
}

function readEntry(key) {
  try {
    return JSON.parse(sessionStorage.getItem(key));
  } catch {
    return null;
  }
}

function writeEntry(key, entry) {
  try {
    sessionStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // Storage blocked or full: skip caching.
  }
}
