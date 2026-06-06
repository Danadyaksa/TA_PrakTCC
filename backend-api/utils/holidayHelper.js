const db = require('../db');
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

  const holidaysMap = new Map();

  try {
    console.log(`[Holiday Service] Fetching holidays from API for ${cacheKey}...`);
    
    const url = `https://api-hari-libur.vercel.app/api?year=${year}&month=${month}`;
    const response = await fetch(url);
    
    if (response.ok) {
      const result = await response.json();
      if (result.status === 'success' && Array.isArray(result.data)) {
        result.data.forEach(item => {
          if (item.date && item.description) {
            // Format of item.date is 'YYYY-MM-DD'
            holidaysMap.set(item.date, item.description);
          }
        });
      }
    }
  } catch (error) {
    console.error(`[Holiday Service] Failed to fetch holidays from API for ${cacheKey}:`, error);
  }

  try {
    const dbHolidays = await db.query(
      `SELECT holiday_date, description FROM holidays 
       WHERE EXTRACT(YEAR FROM holiday_date) = $1 
         AND EXTRACT(MONTH FROM holiday_date) = $2`,
      [year, month]
    );

    for (const h of dbHolidays.rows) {
      const dateStr = new Date(h.holiday_date).toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
      holidaysMap.set(dateStr, h.description);
    }
  } catch (error) {
    console.error(`[Holiday Service] Failed to fetch custom holidays from DB for ${cacheKey}:`, error);
  }

  // Store in cache
  holidaysCache[cacheKey] = holidaysMap;
  console.log(`[Holiday Service] Cached ${holidaysMap.size} holidays (including custom) for ${cacheKey}`);
  return holidaysMap;
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

/**
 * Clear the holidays cache when data changes.
 */
const clearHolidaysCache = () => {
  for (const key in holidaysCache) {
    delete holidaysCache[key];
  }
  console.log('[Holiday Service] Holidays cache cleared.');
};

module.exports = {
  getHolidaysMap,
  checkHoliday,
  clearHolidaysCache
};
