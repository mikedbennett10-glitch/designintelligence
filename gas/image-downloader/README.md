# Image Downloader (Google Apps Script)

Reads image URLs from a Google Sheet and downloads them into Google Drive,
organized into folders by group.

## Setup

1. Open (or create) a **Google Sheet**. This is where you'll paste your
   URLs, and it must be the one the script is bound to.
2. In that Sheet, go to **Extensions → Apps Script**. This opens a script
   project already connected to the Sheet — that connection is what lets
   `downloadAllImages` find your data.
3. Replace the default `Code.gs` contents with the `Code.gs` in this
   folder. Optionally copy `appsscript.json` in via Project Settings →
   "Show appsscript.json".
4. Save the project (the default project name doesn't matter).
5. Back in the Sheet, add a tab named exactly **`URLs`** (or change
   `SHEET_NAME` at the top of `Code.gs` to match a tab name you prefer)
   with a header row and two columns:

   | Folder Name | Image URL |
   |---|---|
   | Group 1 | https://example.com/a.jpg |
   | Group 1 | https://example.com/b.jpg |
   | Group 2 | https://example.com/c.png |
   | ... | ... |

   Use the same `Folder Name` for every row that belongs to that group —
   for your 6 groups, that's 6 distinct folder names across the rows.
6. Reload the Sheet's browser tab so the new **Image Downloader** menu
   appears.

## Running it

- **From the Sheet**: menu bar → **Image Downloader → Download all
  images**. The first run prompts you to authorize Drive access.
- **From the Apps Script editor**: select `downloadAllImages` in the
  toolbar dropdown and click Run.

You'll get a confirmation popup (or, when run from the editor, an entry in
**View → Executions → logs**) summarizing how many images downloaded and
how many failed.

## Configuration

At the top of `Code.gs`:

- `SHEET_NAME` — the tab holding your (Folder Name, Image URL) rows.
  Defaults to `'URLs'`.
- `PARENT_FOLDER_ID` — optional Drive folder ID to create the group
  folders inside. Leave `''` to create them directly in "My Drive". Get a
  folder's ID from its URL: `drive.google.com/drive/folders/<THIS PART>`.

## Behavior

- Folders are created if they don't already exist (matched by name), and
  reused if they do — safe to re-run without duplicating folders.
- Each URL is downloaded independently; a failed URL is recorded in the
  execution log without stopping the rest of the batch.
- File names are taken from the URL's last path segment when it has a
  recognizable extension; otherwise a name like `image_3.jpg` is generated
  from the response's content type.
- Blank rows, or rows missing a folder name or URL, are skipped.

## Troubleshooting "no images were pulled"

- Make sure the script is bound to the Sheet (opened via that Sheet's
  Extensions → Apps Script), not a standalone script at script.google.com.
- Make sure the tab is named exactly `URLs` (or matches `SHEET_NAME`).
- Make sure row 1 is a header — data starts on row 2.
- Check **View → Executions** in the Apps Script editor for the specific
  error or per-row failure reasons.
