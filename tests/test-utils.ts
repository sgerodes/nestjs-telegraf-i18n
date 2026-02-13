import { Logger } from "@nestjs/common";
import { TelegrafI18nContext } from "../src/telegraf-i18n.context";

/**
 * Silences NestJS logger for the duration of the callback.
 */
export async function silenced<T>(fn: () => T | Promise<T>): Promise<T> {
  const warnSpy = jest.spyOn(Logger.prototype, "warn").mockImplementation();
  const logSpy = jest.spyOn(Logger.prototype, "log").mockImplementation();
  try {
    return await fn();
  } finally {
    warnSpy.mockRestore();
    logSpy.mockRestore();
  }
}

export interface MinimalTelegrafI18nContextOverrides {
  language_code?: string;
}

/**
 * Creates a minimal TelegrafI18nContext instance for tests.
 * Uses the smallest valid update/telegram/botInfo required by Telegraf Context.
 */
export function createMinimalTelegrafI18nContext(
  overrides?: MinimalTelegrafI18nContextOverrides,
): TelegrafI18nContext {
  const update = {
    update_id: 1,
    message: {
      message_id: 1,
      date: 1,
      chat: { id: 1, type: "private" as const, first_name: "Chat" },
      from: {
        id: 1,
        is_bot: false,
        first_name: "Test",
        language_code: overrides?.language_code ?? "en",
      },
      text: "hi",
    },
  } as any;
  const telegram = {} as any;
  const botInfo = { id: 1, is_bot: true, first_name: "Bot", username: "bot" } as any;
  return new TelegrafI18nContext(update, telegram, botInfo);
}

/**
 * Creates a minimal I18nService-like object for testing middleware.
 */
export function createMockI18nService(fallbackLanguage?: string) {
  return {
    i18nOptions: { fallbackLanguage: fallbackLanguage ?? "en" },
  } as any;
}
