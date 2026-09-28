import { mockupLocation } from './catalog-model.js';

const ALL_SLUG = 'todos';
const ALL_LABEL = 'Todos';

/**
 * Renders the catalog into the page. It only knows the Category/Mockup model,
 * never where the data came from. The selected category lives in the URL hash
 * (e.g. #anime), so a link to a single category can be shared with a customer.
 */
export function createCatalogView(doc, { requestLinkFor }) {
  const dom = queryElements(doc);
  let categories = [];

  doc.defaultView.addEventListener('hashchange', renderSelection);
  dom.lightboxClose.addEventListener('click', () => dom.lightbox.close());
  dom.lightbox.addEventListener('click', (event) => {
    if (event.target === dom.lightbox) dom.lightbox.close();
  });
  dom.lightbox.addEventListener('close', () => dom.lightboxImage.removeAttribute('src'));

  function renderBranding({ brand, hero }) {
    doc.title = `${brand.name} — ${hero.title}`;
    dom.brandName.textContent = brand.name;
    dom.brandTagline.textContent = brand.tagline;
    dom.heroTitle.textContent = hero.title;
    dom.heroSubtitle.textContent = hero.subtitle;
    dom.footerEstablished.textContent = `Est. ${brand.established}`;
    dom.footerMotto.textContent = brand.motto;
    dom.footerCode.textContent = brand.code;
    if (brand.icon) renderIcon(brand.icon);
  }

  function renderIcon(src) {
    dom.favicon.href = src;
    dom.touchIcon.href = src;
    dom.brandIcon.addEventListener('load', () => (dom.brandIcon.hidden = false), { once: true });
    dom.brandIcon.src = src;
  }

  function renderContactLink(href) {
    dom.contactLink.href = href;
  }

  function showNotice(message) {
    dom.notice.textContent = message;
    dom.notice.hidden = false;
  }

  function showLoading() {
    setStatus('Cargando diseños…');
  }

  function showError(message) {
    dom.grid.replaceChildren();
    dom.filters.replaceChildren();
    dom.categoryIndex.replaceChildren();
    setStatus(`No pudimos cargar el catálogo. ${message}`, { isError: true });
  }

  /** @param {import('./catalog-model.js').Category[]} loadedCategories */
  function render(loadedCategories) {
    categories = loadedCategories.map((category) => ({ ...category, slug: slugify(category.name) }));

    if (categories.length === 0) {
      setStatus('Aún no hay diseños publicados. ¡Vuelve pronto!');
      return;
    }

    setStatus('');
    renderSelection();
  }

  function renderSelection() {
    const selectedSlug = readSelectedSlug();
    const visibleCategories =
      selectedSlug === ALL_SLUG ? categories : categories.filter((category) => category.slug === selectedSlug);
    const entries = visibleCategories.flatMap((category) => category.mockups.map((mockup) => ({ mockup, category })));

    dom.filters.replaceChildren(
      createCategoryLink({ label: ALL_LABEL, slug: ALL_SLUG, selectedSlug, className: 'filter' }),
      ...categories.map(({ name, slug }) => createCategoryLink({ label: name, slug, selectedSlug, className: 'filter' })),
    );
    dom.categoryIndex.replaceChildren(
      ...categories.map(({ name, slug }) => {
        const item = doc.createElement('li');
        item.append(createCategoryLink({ label: name, slug, selectedSlug, className: 'category-index__link' }));
        return item;
      }),
    );
    dom.grid.replaceChildren(...entries.map((entry, index) => createCard(entry, index)));
    dom.count.textContent = padNumber(entries.length);
  }

  function readSelectedSlug() {
    const slug = decodeURIComponent(doc.defaultView.location.hash.slice(1));
    return categories.some((category) => category.slug === slug) ? slug : ALL_SLUG;
  }

  function createCategoryLink({ label, slug, selectedSlug, className }) {
    const link = doc.createElement('a');
    link.className = className;
    link.href = `#${slug}`;
    link.textContent = label;
    if (slug === selectedSlug) link.setAttribute('aria-current', 'true');
    return link;
  }

  function createCard({ mockup, category }, index) {
    const card = dom.cardTemplate.content.firstElementChild.cloneNode(true);
    const image = card.querySelector('[data-card-image]');
    const button = card.querySelector('[data-card-button]');

    image.src = mockup.thumbnailUrl;
    image.alt = mockup.title;
    card.querySelector('[data-card-number]').textContent = padNumber(index + 1);
    card.querySelector('[data-card-title]').textContent = mockup.title;
    button.setAttribute('aria-label', `Ver ${mockup.title}`);
    button.addEventListener('click', () => openLightbox({ mockup, category }));

    return card;
  }

  function openLightbox({ mockup, category }) {
    dom.lightboxImage.src = mockup.previewUrl;
    dom.lightboxImage.alt = mockup.title;
    dom.lightboxCategory.textContent = mockupLocation({ mockup, category });
    dom.lightboxTitle.textContent = mockup.title;
    dom.lightboxDescription.textContent = mockup.description;
    dom.lightboxDescription.hidden = !mockup.description;
    dom.lightboxRequest.href = requestLinkFor({ mockup, category });
    dom.lightbox.showModal();
  }

  function setStatus(message, { isError = false } = {}) {
    dom.status.textContent = message;
    dom.status.hidden = !message;
    dom.status.classList.toggle('status--error', isError);
  }

  return { renderBranding, renderContactLink, showNotice, showLoading, showError, render };
}

function queryElements(doc) {
  const find = (name) => {
    const element = doc.querySelector(`[data-${name}]`);
    if (!element) throw new Error(`Missing element [data-${name}] in index.html`);
    return element;
  };

  return {
    favicon: find('favicon'),
    touchIcon: find('touch-icon'),
    brandIcon: find('brand-icon'),
    brandName: find('brand-name'),
    brandTagline: find('brand-tagline'),
    contactLink: find('contact-link'),
    heroTitle: find('hero-title'),
    heroSubtitle: find('hero-subtitle'),
    categoryIndex: find('category-index'),
    notice: find('notice'),
    filters: find('filters'),
    count: find('count'),
    status: find('status'),
    grid: find('grid'),
    cardTemplate: find('card-template'),
    lightbox: find('lightbox'),
    lightboxClose: find('lightbox-close'),
    lightboxImage: find('lightbox-image'),
    lightboxCategory: find('lightbox-category'),
    lightboxTitle: find('lightbox-title'),
    lightboxDescription: find('lightbox-description'),
    lightboxRequest: find('lightbox-request'),
    footerEstablished: find('footer-established'),
    footerMotto: find('footer-motto'),
    footerCode: find('footer-code'),
  };
}

/** "Superhéroes" → "superheroes" */
function slugify(text) {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function padNumber(value) {
  return String(value).padStart(2, '0');
}
