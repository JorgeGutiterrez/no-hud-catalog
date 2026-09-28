/**
 * The contract between data sources and the view.
 * Any source (Drive, sample data, a future Sheet or JSON file) only has to
 * implement `CatalogSource`; the view never needs to change.
 *
 * @typedef {Object} Mockup
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {string} collection    Grouping inside the category (e.g. "Naruto"); empty when none.
 * @property {string} thumbnailUrl  Small preview shown on the card.
 * @property {string} previewUrl    Larger preview shown in the lightbox.
 *
 * @typedef {Object} Category
 * @property {string} name
 * @property {Mockup[]} mockups
 *
 * @typedef {Object} CatalogSource
 * @property {() => Promise<Category[]>} loadCategories
 */

/** "Anime · Naruto", or just "Anime" when the mockup has no collection. */
export function mockupLocation({ mockup, category }) {
  return [category.name, mockup.collection].filter(Boolean).join(' · ');
}
