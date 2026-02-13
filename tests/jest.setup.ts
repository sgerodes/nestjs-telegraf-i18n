import { Logger } from "@nestjs/common";

// Silence NestJS logger during tests unless DEBUG_TESTS is set
if (!process.env.DEBUG_TESTS) {
  Logger.overrideLogger([]);
}
