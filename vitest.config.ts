import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: [
        "src/domain/**",
        "src/application/subscription-service.ts",
        "src/infrastructure/http/json-error.ts",
        "src/infrastructure/ai/heuristic-judge.ts",
        "src/lib/**",
      ],
      exclude: ["**/*.test.ts", "src/domain/catalog.ts", "src/infrastructure/billing/**", "src/infrastructure/db/**", "src/infrastructure/auth/**"],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
