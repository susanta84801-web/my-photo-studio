/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  thumbnailLink?: string;
  webViewLink?: string;
  webContentLink?: string;
  size?: string;
  modifiedTime?: string;
  iconLink?: string;
}

/**
 * List image files accessible in user's Google Drive
 */
export async function listDriveImages(accessToken: string, searchQuery = ''): Promise<DriveFile[]> {
  let q = "mimeType contains 'image/' and trashed = false";
  if (searchQuery.trim()) {
    const sanitized = searchQuery.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    q += ` and name contains '${sanitized}'`;
  }

  const params = new URLSearchParams({
    q,
    fields: 'files(id, name, mimeType, thumbnailLink, webViewLink, webContentLink, size, modifiedTime, iconLink)',
    orderBy: 'modifiedTime desc',
    pageSize: '50',
  });

  const response = await fetch(`https://www.googleapis.com/drive/v3/files?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData?.error?.message || `Failed to fetch files from Google Drive (Status ${response.status})`
    );
  }

  const data = await response.json();
  return data.files || [];
}

/**
 * Download the binary image blob from Google Drive for editing
 */
export async function downloadDriveImageBlob(accessToken: string, fileId: string): Promise<Blob> {
  const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData?.error?.message || `Failed to download file from Google Drive (Status ${response.status})`
    );
  }

  return await response.blob();
}

/**
 * Upload an edited photo blob to Google Drive using multipart upload
 */
export async function uploadImageToDrive(
  accessToken: string,
  fileName: string,
  imageBlob: Blob,
  folderId?: string
): Promise<{ id: string; name: string; webViewLink?: string }> {
  const metadata: Record<string, unknown> = {
    name: fileName,
    mimeType: imageBlob.type || 'image/png',
  };

  if (folderId) {
    metadata.parents = [folderId];
  }

  const boundary = '-------PhotoStudioMultipartBoundary98765';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const metadataPart =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata);

  const mediaPartHeader =
    delimiter + `Content-Type: ${imageBlob.type || 'image/png'}\r\n\r\n`;

  const arrayBuffer = await imageBlob.arrayBuffer();

  const multipartBody = new Blob(
    [
      metadataPart,
      mediaPartHeader,
      new Uint8Array(arrayBuffer),
      closeDelimiter,
    ],
    { type: `multipart/related; boundary=${boundary}` }
  );

  const response = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartBody,
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData?.error?.message || `Failed to save image to Google Drive (Status ${response.status})`
    );
  }

  return await response.json();
}
