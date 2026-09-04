# Image Downloader (Google Apps Script)

Two variants are included — pick whichever fits how you want to manage
your URLs:

- **`Code.gs`** (recommended): URLs live in a Google Sheet, one row per
  group. Easiest to edit without touching code.
- **`Code-inline-urls.gs`**: URLs are typed directly into the script, in a
  `CONFIG.groups` array keyed by Drive folder ID. Good if you'd rather
  not use a Sheet at all. See the comments at the top of that file — copy
  its contents in place of `Code.gs` and paste your URLs into each
  group's `urls` array.

## Sheet-based variant (`Code.gs`)

Reads image URLs from a Google Sheet and downloads them straight into
existing Google Drive folders — one row per group, all of that group's
URLs pasted into a single cell.

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

   | Folder ID | Image URLs |
   |---|---|
   | 1AbCdEfGhIjKlMnOpQrStUvWxYz | https://example.com/a.jpg<br>https://example.com/b.jpg<br>https://example.com/c.jpg |
   | 1ZzYyXxWwVvUuTtSsRrQqPpOoNn | https://example.com/d.png<br>https://example.com/e.png |

   One row per group (6 rows for your 6 groups):
   - **Folder ID** — the destination Drive folder's ID, taken from its
     URL: `drive.google.com/drive/folders/<THIS PART>`. The folder must
     already exist and you must have edit access to it.
   - **Image URLs** — all of that group's URLs pasted into the *same
     cell*. To get a list to land in one cell instead of spreading across
     rows: double-click the cell to enter edit mode first, then paste.
     One URL per line works best; URLs separated by commas or spaces also
     work.
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

## Behavior

- Each group's cell is scanned for every `http(s)://...` URL it contains,
  regardless of whether they're separated by line breaks, commas, or
  spaces.
- Each URL is downloaded independently; a failed URL (bad link, or an
  invalid/inaccessible Folder ID) is recorded without stopping the rest
  of the batch.
- File names are taken from the URL's last path segment when it has a
  recognizable extension; otherwise a name like `image_3.jpg` is generated
  from the response's content type.
- Rows missing a Folder ID or containing no URLs are skipped.

## Troubleshooting "no images were pulled"

- Make sure the script is bound to the Sheet (opened via that Sheet's
  Extensions → Apps Script), not a standalone script at script.google.com.
- Make sure the tab is named exactly `URLs` (or matches `SHEET_NAME`).
- Make sure row 1 is a header — data starts on row 2.
- Make sure each Folder ID is correct and you have edit access to that
  folder.
- Check **View → Executions** in the Apps Script editor for the specific
  error or per-row failure reasons.
