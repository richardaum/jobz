import type { JobDescription } from "@/entities/job";
import type { MatchResult } from "@/features/match-job";

const CACHE_STORAGE_KEY = "job_match_cache";
const CACHE_VERSION = 2; // Incremented to trigger migration

interface CachedMatchResult {
  result: MatchResult;
  cachedAt: number;
  version: number;
}

interface MatchCache {
  [key: string]: CachedMatchResult;
}

/**
 * Extract job ID from URL based on source
 * Returns a string identifier for the job, or null if extraction fails
 */
function extractJobId(job: JobDescription): string | null {
  const url = job.url;

  switch (job.source) {
    case "linkedin": {
      // LinkedIn URLs can be:
      // - linkedin.com/jobs/view/{jobID}
      // - linkedin.com/jobs/view/{jobID}?...
      // - linkedin.com/jobs/collection/{collectionID}/?currentJobId={jobID}
      const viewMatch = url.match(/linkedin\.com\/jobs\/view\/(\d+)/);
      if (viewMatch) {
        return viewMatch[1];
      }

      // Try to extract from currentJobId parameter
      try {
        const urlObj = new URL(url);
        const currentJobId = urlObj.searchParams.get("currentJobId");
        if (currentJobId) {
          return currentJobId;
        }
      } catch {
        // URL might be malformed, continue with other methods
      }

      // Fallback: try to extract any numeric ID from the path
      const pathMatch = url.match(/\/jobs\/[^/]+\/(\d+)/);
      if (pathMatch) {
        return pathMatch[1];
      }

      return null;
    }

    case "indeed": {
      // Indeed URLs: indeed.com/viewjob?jk={jobID}
      const jkMatch = url.match(/[?&]jk=([^&]+)/);
      if (jkMatch) {
        return jkMatch[1];
      }
      return null;
    }

    case "glassdoor": {
      // Glassdoor URLs: glassdoor.com/job-listing/{jobID}
      const match = url.match(/job-listing\/([^/?]+)/);
      if (match) {
        return match[1];
      }
      return null;
    }

    case "generic":
    default: {
      // For generic sources, first try LinkedIn-specific patterns
      // (in case a LinkedIn URL was incorrectly marked as generic)
      if (url.includes("linkedin.com/jobs")) {
        const viewMatch = url.match(/linkedin\.com\/jobs\/view\/(\d+)/);
        if (viewMatch) {
          return viewMatch[1];
        }

        // Try to extract from currentJobId parameter (for search/collection pages)
        try {
          const urlObj = new URL(url);
          const currentJobId = urlObj.searchParams.get("currentJobId");
          if (currentJobId) {
            return currentJobId;
          }
        } catch {
          // URL might be malformed, continue with other methods
        }
      }

      // Try to extract any ID from URL
      // Look for common patterns like /jobs/{id}, /job/{id}, etc.
      const patterns = [
        /\/jobs\/([^/?]+)/,
        /\/job\/([^/?]+)/,
        /[?&]id=([^&]+)/,
        /[?&]jobId=([^&]+)/,
        /[?&]job_id=([^&]+)/,
        /[?&]currentJobId=([^&]+)/, // Also try currentJobId for generic
      ];

      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) {
          return match[1];
        }
      }

      // Last resort: use a hash of the URL
      return hashString(url);
    }
  }
}

/**
 * Simple hash function for string
 */
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Normalize source based on URL if source is generic
 * This helps migrate old cache entries that were incorrectly marked as generic
 */
function normalizeSource(job: JobDescription): JobDescription["source"] {
  // If source is already specific, use it
  if (job.source !== "generic") {
    return job.source;
  }

  // Try to detect the actual source from URL
  const url = job.url.toLowerCase();
  if (url.includes("linkedin.com/jobs")) {
    return "linkedin";
  }
  if (url.includes("indeed.com")) {
    return "indeed";
  }
  if (url.includes("glassdoor.com")) {
    return "glassdoor";
  }

  return "generic";
}

/**
 * Generate a cache key based on source and job ID
 * Format: {source}:{jobID}
 * The source is normalized to handle cases where generic extractor was used for known sources
 */
function generateCacheKey(job: JobDescription): string {
  const normalizedSource = normalizeSource(job);
  const normalizedJob = { ...job, source: normalizedSource };
  const jobId = extractJobId(normalizedJob);

  if (jobId) {
    return `${normalizedSource}:${jobId}`;
  }

  // Fallback: if we can't extract an ID, use source and URL hash
  const urlHash = hashString(job.url);
  return `${normalizedSource}:${urlHash}`;
}

