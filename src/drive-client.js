const FILES_ENDPOINT = 'https://www.googleapis.com/drive/v3/files';
const FOLDER_MIME_TYPE = 'application/vnd.google-apps.folder';
const MAX_PAGE_SIZE = '1000';

const ERROR_HINTS = {
  400: 'Revisa que rootFolderId sea un ID de carpeta válido.',
  403: 'La API key no es válida, está restringida a otro dominio o la Google Drive API no está habilitada.',
  404: 'No se encontró la carpeta. ¿Está compartida como "Cualquier persona con el enlace"?',
};

export class DriveError extends Error {
  name = 'DriveError';
}

/** Read-only access to publicly shared Drive folders using an API key. */
export function createDriveClient({ apiKey }) {
  async function listFiles({ query, fields }) {
    const files = [];
    let pageToken;

    do {
      const page = await fetchPage({ query, fields, pageToken });
      files.push(...page.files);
      pageToken = page.nextPageToken;
    } while (pageToken);

    return files;
  }

  async function fetchPage({ query, fields, pageToken }) {
    const url = new URL(FILES_ENDPOINT);
    url.search = new URLSearchParams({
      key: apiKey,
      q: query,
      fields: `nextPageToken, files(${fields})`,
      orderBy: 'name_natural',
      pageSize: MAX_PAGE_SIZE,
      ...(pageToken && { pageToken }),
    });

    const response = await fetch(url);
    if (!response.ok) throw await toDriveError(response);
    return response.json();
  }

  return {
    /** Lists a folder's direct subfolders and images in a single request. */
    async listChildren(folderId) {
      const files = await listFiles({
        query: `'${folderId}' in parents and trashed = false and (mimeType = '${FOLDER_MIME_TYPE}' or mimeType contains 'image/')`,
        fields: 'id, name, mimeType, description',
      });
      return {
        folders: files.filter(isFolder),
        images: files.filter((file) => !isFolder(file)),
      };
    },
  };
}

function isFolder(file) {
  return file.mimeType === FOLDER_MIME_TYPE;
}

async function toDriveError(response) {
  const hint = ERROR_HINTS[response.status] ?? 'Google Drive respondió con un error inesperado.';
  const reason = await readErrorReason(response);
  return new DriveError(`${hint} (${response.status}: ${reason})`);
}

async function readErrorReason(response) {
  try {
    const body = await response.json();
    return body.error?.message ?? response.statusText;
  } catch {
    return response.statusText;
  }
}
