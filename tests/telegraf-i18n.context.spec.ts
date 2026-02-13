import { I18nContext } from "nestjs-i18n";
import { createMinimalTelegrafI18nContext } from "./test-utils";

describe("TelegrafI18nContext", () => {
  it("returns the key when i18n is not set", () => {
    const ctx = createMinimalTelegrafI18nContext();
    expect(ctx.t("some.i18n.key")).toBe("some.i18n.key");
  });

  it("returns the key from translate() when i18n is not set", () => {
    const ctx = createMinimalTelegrafI18nContext();
    expect(ctx.translate("another.key")).toBe("another.key");
  });

  it("returns translated value when i18n is set", () => {
    const ctx = createMinimalTelegrafI18nContext();
    const translated = "Translated message";
    const mockI18n = {
      translate: jest.fn().mockReturnValue(translated),
    } as unknown as I18nContext;
    ctx.setI18n(mockI18n);

    expect(ctx.t("menu.hello")).toBe(translated);
    expect(mockI18n.translate).toHaveBeenCalledWith("menu.hello", undefined);
  });

  it("passes options to i18n translate when provided", () => {
    const ctx = createMinimalTelegrafI18nContext();
    const mockI18n = {
      translate: jest.fn().mockReturnValue("With options"),
    } as unknown as I18nContext;
    ctx.setI18n(mockI18n);
    const options = { lang: "uk" };

    ctx.translate("key", options);

    expect(mockI18n.translate).toHaveBeenCalledWith("key", options);
  });

  it("t() is shorthand for translate()", () => {
    const ctx = createMinimalTelegrafI18nContext();
    const mockI18n = {
      translate: jest.fn().mockReturnValue("Same"),
    } as unknown as I18nContext;
    ctx.setI18n(mockI18n);

    expect(ctx.t("key")).toBe("Same");
    expect(ctx.translate("key")).toBe("Same");
    expect(mockI18n.translate).toHaveBeenCalledTimes(2);
  });

  it("i18n() returns undefined when not set", () => {
    const ctx = createMinimalTelegrafI18nContext();
    expect(ctx.i18n()).toBeUndefined();
  });

  it("i18n() returns the set context after setI18n()", () => {
    const ctx = createMinimalTelegrafI18nContext();
    const mockI18n = { translate: jest.fn() } as unknown as I18nContext;
    ctx.setI18n(mockI18n);
    expect(ctx.i18n()).toBe(mockI18n);
  });

  it("replyWithTranslation calls reply with translated message", async () => {
    const ctx = createMinimalTelegrafI18nContext();
    const mockI18n = {
      translate: jest.fn().mockReturnValue("Hello world"),
    } as unknown as I18nContext;
    ctx.setI18n(mockI18n);
    const replySpy = jest.spyOn(ctx, "reply").mockResolvedValue(undefined as any);

    await ctx.replyWithTranslation("greeting.hello");

    expect(mockI18n.translate).toHaveBeenCalledWith("greeting.hello", undefined);
    expect(replySpy).toHaveBeenCalledWith("Hello world", undefined);
  });

  it("replyWithTranslation passes replyOptions to reply", async () => {
    const ctx = createMinimalTelegrafI18nContext();
    const mockI18n = {
      translate: jest.fn().mockReturnValue("Hi"),
    } as unknown as I18nContext;
    ctx.setI18n(mockI18n);
    const replySpy = jest.spyOn(ctx, "reply").mockResolvedValue(undefined as any);
    const replyOptions = { parse_mode: "HTML" as const };

    await ctx.replyWithTranslation("key", { replyOptions });

    expect(replySpy).toHaveBeenCalledWith("Hi", replyOptions);
  });

  it("tReply delegates to replyWithTranslation", async () => {
    const ctx = createMinimalTelegrafI18nContext();
    const mockI18n = {
      translate: jest.fn().mockReturnValue("Bye"),
    } as unknown as I18nContext;
    ctx.setI18n(mockI18n);
    const replySpy = jest.spyOn(ctx, "reply").mockResolvedValue(undefined as any);

    await ctx.tReply("farewell");

    expect(mockI18n.translate).toHaveBeenCalledWith("farewell", undefined);
    expect(replySpy).toHaveBeenCalledWith("Bye", undefined);
  });
});
