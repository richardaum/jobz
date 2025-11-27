import { logger } from "@/shared/utils/logger";

import { BaseJobExtractor } from "./extractors/base/base-extractor";
import { DynamicExtractor } from "./extractors/dynamic/dynamic-extractor";
import { GenericExtractor } from "./extractors/generic/generic-extractor";
import { LinkedInCollectionExtractor } from "./extractors/linkedin/linkedin-collection-extractor";
import { LinkedInExtractor } from "./extractors/linkedin/linkedin-extractor";

export class JobExtractorFactory {
  public static readonly ACTION = "extractJob";
  private extractors: BaseJobExtractor[];

  constructor() {
    // Order matters: more specific extractors first
    this.extractors = [
      new LinkedInCollectionExtractor(), // Collections before general LinkedIn
      new LinkedInExtractor(), // jobs/view pages
      new DynamicExtractor(), // User-configured extractors
      new GenericExtractor(), // Fallback
    ];
  }

  getExtractor(url: string): BaseJobExtractor {
    for (const extractor of this.extractors) {
      // Skip disabled extractors
      if (!extractor.isEnabled()) {
        const extractorName = extractor.constructor.name;
        logger.debug(`[JobExtractorFactory] Skipping disabled extractor: ${extractorName}`);
        continue;
      }

      if (extractor.canExtract(url)) {
        const extractorName = extractor.constructor.name;
        logger.info(`[JobExtractorFactory] Selected extractor: ${extractorName} for URL: ${url}`);
        return extractor;
      }
    }

    // Fallback: try to find any enabled extractor (even if it doesn't match the URL pattern)
    // This ensures we always return an extractor if at least one is enabled
    for (const extractor of this.extractors) {
      if (extractor.isEnabled()) {
        const extractorName = extractor.constructor.name;
        logger.warn(
          `[JobExtractorFactory] No matching extractor found for URL: ${url}, using enabled extractor: ${extractorName}`
        );
        return extractor;
      }
    }

    // Last resort: if all extractors are disabled, throw an error
    throw new Error("No extractors are enabled. Please enable at least one extractor in the JobExtractorFactory.");
  }
}
