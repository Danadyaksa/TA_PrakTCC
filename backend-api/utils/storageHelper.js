const admin = require('firebase-admin');

/**
 * Upload a file buffer to Firebase Storage and return its public URL.
 * @param {Buffer} fileBuffer 
 * @param {string} destPath - e.g., 'selfies/user_1_12345.jpg'
 * @param {string} mimeType - e.g., 'image/jpeg'
 * @returns {Promise<string>} Public HTTPS URL of the uploaded file
 */
const uploadToStorage = async (fileBuffer, destPath, mimeType) => {
  try {
    const bucket = admin.storage().bucket();
    if (!bucket) {
      throw new Error('Firebase Storage bucket not configured. Check storageBucket settings.');
    }
    
    const file = bucket.file(destPath);
    
    // Save buffer
    await file.save(fileBuffer, {
      metadata: {
        contentType: mimeType,
        cacheControl: 'public, max-age=31536000',
      },
    });
    
    // Make public so that external APIs (like Azure Face) can read the image
    await file.makePublic();
    
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;
    console.log(`[Storage Helper] Successfully uploaded and made public: ${publicUrl}`);
    return publicUrl;
  } catch (error) {
    console.error('[Storage Helper] Error uploading to storage:', error);
    throw error;
  }
};

module.exports = {
  uploadToStorage
};
