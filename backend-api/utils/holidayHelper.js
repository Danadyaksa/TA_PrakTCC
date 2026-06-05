const holidaysCache = {}; // Key: YYYY-MM (e.g., '2026-06'), Value: Map of 'YYYY-MM-DD' -> description

/**
 * Fetch holidays for a specific year and month and cache them.
 * @param {number} year 
 * @param {number} month (1-12)
 * @returns {Promise<Map<string, string>>} Map of date string 'YYYY-MM-DD' to holiday description
 */
const getHolidaysMap = async (year, month) => {
  const cacheKey = `${year}-${String(month).padStart(2, '0')}`;
  if (holidaysCache[cacheKey]) {
    return holidaysCache[cacheKey];
  }

  try {
    console.log(`[Holiday Service] Fetching holidays from API for ${cacheKey}...`);
    
    // Call the Indonesian holiday API (supports year and month parameters)
    const url = `https://api-hari-libur.vercel.app/api?year=${year}&month=${month}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    const holidaysMap = new Map();
    
    if (result.status === 'success' && Array.isArray(result.data)) {
      result.data.forEach(item => {
        if (item.date && item.description) {
          // Format of item.date is 'YYYY-MM-DD'
          holidaysMap.set(item.date, item.description);
        }
      });
    }
    
    // Store in cache
    holidaysCache[cacheKey] = holidaysMap;
    console.log(`[Holiday Service] Cached ${holidaysMap.size} holidays for ${cacheKey}`);
    return holidaysMap;
  } catch (error) {
    console.error(`[Holiday Service] Failed to fetch holidays for ${cacheKey}:`, error);
    // Return empty map on failure to avoid crashing the server
    return new Map();
  }
};

/**
 * Check if a date string is a national holiday.
 * @param {string} dateString (format: 'YYYY-MM-DD')
 * @returns {Promise<{isHoliday: boolean, description: string|null}>}
 */
const checkHoliday = async (dateString) => {
  const parts = dateString.split('-');
  if (parts.length !== 3) {
    return { isHoliday: false, description: null };
  }
  
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  
  const holidaysMap = await getHolidaysMap(year, month);
  const isHoliday = holidaysMap.has(dateString);
  const description = isHoliday ? holidaysMap.get(dateString) : null;
  
  return { isHoliday, description };
};

module.exports = {
  getHolidaysMap,
  checkHoliday
};
