import { describe, expect, it } from "vitest";

import { env } from "../env";

describe("env", () => {
  it("should have nodeEnv property", () => {
    expect(env.nodeEnv).toBeDefined();
  });

  it("should have isDev property", () => {
    expect(typeof env.isDev).toBe("boolean");
  });

  it("should have isProd property", () => {
    expect(typeof env.isProd).toBe("boolean");
  });

  it("should have correct structure", () => {
    expect(env).toHaveProperty("nodeEnv");
    expect(env).toHaveProperty("isDev");
    expect(env).toHaveProperty("isProd");
    // Verify the logic: isDev should be true when nodeEnv is "development"
    if (env.nodeEnv === "development") {
      expect(env.isDev).toBe(true);
    }
    // Verify the logic: isProd should be true when nodeEnv is "production"
    if (env.nodeEnv === "production") {
      expect(env.isProd).toBe(true);
    }
  });
});