/**
 * Migrate old cache keys to new format
 * Old format: {url}|{hash}
 * New format: {source}:{jobID}
 */
async function migrateCache(oldCache: MatchCache): Promise<MatchCache> {
  const newCache: MatchCache = {};
  let migrated = false;

  for (const [oldKey, cachedValue] of Object.entries(oldCache)) {
    // Check if this is an old format key (contains |)
    if (oldKey.includes("|")) {
      // Try to extract job info from the cached result
      const job = cachedValue.result.job;
      const newKey = generateCacheKey(job);

      // Only migrate if we have a valid new key and it's not already in the new cache
      if (newKey && !newCache[newKey]) {
        newCache[newKey] = {
          ...cachedValue,
          version: CACHE_VERSION, // Update version
        };
        migrated = true;
      }
    } else {
      // Already in new format, but check if source needs normalization
      const job = cachedValue.result.job;
      const normalizedSource = normalizeSource(job);

      // If source was normalized, regenerate the key
      if (normalizedSource !== job.source) {
        const newKey = generateCacheKey(job);
        // Only migrate if the new key is different and not already in cache
        if (newKey !== oldKey && !newCache[newKey]) {
          // Update job source in cached result
          const updatedResult = {
            ...cachedValue.result,
            job: { ...job, source: normalizedSource },
          };
          newCache[newKey] = {
            ...cachedValue,
            result: updatedResult,
            version: CACHE_VERSION,
          };
          migrated = true;
        } else if (newKey === oldKey) {
          // Key is the same but source was normalized, update the job in cache
          const updatedResult = {
            ...cachedValue.result,
            job: { ...job, source: normalizedSource },
          };
          newCache[oldKey] = {
            ...cachedValue,
            result: updatedResult,
            version: CACHE_VERSION,
          };
          migrated = true;
        } else {
          // New key already exists, keep the existing one
          newCache[oldKey] = cachedValue;
        }
      } else if (cachedValue.version !== CACHE_VERSION) {
        // Source is correct, just update version if needed
        newCache[oldKey] = {
          ...cachedValue,
          version: CACHE_VERSION,
        };
        migrated = true;
      } else {
        newCache[oldKey] = cachedValue;
      }
    }
  }

  // Save migrated cache if changes were made
  if (migrated) {
    await saveCache(newCache);
  }

  return newCache;
}

/**
 * Load cache from storage
 */
async function loadCache(): Promise<MatchCache> {
  return new Promise((resolve) => {
    chrome.storage.local.get([CACHE_STORAGE_KEY], async (result) => {
      const cache = result[CACHE_STORAGE_KEY] as MatchCache | undefined;
      if (cache) {
        // Migrate old cache format if needed
        const migratedCache = await migrateCache(cache);

        // Clean up old cache entries (older than 30 days)
        const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
        const cleanedCache: MatchCache = {};
        for (const [key, value] of Object.entries(migratedCache)) {
          if (value.cachedAt > thirtyDaysAgo && value.version === CACHE_VERSION) {
            cleanedCache[key] = value;
          }
        }

        // Save cleaned cache if entries were removed
        if (Object.keys(cleanedCache).length !== Object.keys(migratedCache).length) {
          await saveCache(cleanedCache);
        }

        resolve(cleanedCache);
      } else {
        resolve({});
      }
    });
  });
}

/**
 * Save cache to storage
 */
async function saveCache(cache: MatchCache): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ [CACHE_STORAGE_KEY]: cache }, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve();
      }
    });
  });
}

/**
 * Get cached match result for a job
 */
export async function getCachedMatch(job: JobDescription): Promise<MatchResult | null> {
  const cache = await loadCache();
  const key = generateCacheKey(job);
  const cached = cache[key];

  if (cached && cached.version === CACHE_VERSION) {
    return cached.result;
  }

  return null;
}

/**
 * Save match result to cache
 */
export async function saveMatchToCache(result: MatchResult): Promise<void> {
  const cache = await loadCache();
  const key = generateCacheKey(result.job);
  cache[key] = {
    result,
    cachedAt: Date.now(),
    version: CACHE_VERSION,
  };
  await saveCache(cache);
}

/**
 * Clear cached match for a specific job
 */
export async function clearCachedMatch(job: JobDescription): Promise<void> {
  const cache = await loadCache();
  const key = generateCacheKey(job);
  delete cache[key];
  await saveCache(cache);
}

/**
 * Clear all cached matches
 */
export async function clearAllCachedMatches(): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.remove([CACHE_STORAGE_KEY], () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve();
      }
    });
  });
}
