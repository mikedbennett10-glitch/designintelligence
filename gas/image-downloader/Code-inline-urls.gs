/**
 * Image Downloader — Google Apps Script (inline URLs variant)
 *
 * Downloads images from URLs hardcoded below into existing Google Drive
 * folders, identified by folder ID. Fill in each group's `urls` array,
 * then run downloadAllImages (Apps Script editor toolbar, or the "Image
 * Downloader" menu if this is bound to a Sheet).
 *
 * Note: this variant does NOT need to be bound to a Sheet — it can be a
 * standalone script at script.google.com.
 */

const CONFIG = {
  groups: [
    {
      folderId: '1lQtL5a95Mrgr-AMv3YmPolgXpvHqYYDe',
      urls: [
        // 'https://example.com/image1.jpg',
        // 'https://example.com/image2.png',
      ],
    },
    {
      folderId: '1YsxWTyK4cJZdSOIET9aSak0duM7C4vkF',
      urls: [],
    },
    {
      folderId: '1IeoOtW1KZOUsvREp0rNwbFF4myj5hhdD',
      urls: [],
    },
    {
      folderId: '1_J6HUFS7SYDyctAu5vz8C5HXYLKOsqg5',
      urls: [],
    },
    {
      folderId: '1ggB_7AXDblE9sqpUUVVKBtkSsa5vUwA1',
      urls: [],
    },
    {
      folderId: '1tcO9TUzKDbDRKTlgI2nyZTVDCZKL0Uvs',
      urls: [],
    },
  ],
};

/**
 * Entry point: downloads every URL in CONFIG.groups into its Drive folder.
 */
function downloadAllImages() {
  const results = [];

  CONFIG.groups.forEach((group) => {
    let folder;
    try {
      folder = DriveApp.getFolderById(group.folderId);
    } catch (err) {
      group.urls.forEach((url) => {
        results.push({ url: url, folder: group.folderId, status: 'error', error: 'Invalid Folder ID: ' + group.folderId });
      });
      return;
    }
    group.urls.forEach((url, index) => {
      results.push(downloadOneImage_(url, folder, index));
    });
  });

  logSummary_(results);
  notify_(summaryMessage_(results));
  return results;
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
    return { url: url, folder: folder.getName ? folder.getName() : String(folder), status: 'error', error: String(err) };
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
 * when run from the Apps Script editor with no active UI, or standalone.
 */
function notify_(message) {
  try {
    SpreadsheetApp.getUi().alert(message);
  } catch (err) {
    Logger.log(message);
  }
}

/**
 * Optional: adds a custom menu when the script is bound to a Google Sheet.
 */
function onOpen() {
  try {
    SpreadsheetApp.getUi()
      .createMenu('Image Downloader')
      .addItem('Download all images', 'downloadAllImages')
      .addToUi();
  } catch (err) {
    // Not bound to a Sheet — no menu to add.
  }
}
