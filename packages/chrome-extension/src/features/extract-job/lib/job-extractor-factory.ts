import { logger } from "@/shared/utils/logger";

import { BaseJobExtractor } from "./extractors/base-extractor";
import { GenericExtractor } from "./extractors/generic-extractor";
import { LinkedInCollectionExtractor } from "./extractors/linkedin-collection-extractor";
import { LinkedInExtractor } from "./extractors/linkedin-extractor";

export class JobExtractorFactory {
  private extractors: BaseJobExtractor[];

  constructor() {
    // Order matters: more specific extractors first
    this.extractors = [
      new LinkedInCollectionExtractor(), // Collections before general LinkedIn
      new LinkedInExtractor(), // jobs/view pages
      new GenericExtractor(), // Fallback
    ];
  }

  getExtractor(url: string): BaseJobExtractor {
    for (const extractor of this.extractors) {
      if (extractor.canExtract(url)) {
        const extractorName = extractor.constructor.name;
        logger.info(`[JobExtractorFactory] Selected extractor: ${extractorName} for URL: ${url}`);
        return extractor;
      }
    }
    // Fallback to generic extractor
    logger.warn(`[JobExtractorFactory] No specific extractor found, using GenericExtractor for URL: ${url}`);
    return new GenericExtractor();
  }
}
