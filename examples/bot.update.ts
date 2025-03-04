import { Ctx, Start, Update } from 'nestjs-telegraf';
import { TelegrafI18nContext } from '../src';
// import { TelegrafI18nContext } from 'nestjs-telegraf-i18n';

@Update()
export class BotUpdate {
  @Start()
  async start_command(@Ctx() ctx: TelegrafI18nContext) {
    const internationalized_message = ctx.t("i18n.menus.hello.message");
    await ctx.reply(internationalized_message);
  }
}