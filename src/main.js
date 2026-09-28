import { config } from './config.js';
import { createCatalogView } from './catalog-view.js';
import { buildContactLink, buildMockupRequestLink } from './contact-links.js';
import { createDriveClient } from './drive-client.js';
import { createDriveCatalogSource } from './drive-catalog-source.js';
import { createSampleCatalogSource } from './sample-catalog-source.js';
import { withSessionCache } from './session-cache.js';

// Bump when the cached Category/Mockup shape changes, so stale entries are ignored.
const CACHE_VERSION = 2;

const DEMO_NOTICE =
  'Modo demo: agrega tu apiKey y rootFolderId de Google Drive en src/config.js para mostrar tus diseños.';

/** Returns the Drive-backed source, or null when Drive isn't configured yet. */
function createDriveSourceFromConfig() {
  const { apiKey, rootFolderId } = config.drive;
  if (!apiKey || !rootFolderId) return null;

  const driveSource = createDriveCatalogSource(createDriveClient({ apiKey }), {
    rootFolderId,
    preview: config.preview,
  });
  return withSessionCache(driveSource, { key: `catalog:v${CACHE_VERSION}:${rootFolderId}`, ttlMinutes: config.cacheMinutes });
}

async function start() {
  const view = createCatalogView(document, {
    requestLinkFor: (selection) => buildMockupRequestLink(config.contact, selection),
  });

  try {
    view.renderBranding(config);
    view.renderContactLink(buildContactLink(config.contact, config.contact.greeting));

    const driveSource = createDriveSourceFromConfig();
    if (!driveSource) view.showNotice(DEMO_NOTICE);

    view.showLoading();
    const source = driveSource ?? createSampleCatalogSource();
    view.render(await source.loadCategories());
  } catch (error) {
    console.error(error);
    view.showError(error.message);
  }
}

start();
