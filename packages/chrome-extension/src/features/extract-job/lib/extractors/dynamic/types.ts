export interface DynamicExtractorConfig {
  name: string;
  urlPattern: string;
  selectors: {
    title?: string;
    company?: string;
    description?: string;
  };
}
