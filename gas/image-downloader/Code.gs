/**
 * Image Downloader — Google Apps Script
 *
 * Reads (Folder ID, URLs) rows from a Google Sheet tab — one row per
 * group, with all of that group's image URLs pasted into a single cell —
 * and downloads each image into the matching Google Drive folder.
 *
 * SETUP:
 *   1. This script must be bound to a Google Sheet (Extensions > Apps
 *      Script from inside the Sheet) — that's what lets it find your data.
 *   2. In that Sheet, create a tab named exactly as SHEET_NAME below
 *      (default "URLs") with a header row and two columns:
 *        A: Folder ID    B: Image URLs
 *      One row per group. Column A is the destination Drive folder's ID
 *      (the part of its URL after .../folders/). Column B holds all of
 *      that group's URLs pasted into the single cell — one per line
 *      works best (double-click the cell to enter edit mode before
 *      pasting so it lands in one cell instead of spreading across
 *      rows); URLs separated by commas or spaces also work.
 *   3. Reload the Sheet and use the "Image Downloader" menu that appears,
 *      or run downloadAllImages from the Apps Script editor.
 */

const SHEET_NAME = 'URLs';

/**
 * Entry point: reads every row from SHEET_NAME and downloads that row's
 * URLs into the folder identified by its Folder ID.
 */
function downloadAllImages() {
  const rows = readGroupRows_();
  if (rows.length === 0) {
    const message =
      'No rows found on the "' + SHEET_NAME + '" tab. Add a header row ' +
      'plus rows of (Folder ID, Image URLs) and try again.';
    Logger.log(message);
    notify_(message);
    return [];
  }

  const results = [];
  rows.forEach((row) => {
    let folder;
    try {
      folder = DriveApp.getFolderById(row.folderId);
    } catch (err) {
      row.urls.forEach((url) => {
        results.push({ url: url, folder: row.folderId, status: 'error', error: 'Invalid Folder ID: ' + row.folderId });
      });
      return;
    }
    row.urls.forEach((url, index) => {
      results.push(downloadOneImage_(url, folder, index));
    });
  });

  logSummary_(results);
  notify_(summaryMessage_(results));
  return results;
}

/**
 * Reads all data rows (skipping the header) from SHEET_NAME as
 * { folderId, urls } objects, skipping blank rows.
 */
function readGroupRows_() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) {
    throw new Error(
      'No tab named "' + SHEET_NAME + '" found in this spreadsheet. ' +
      'Create it with columns: Folder ID | Image URLs.'
    );
  }

  const values = sheet.getDataRange().getValues();
  const dataRows = values.slice(1); // skip header row

  return dataRows
    .map((r) => ({
      folderId: String(r[0] || '').trim(),
      urls: extractUrls_(String(r[1] || '')),
    }))
    .filter((r) => r.folderId && r.urls.length > 0);
}

/**
 * Pulls every http(s) URL out of a block of text, regardless of whether
 * they're separated by newlines, commas, spaces, or a mix.
 */
function extractUrls_(text) {
  const matches = text.match(/https?:\/\/\S+/g) || [];
  return matches.map((url) => url.replace(/[,\s]+$/, ''));
}

/**
 * Downloads a single URL into the given folder. Never throws — failures
 * are captured in the returned result so one bad URL doesn't stop the batch.
 */
function downloadOneImage_(url, folder, index) {
  try {
    const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    const code = response.getResponseCode();
    if (code < 200 || code >= 300) {
      throw new Error('HTTP ' + code);
    }

    const blob = response.getBlob();
    const fileName = fileNameFromUrl_(url, index, blob);
    blob.setName(fileName);
    folder.createFile(blob);

    return { url: url, folder: folder.getName(), fileName: fileName, status: 'ok' };
  } catch (err) {
    return { url: url, folder: folder.getName(), status: 'error', error: String(err) };
  }
}

/**
 * Derives a reasonable file name from the URL, falling back to a
 * group-index name with the correct extension from the content type.
 */
function fileNameFromUrl_(url, index, blob) {
  const pathPart = url.split('?')[0].split('#')[0];
  const lastSegment = pathPart.substring(pathPart.lastIndexOf('/') + 1);

  if (lastSegment && /\.[a-zA-Z0-9]+$/.test(lastSegment)) {
    return decodeURIComponent(lastSegment);
  }

  const ext = extensionFromContentType_(blob.getContentType());
  return 'image_' + (index + 1) + ext;
}

function extensionFromContentType_(contentType) {
  const map = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'image/svg+xml': '.svg',
    'image/bmp': '.bmp',
  };
  return map[contentType] || '';
}

function summaryMessage_(results) {
  const ok = results.filter((r) => r.status === 'ok').length;
  const failedCount = results.length - ok;
  return 'Downloaded ' + ok + ' of ' + results.length + ' images.' +
    (failedCount ? ' ' + failedCount + ' failed — see execution log (View > Logs) for details.' : '');
}

function logSummary_(results) {
  Logger.log(summaryMessage_(results));
  results
    .filter((r) => r.status === 'error')
    .forEach((r) => {
      Logger.log('FAILED: %s (%s) — %s', r.url, r.folder, r.error);
    });
}

/**
 * Shows a UI alert when run from a bound Sheet; falls back to just logging
 * when run from the Apps Script editor with no active UI.
 */
function notify_(message) {
  try {
    SpreadsheetApp.getUi().alert(message);
  } catch (err) {
    // No UI available (e.g. run directly from the editor) — logging is enough.
  }
}

/**
 * Adds a custom menu when the Sheet is opened.
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Image Downloader')
    .addItem('Download all images', 'downloadAllImages')
    .addToUi();
}
