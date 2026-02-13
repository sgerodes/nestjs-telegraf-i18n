import { Context as TelegrafContext } from "telegraf";
import { I18nContext, Path, PathValue, TranslateOptions } from "nestjs-i18n";
import { Logger } from "@nestjs/common";

export class TelegrafI18nContext<
  K = Record<string, unknown>,
> extends TelegrafContext {
  private readonly logger = new Logger(this.constructor.name);
  protected _i18n?: I18nContext<K>;

  i18n(): I18nContext<K> | undefined {
    return this._i18n;
  }

  setI18n(i18n: I18nContext<K>) {
    this._i18n = i18n;
  }

  /**
   * Translates the given key using the current i18n context.
   * Falls back to returning the key as a string if i18n is not initialized.
   *
   * @param key - The translation key path.
   * @param options - Optional translation options.
   * @returns The translated value or the key itself.
   */
  public t<P extends Path<K>, R = PathValue<K, P>>(
    key: P,
    options?: TranslateOptions,
  ): R | string {
    if (!this._i18n) {
      this.logger.warn(
        `i18n was not initialized for this Telegraf context. Cannot translate key='${key}'`,
      );
      return key as string; // Fallback: Return the key itself
    }
    return this._i18n.translate<P, R>(key, options);
  }

  /**
   * Alias for `t()`. Translates the given key using the current i18n context.
   */
  public translate<P extends Path<K>, R = PathValue<K, P>>(
    key: P,
    options?: TranslateOptions,
  ): R | string {
    return this.t<P, R>(key, options);
  }

  /**
   * Translates the given key and sends it as a reply message using `ctx.reply`.
   *
   * @param key - The translation key path.
   * @param options - Optional translation and reply options.
   */
  public async tReply<P extends Path<K>, R = PathValue<K, P>>(
    key: P,
    options?: TranslateOptions & {
      replyOptions?: Parameters<TelegrafContext["reply"]>[1];
    },
  ): Promise<void> {
    const message = this.t<P, R>(key, options);
    await this.reply(String(message), options?.replyOptions);
  }

  /**
   * Alias for `tReply()`. Translates the given key and sends it as a reply message using `ctx.reply`.
   */
  public async replyWithTranslation<P extends Path<K>, R = PathValue<K, P>>(
    key: P,
    options?: TranslateOptions & {
      replyOptions?: Parameters<TelegrafContext["reply"]>[1];
    },
  ): Promise<void> {
    return this.tReply<P, R>(key, options);
  }
}
