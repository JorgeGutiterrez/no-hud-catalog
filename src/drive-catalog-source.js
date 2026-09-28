/**
 * Builds the catalog from a Drive folder tree:
 * - each subfolder of the root is a category (a filter on the page);
 * - every image inside it, at any depth, is a mockup;
 * - nested folder names become the mockup's collection ("Naruto", "Películas · Marvel").
 *
 * @returns {import('./catalog-model.js').CatalogSource}
 */
export function createDriveCatalogSource(driveClient, { rootFolderId, preview }) {
  async function collectMockups(folderId, collectionPath) {
    const { folders, images } = await driveClient.listChildren(folderId);
    const nestedMockups = await Promise.all(
      folders.map((folder) => collectMockups(folder.id, [...collectionPath, formatDisplayName(folder.name)])),
    );
    const collection = collectionPath.join(' · ');

    return [...images.map((file) => toMockup(file, { collection, preview })), ...nestedMockups.flat()];
  }

  async function loadCategory(folder) {
    return {
      name: formatDisplayName(folder.name),
      mockups: await collectMockups(folder.id, []),
    };
  }

  return {
    async loadCategories() {
      const { folders } = await driveClient.listChildren(rootFolderId);
      const categories = await Promise.all(folders.map(loadCategory));
      return categories.filter((category) => category.mockups.length > 0);
    },
  };
}

function toMockup(file, { collection, preview }) {
  return {
    id: file.id,
    title: formatDisplayName(stripExtension(file.name)),
    description: file.description ?? '',
    collection,
    thumbnailUrl: driveThumbnailUrl(file.id, preview.cardWidth),
    previewUrl: driveThumbnailUrl(file.id, preview.lightboxWidth),
  };
}

function driveThumbnailUrl(fileId, width) {
  return `https://drive.google.com/thumbnail?id=${encodeURIComponent(fileId)}&sz=w${width}`;
}

function stripExtension(fileName) {
  return fileName.replace(/\.[^.]+$/, '');
}

/** "02-ronin_eclipse" → "Ronin Eclipse". The numeric prefix only controls ordering. */
export function formatDisplayName(name) {
  return name
    .replace(/^\d+[\s._-]+/, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/(^|\s)(\p{L})/gu, (_, space, letter) => space + letter.toUpperCase());
}
