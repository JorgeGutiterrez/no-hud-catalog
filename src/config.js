/**
 * The only file you need to edit to run the catalog.
 * Adding mockups or categories happens in Google Drive, not here.
 */
export const config = Object.freeze({
  brand: {
    name: 'NO HUD',
    tagline: 'Streetwear for a more real world',
    motto: 'Ropa para un mundo más real',
    established: '2024',
    code: 'NH_01',
    // Square PNG or SVG (512×512 or larger). Used as the browser tab icon and header logo.
    // Leave empty to show no icon.
    icon: 'assets/icon.png',
  },

  hero: {
    title: 'Catálogo',
    subtitle: 'Diseños inspirados en anime, gaming, cultura geek y más.',
  },

  // Leave either value empty to preview the page with sample data.
  drive: {
    apiKey: 'AIzaSyBjpfwH5AQDy6hoB5gZK192t80bjVzsx6c',
    // The part after /folders/ in the root folder URL.
    rootFolderId: '1zgGGA-haVSxDOxKuZ-sQQgcJak5THZ3x',
  },

  // Drive serves resized previews, never the original file.
  preview: {
    cardWidth: 600,
    lightboxWidth: 1600,
  },

  cacheMinutes: 10,

  contact: {
    channel: 'whatsapp', // 'whatsapp' | 'email'
    whatsappNumber: '+529994561434', // International format, digits only.
    email: 'hola@nohud.com',
    emailSubject: 'Consulta de diseño',
    greeting: '¡Hola! Quiero información sobre sus diseños.',
    requestTemplate: '¡Hola! Me interesa el diseño "{title}" de la categoría {category}.',
  },
});
