import { readFileSync } from "fs";
import { existsSync } from "fs";
import { dirname, join, resolve } from "path";

interface TsConfig {
  compilerOptions?: {
    paths?: Record<string, string[]>;
    baseUrl?: string;
  };
  extends?: string;
}

/**
 * Reads tsconfig.json and extracts path aliases
 * Supports extends and resolves baseUrl
 * @param tsConfigPath - Explicit path to tsconfig.json
 * @param startDir - Directory to start searching from (e.g., directory of file being linted)
 */
export function getTsConfigPaths(tsConfigPath?: string, startDir?: string): string[] {
  const configPath = tsConfigPath || findTsConfig(startDir);
  if (!configPath || !existsSync(configPath)) {
    return [];
  }

  try {
    const config = readTsConfig(configPath);
    const paths = config.compilerOptions?.paths || {};
    const baseUrl = config.compilerOptions?.baseUrl
      ? resolve(dirname(configPath), config.compilerOptions.baseUrl)
      : dirname(configPath);

    // Extract alias prefixes from paths
    // e.g., "@/*" -> "@/"
    const aliases: string[] = [];
    for (const [alias, _targets] of Object.entries(paths)) {
      // Remove the /* suffix if present
      const aliasPrefix = alias.replace(/\/\*$/, "/");
      aliases.push(aliasPrefix);
    }

    return aliases;
  } catch (error) {
    // Silently fail if tsconfig can't be read
    return [];
  }
}

function readTsConfig(configPath: string): TsConfig {
  const content = readFileSync(configPath, "utf-8");
  const config: TsConfig = JSON.parse(content);

  // Handle extends
  if (config.extends) {
    const extendsPath = resolve(dirname(configPath), config.extends);
    if (existsSync(extendsPath)) {
      const baseConfig = readTsConfig(extendsPath);
      // Merge paths, with current config taking precedence
      return {
        ...baseConfig,
        compilerOptions: {
          ...baseConfig.compilerOptions,
          ...config.compilerOptions,
          paths: {
            ...baseConfig.compilerOptions?.paths,
            ...config.compilerOptions?.paths,
          },
        },
      };
    }
  }

  return config;
}

function findTsConfig(startDir?: string): string | null {
  let currentDir = startDir || process.cwd();
  const root = resolve("/");

  while (currentDir !== root) {
    const tsConfigPath = join(currentDir, "tsconfig.json");
    if (existsSync(tsConfigPath)) {
      return tsConfigPath;
    }
    currentDir = dirname(currentDir);
  }

  return null;
}

/**
 * Normalizes a path by removing any configured alias prefixes
 */
export function normalizePath(path: string, aliases: string[]): string {
  let normalized = path.replace(/\\/g, "/");

  // Try each alias in order (longer aliases first to avoid partial matches)
  const sortedAliases = [...aliases].sort((a, b) => b.length - a.length);

  for (const alias of sortedAliases) {
    if (normalized.startsWith(alias)) {
      normalized = normalized.slice(alias.length);
      break;
    }
  }

  return normalized;
}
