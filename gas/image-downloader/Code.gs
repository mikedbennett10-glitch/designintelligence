/**
 * Image Downloader — Google Apps Script
 *
 * Downloads images from URLs and saves them into Google Drive folders,
 * organized into groups. Fill in CONFIG below, then run from the
 * "Image Downloader" menu (open the bound Sheet, or run downloadAllImages
 * directly from the Apps Script editor).
 */

const CONFIG = {
  // Optional: put a Drive folder ID here to create the 6 group folders
  // inside it. Leave blank ('') to create them in "My Drive" root.
  parentFolderId: '',

  groups: [
    {
      folderName: 'Group 1',
      urls: [
        // 'https://example.com/image1.jpg',
        // 'https://example.com/image2.png',
      ],
    },
    {
      folderName: 'Group 2',
      urls: [],
    },
    {
      folderName: 'Group 3',
      urls: [],
    },
    {
      folderName: 'Group 4',
      urls: [],
    },
    {
      folderName: 'Group 5',
      urls: [],
    },
    {
      folderName: 'Group 6',
      urls: [],
    },
  ],
};

/**
 * Entry point: downloads every URL in CONFIG.groups into its folder.
 */
function downloadAllImages() {
  const parent = getOrCreateParentFolder_(CONFIG.parentFolderId);
  const results = [];

  CONFIG.groups.forEach((group) => {
    const folder = getOrCreateFolder_(parent, group.folderName);
    group.urls.forEach((url, index) => {
      results.push(downloadOneImage_(url, folder, index));
    });
  });

  logSummary_(results);
  return results;
}

function getOrCreateParentFolder_(parentFolderId) {
  if (parentFolderId) {
    return DriveApp.getFolderById(parentFolderId);
  }
  return DriveApp.getRootFolder();
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

function logSummary_(results) {
  const ok = results.filter((r) => r.status === 'ok').length;
  const failed = results.filter((r) => r.status === 'error');

  Logger.log('Downloaded %s of %s images.', ok, results.length);
  failed.forEach((r) => {
    Logger.log('FAILED: %s (%s) — %s', r.url, r.folder, r.error);
  });
}

/**
 * Optional: adds a custom menu when the script is bound to a Google Sheet,
 * so you can trigger the download without opening the Apps Script editor.
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Image Downloader')
    .addItem('Download all images', 'downloadAllImages')
    .addToUi();
}
