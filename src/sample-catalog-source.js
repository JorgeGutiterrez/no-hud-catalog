/**
 * Placeholder catalog used until Drive is configured, so the page can be
 * previewed and styled without any Google setup.
 */

const SHIRT_COLORS = {
  black: { fill: '#0c0c0c', stroke: '#2e2e2e' },
  white: { fill: '#ececec', stroke: '#b5b5b5' },
  washed: { fill: '#333333', stroke: '#4d4d4d' },
};

const SAMPLE_CATEGORIES = [
  {
    name: 'Anime',
    mockups: [
      { title: 'Ronin Eclipse', color: 'black', description: 'Samurái bajo un eclipse, estampado frontal.' },
      { title: 'Spirit Blade', color: 'white', description: '' },
      { title: 'Neo Tokyo', color: 'washed', description: 'Skyline nocturno sobre algodón lavado.' },
    ],
  },
  {
    name: 'Gaming',
    mockups: [
      { title: 'Game Over', color: 'black', description: '' },
      { title: 'Pixel Hero', color: 'white', description: 'Personaje 8-bit en espalda completa.' },
      { title: 'Respawn', color: 'black', description: '' },
    ],
  },
  {
    name: 'Superhéroes',
    mockups: [
      { title: 'Guardian', color: 'washed', description: 'Emblema desgastado, estilo vintage.' },
      { title: 'Última Línea', color: 'black', description: '' },
    ],
  },
  {
    name: 'Gym',
    mockups: [
      { title: 'Heavy Set', color: 'black', description: '' },
      { title: 'No Pain', color: 'white', description: 'Tipografía bold en pecho.' },
    ],
  },
  {
    name: 'Otros',
    mockups: [
      { title: 'Orbit', color: 'black', description: '' },
      { title: 'Signal Lost', color: 'washed', description: 'Glitch art en manga y espalda.' },
    ],
  },
];

/** @returns {import('./catalog-model.js').CatalogSource} */
export function createSampleCatalogSource() {
  return {
    loadCategories: async () => SAMPLE_CATEGORIES.map(toCategory),
  };
}

function toCategory({ name, mockups }) {
  return {
    name,
    mockups: mockups.map(({ title, color, description }) => {
      const image = shirtImage(SHIRT_COLORS[color]);
      return { id: `${name}-${title}`, title, description, collection: '', thumbnailUrl: image, previewUrl: image };
    }),
  };
}

function shirtImage({ fill, stroke }) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="40 30 320 345">
    <path d="M140 58 L172 44 Q200 66 228 44 L260 58 L340 100 L316 168 L284 154 L286 362 L114 362 L116 154 L84 168 L60 100 Z"
      fill="${fill}" stroke="${stroke}" stroke-width="2" stroke-linejoin="round"/>
    <path d="M172 44 Q200 80 228 44" fill="none" stroke="${stroke}" stroke-width="6"/>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
