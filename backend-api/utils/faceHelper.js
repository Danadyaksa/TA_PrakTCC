/**
 * Detect face in an image URL and return its faceId.
 * @param {string} imageUrl 
 * @returns {Promise<string>} faceId
 */
const detectFaceId = async (imageUrl) => {
  const endpoint = process.env.AZURE_FACE_ENDPOINT;
  const key = process.env.AZURE_FACE_KEY;

  if (!endpoint || !key) {
    throw new Error('Azure Face API credentials not configured in environment variables.');
  }

  // Clean trailing slash of endpoint if present
  const baseEndpoint = endpoint.replace(/\/$/, '');
  const url = `${baseEndpoint}/face/v1.0/detect?returnFaceId=true&recognitionModel=recognition_04&detectionModel=detection_03`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': key,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ url: imageUrl })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Azure Face Detect API error: ${response.status} - ${errorBody}`);
  }

  const result = await response.json();
  if (!Array.isArray(result) || result.length === 0) {
    throw new Error('Wajah tidak terdeteksi di dalam foto. Pastikan wajah terlihat jelas dan tegak menghadap kamera.');
  }

  return result[0].faceId;
};

/**
 * Verify if two face images belong to the same person.
 * @param {string} registeredFaceUrl - The URL of the registered reference photo
 * @param {string} capturedFaceUrl - The URL of the captured check-in/out selfie
 * @returns {Promise<{isMatch: boolean, confidence: number}>}
 */
const verifyFaces = async (registeredFaceUrl, capturedFaceUrl) => {
  try {
    const endpoint = process.env.AZURE_FACE_ENDPOINT;
    const key = process.env.AZURE_FACE_KEY;

    if (!endpoint || !key || key === 'bypass' || process.env.FACE_VERIFICATION_BYPASS === 'true') {
      console.log('[Face Helper] [BYPASS] Berjalan dalam Mode Simulasi Wajah (Mock). Wajah otomatis dinyatakan cocok!');
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulasi delay loading API
      return {
        isMatch: true,
        confidence: 0.95
      };
    }

    console.log('[Face Helper] Detecting face in reference photo...');
    const faceId1 = await detectFaceId(registeredFaceUrl);
    
    console.log('[Face Helper] Detecting face in selfie...');
    const faceId2 = await detectFaceId(capturedFaceUrl);

    const baseEndpoint = endpoint.replace(/\/$/, '');
    const verifyUrl = `${baseEndpoint}/face/v1.0/verify`;

    console.log('[Face Helper] Comparing faces...');
    const response = await fetch(verifyUrl, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': key,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ faceId1, faceId2 })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Azure Face Verify API error: ${response.status} - ${errorBody}`);
    }

    const result = await response.json();
    console.log('[Face Helper] Verification result:', result);

    // Azure defaults to confidence >= 0.5 or 0.6 for same-person verification.
    // We will consider it a match if isIdentical is true, or confidence is >= 0.55.
    return {
      isMatch: result.isIdentical || (result.confidence >= 0.55),
      confidence: result.confidence
    };
  } catch (error) {
    console.error('[Face Helper] Error during face verification:', error);
    throw error;
  }
};

module.exports = {
  verifyFaces
};
