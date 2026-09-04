# Image Downloader (Google Apps Script)

Downloads images from a list of URLs into Google Drive, organized into up to
6 folders (or as many groups as you configure).

## Setup

1. Go to [script.google.com](https://script.google.com) and create a new
   project (or bind it to a Google Sheet if you want the menu button:
   Extensions → Apps Script).
2. Replace the default `Code.gs` with the contents of `Code.gs` in this
   folder. Optionally copy `appsscript.json` in via Project Settings →
   "Show appsscript.json".
3. Edit the `CONFIG` object at the top of `Code.gs`:
   - `parentFolderId`: optional Drive folder ID to hold the 6 group
     folders. Leave `''` to create them directly in "My Drive".
   - `groups`: an array of `{ folderName, urls }` objects — one per group.
     Set each `folderName` and paste in that group's image URLs.
4. Save the project.

## Running it

- **From the Apps Script editor**: select the `downloadAllImages` function
  in the toolbar dropdown and click Run. The first run will prompt for
  authorization (Drive access).
- **From a bound Sheet**: reload the Sheet, use the new "Image Downloader"
  menu → "Download all images".

## Behavior

- Folders are created if they don't already exist (matched by name), and
  reused if they do — safe to re-run.
- Each URL is downloaded independently; a failed URL is recorded in the
  execution log (View → Logs / `Logger.log` output) without stopping the
  rest of the batch.
- File names are taken from the URL's last path segment when it has a
  recognizable extension; otherwise a name like `image_3.jpg` is generated
  from the response's content type.
