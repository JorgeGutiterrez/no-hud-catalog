import { mockupLocation } from './catalog-model.js';

/** Builds a link that opens a conversation with the brand on the configured channel. */
export function buildContactLink(contact, message) {
  switch (contact.channel) {
    case 'whatsapp':
      return `https://wa.me/${contact.whatsappNumber}?text=${encodeURIComponent(message)}`;
    case 'email':
      return `mailto:${contact.email}?subject=${encodeURIComponent(contact.emailSubject)}&body=${encodeURIComponent(message)}`;
    default:
      throw new Error(`Canal de contacto desconocido "${contact.channel}". Usa "whatsapp" o "email".`);
  }
}

/** Builds a link whose pre-filled message names the exact mockup the customer picked. */
export function buildMockupRequestLink(contact, selection) {
  const message = contact.requestTemplate
    .replaceAll('{title}', selection.mockup.title)
    .replaceAll('{category}', mockupLocation(selection));
  return buildContactLink(contact, message);
}
