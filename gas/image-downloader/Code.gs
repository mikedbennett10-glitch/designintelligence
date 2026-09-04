/**
 * Image Downloader — Google Apps Script
 *
 * Reads (Folder Name, Image URL) rows from a Google Sheet tab and downloads
 * each image into a matching Google Drive folder.
 *
 * SETUP:
 *   1. This script must be bound to a Google Sheet (Extensions > Apps
 *      Script from inside the Sheet) — that's what lets it find your data.
 *   2. In that Sheet, create a tab named exactly as SHEET_NAME below
 *      (default "URLs") with a header row and two columns:
 *        A: Folder Name    B: Image URL
 *      One row per image. Use the same folder name for every image that
 *      belongs to that group — there's no limit to how many distinct
 *      folder names (groups) you use.
 *   3. Reload the Sheet and use the "Image Downloader" menu that appears,
 *      or run downloadAllImages from the Apps Script editor.
 */

const SHEET_NAME = 'URLs';

// Optional: put a Drive folder ID here to create the group folders inside
// it. Leave blank ('') to create them in "My Drive" root.
const PARENT_FOLDER_ID = '';

/**
 * Entry point: reads every row from SHEET_NAME and downloads its image
 * into the matching folder.
 */
function downloadAllImages() {
  const rows = readUrlRows_();
  if (rows.length === 0) {
    const message =
      'No rows found on the "' + SHEET_NAME + '" tab. Add a header row ' +
      'plus rows of (Folder Name, Image URL) and try again.';
    Logger.log(message);
    notify_(message);
    return [];
  }

  const parent = getOrCreateParentFolder_(PARENT_FOLDER_ID);
  const folderCache = {};
  const results = rows.map((row, index) => {
    const folder = getCachedFolder_(folderCache, parent, row.folderName);
    return downloadOneImage_(row.url, folder, index);
  });

  logSummary_(results);
  notify_(summaryMessage_(results));
  return results;
}

/**
 * Reads all data rows (skipping the header) from SHEET_NAME as
 * { folderName, url } objects, skipping blank rows.
 */
function readUrlRows_() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) {
    throw new Error(
      'No tab named "' + SHEET_NAME + '" found in this spreadsheet. ' +
      'Create it with columns: Folder Name | Image URL.'
    );
  }

  const values = sheet.getDataRange().getValues();
  const dataRows = values.slice(1); // skip header row

  return dataRows
    .map((r) => ({ folderName: String(r[0] || '').trim(), url: String(r[1] || '').trim() }))
    .filter((r) => r.folderName && r.url);
}

function getOrCreateParentFolder_(parentFolderId) {
  if (parentFolderId) {
    return DriveApp.getFolderById(parentFolderId);
  }
  return DriveApp.getRootFolder();
}

function getCachedFolder_(cache, parent, name) {
  if (!cache[name]) {
    cache[name] = getOrCreateFolder_(parent, name);
  }
  return cache[name];
}

function getOrCreateFolder_(parent, name) {
  const existing = parent.getFoldersByName(name);
  if (existing.hasNext()) {
    return existing.next();
  }
  return parent.createFolder(name);
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
