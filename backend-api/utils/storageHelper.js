/**
 * Upload a file buffer to Imgbb and return its public URL.
 * @param {Buffer} fileBuffer 
 * @param {string} destPath - Ignored in Imgbb, kept for signature compatibility
 * @param {string} mimeType - Ignored in Imgbb, kept for signature compatibility
 * @returns {Promise<string>} Public HTTPS URL of the uploaded file
 */
const uploadToStorage = async (fileBuffer, destPath, mimeType) => {
  try {
    const apiKey = process.env.IMGBB_API_KEY || '9a7b317f28e59c3a79b08fadd336a078';
    const base64Image = fileBuffer.toString('base64');

    console.log(`[Storage Helper] Uploading file to Imgbb...`);
    
    const body = new URLSearchParams();
    body.append('image', base64Image);

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: body.toString()
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Imgbb upload failed with status ${response.status}: ${errorBody}`);
    }

    const result = await response.json();
    if (result && result.data && result.data.url) {
      console.log(`[Storage Helper] Successfully uploaded to Imgbb: ${result.data.url}`);
      return result.data.url;
    } else {
      throw new Error(result.error ? result.error.message : 'Unknown Imgbb upload error');
    }
  } catch (error) {
    console.error('[Storage Helper] Error uploading to Imgbb:', error);
    throw error;
  }
};

module.exports = {
  uploadToStorage
};
