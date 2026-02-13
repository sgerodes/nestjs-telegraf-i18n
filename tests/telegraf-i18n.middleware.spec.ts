import { I18nContext } from "nestjs-i18n";
import { TelegrafI18nContext } from "../src";
import { TelegrafI18nMiddlewareProvider } from "../src";
import {
  createMinimalTelegrafI18nContext,
  createMockI18nService,
} from "./test-utils";

describe("TelegrafI18nMiddlewareProvider", () => {
  it("calls next() when ctx is not TelegrafI18nContext", async () => {
    const i18nService = createMockI18nService();
    const provider = new TelegrafI18nMiddlewareProvider(i18nService);
    const ctx = { from: { language_code: "en" } } as any;
    const next = jest.fn().mockResolvedValue(undefined);

    await provider.telegrafI18nMiddleware(ctx, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(ctx.setI18n).toBeUndefined();
  });

  it("sets i18n and calls next() when ctx is TelegrafI18nContext", async () => {
    const i18nService = createMockI18nService();
    const provider = new TelegrafI18nMiddlewareProvider(i18nService);
    const ctx = createMinimalTelegrafI18nContext({ language_code: "uk" });
    const next = jest.fn().mockResolvedValue(undefined);

    await provider.telegrafI18nMiddleware(ctx, next);

    expect(ctx.i18n()).toBeDefined();
    expect(ctx.i18n()).toBeInstanceOf(I18nContext);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("uses ctx.from.language_code for I18nContext language", async () => {
    const i18nService = createMockI18nService("de");
    const provider = new TelegrafI18nMiddlewareProvider(i18nService);
    const ctx = createMinimalTelegrafI18nContext({ language_code: "fr" });
    const next = jest.fn().mockResolvedValue(undefined);

    await provider.telegrafI18nMiddleware(ctx, next);

    const i18n = ctx.i18n();
    expect(i18n).toBeDefined();
    expect(i18n!.lang).toBe("fr");
  });

  it("uses fallbackLanguage when ctx.from is missing", async () => {
    const i18nService = createMockI18nService("de");
    const provider = new TelegrafI18nMiddlewareProvider(i18nService);
    const update = {
      update_id: 1,
      message: {
        message_id: 1,
        date: 1,
        chat: { id: 1, type: "private" as const, first_name: "Chat" },
        text: "hi",
      },
    } as any;
    const telegram = {} as any;
    const botInfo = { id: 1, is_bot: true, first_name: "Bot", username: "bot" } as any;
    const ctx = new TelegrafI18nContext(update, telegram, botInfo);
    const next = jest.fn().mockResolvedValue(undefined);

    await provider.telegrafI18nMiddleware(ctx, next);

    const i18n = ctx.i18n();
    expect(i18n).toBeDefined();
    expect(i18n!.lang).toBe("de");
  });

  it("uses 'en' when no language and no fallbackLanguage", async () => {
    const i18nService = { i18nOptions: {} } as any;
    const provider = new TelegrafI18nMiddlewareProvider(i18nService);
    const update = {
      update_id: 1,
      message: {
        message_id: 1,
        date: 1,
        chat: { id: 1, type: "private" as const, first_name: "Chat" },
        text: "hi",
      },
    } as any;
    const telegram = {} as any;
    const botInfo = { id: 1, is_bot: true, first_name: "Bot", username: "bot" } as any;
    const ctx = new TelegrafI18nContext(update, telegram, botInfo);
    const next = jest.fn().mockResolvedValue(undefined);

    await provider.telegrafI18nMiddleware(ctx, next);

    const i18n = ctx.i18n();
    expect(i18n).toBeDefined();
    expect(i18n!.lang).toBe("en");
  });
});
