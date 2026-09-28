# Mockup Catalog

A static catalog page that reads your design mockups straight from Google Drive.
Customers browse previews and request only the designs they want, so you never
have to send the whole collection.

No build step, no backend. It's plain HTML, CSS and JavaScript modules.

## Managing the catalog (no code changes)

Everything is driven by the folder structure in Drive:

```
📁 Catalog root              ← shared as "Anyone with the link: Viewer"
 ├─ 📁 01-Anime              ← category (the "01-" prefix sets the order and is hidden)
 │   ├─ 01-ronin_eclipse.png ← mockup titled "Ronin Eclipse"
 │   └─ spirit-blade.jpg
 ├─ 📁 02-Gaming
 └─ 📁 03-Superhéroes
```

| To…                   | Do this in Drive                                                         |
| --------------------- | ------------------------------------------------------------------------ |
| Add a mockup          | Upload an image to a category folder                                     |
| Add a category        | Create a subfolder in the root                                           |
| Reorder               | Prefix names with `01-`, `02-`, …                                        |
| Add a card subtitle   | Right-click the file → *File information* → *Details* → **Description**  |
| Hide a mockup         | Move it out of the root folder (or to the trash)                         |

Empty categories are hidden automatically. Changes show up within `cacheMinutes`
(10 min by default) or right away in a new tab.

Share a single category with a customer by linking to its hash, for example
`https://your-site/#anime`.

## One-time setup

1. **Share the root folder.** In Drive, choose *Share → General access → Anyone with
   the link → Viewer*. Copy the folder ID from its URL:
   `drive.google.com/drive/folders/`**`THIS_PART`**.
2. **Create an API key.**
   1. In [Google Cloud Console](https://console.cloud.google.com/), create a project.
   2. Enable the **Google Drive API** (*APIs & Services → Library*).
   3. Go to *APIs & Services → Credentials → Create credentials → API key*.
   4. Restrict the key:
      - *API restrictions*: **Google Drive API** only.
      - *Application restrictions*: **Websites**, adding your domain
        (e.g. `https://youruser.github.io/*`) and `http://localhost:5173/*`
        for local testing.
3. **Configure.** Put `apiKey` and `rootFolderId` in [`src/config.js`](src/config.js),
   along with your brand texts and contact channel (WhatsApp number or email).
4. **Icon (optional).** Save a square PNG or SVG (512×512 or larger) as `assets/icon.png`.
   It's used as the browser tab icon and next to the brand name in the header. To
   use a different file name, change `brand.icon` in `config.js`.

While either value is empty, the page runs in **demo mode** with sample data.

## Run locally

```bash
python -m http.server 5173
```

Then open http://localhost:5173. The page must be served over HTTP: opening
`index.html` directly from disk blocks the JavaScript modules.

## Deploy (GitHub Pages)

1. Push this folder to a GitHub repository.
2. *Settings → Pages → Deploy from a branch → `main` / root*.
3. Add the resulting URL to the API key's website restrictions.

Netlify, Vercel and Cloudflare Pages also work. Just drag and drop the folder.

## Troubleshooting

| Symptom                        | Likely cause                                                                     |
| ------------------------------ | -------------------------------------------------------------------------------- |
| "La API key no es válida…"     | Drive API not enabled, or the site's domain is missing from the key restrictions |
| "Aún no hay diseños publicados" | The root folder isn't shared publicly, or the images aren't inside subfolders    |
| Some images don't load         | That file was shared with specific people only. Re-share it via the root folder  |

## Project structure

| File                           | Responsibility                                              |
| ------------------------------ | ----------------------------------------------------------- |
| `src/config.js`                | **The only file you edit**: brand, Drive IDs, contact       |
| `src/main.js`                  | Wires everything together and picks Drive or demo data      |
| `src/catalog-model.js`         | The `Category` / `Mockup` contract shared by sources and view |
| `src/drive-client.js`          | Minimal Drive API v3 wrapper (pagination, error messages)   |
| `src/drive-catalog-source.js`  | Turns the Drive folder tree into categories and mockups     |
| `src/sample-catalog-source.js` | Demo data used until Drive is configured                    |
| `src/session-cache.js`         | Caches the catalog per browser tab                          |
| `src/contact-links.js`         | WhatsApp or email links with a pre-filled message           |
| `src/catalog-view.js`          | All DOM rendering: filters, cards, lightbox, states         |

To use another data source later (a Google Sheet, a JSON file, a CMS), write a new
module with `loadCategories()` that returns the model in `catalog-model.js`. Then
swap it in `main.js`. Nothing else changes.

## Good to know

The root folder is public, so its ID appears in the page source. A determined
visitor could open it in Drive and download the originals. If that matters, keep
a separate root folder of low-resolution or watermarked exports and point
`rootFolderId` at it. The code stays the same.
