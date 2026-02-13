# Nestjs Telegraf I18n

![npm](https://img.shields.io/npm/v/nestjs-telegraf-i18n) ![npm](https://img.shields.io/npm/dm/nestjs-telegraf-i18n) ![GitHub stars](https://img.shields.io/github/stars/sgerodes/nestjs-telegraf-i18n) ![Last Commit](https://img.shields.io/github/last-commit/sgerodes/nestjs-telegraf-i18n) ![NPM](https://img.shields.io/npm/l/nestjs-telegraf-i18n)

Seamless integration of [nestjs-telegraf](https://www.npmjs.com/package/nestjs-telegraf) and [nestjs-i18n](https://www.npmjs.com/package/nestjs-i18n).
A middleware that merges both contexts.

```typescript
@Start()
async startCommand(@Ctx() ctx: TelegrafI18nContext) {
    // Translates the message into the user's language automatically
    await ctx.tReply("greeting.hello");
}
```

## Features

- Automatic language detection from Telegram user settings
- Full TypeScript support with type-safe translation keys
- Convenient `t()` and `tReply()` methods on context
- Works with Scenes, Wizards, and custom middlewares
- Compatible with nestjs-i18n's type generation

Install nestjs-telegraf-i18n
```shell
npm i nestjs-telegraf-i18n
```

## Prerequisites
Make sure you have nestjs-telegraf, nestjs-i18n installed
```shell
npm i nestjs-telegraf nestjs-i18n
```

## Set up

### Nestjs-i18n Module
Initialize your I18nModule as you would usually do. 
The [official documentation](https://nestjs-i18n.com/quick-start) provides good tutorials how to do it 

```typescript
@Module({
    imports: [
        I18nModule.forRoot({
            ...
        })
    ],
})
export class AppModule {}
```

### Nestjs-Telegraf Module
- Add TelegrafI18nModule to the imports
- Only async setups for the TelegrafModule are possible. Use TelegrafModule.forRootAsync(...)
- Inject the TelegrafI18nMiddlewareProvider
- Provide to the Telegraf Module the TelegrafI18nContext
- Add the telegrafI18nMiddleware to the middleware array

```typescript
import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { TelegrafI18nModule, TelegrafI18nMiddlewareProvider, TelegrafI18nContext } from 'nestjs-telegraf-i18n';

@Module({
    imports: [
        TelegrafI18nModule,
        TelegrafModule.forRootAsync({
            inject: [TelegrafI18nMiddlewareProvider],
            useFactory: (telegrafI18nMiddlewareProvider: TelegrafI18nMiddlewareProvider) => ({
                token: "<your_bot_token>",
                options: {
                    contextType: TelegrafI18nContext,
                },
                middlewares: [
                    telegrafI18nMiddlewareProvider.telegrafI18nMiddleware,
                ],
            }),
        }),
    ],
})
export class TelegramModule {}
```

## Usage

The middleware injects the i18n object into the Telegraf context with the context-specific language configuration. 

In your function make the ctx type aware that it has the i18n object by providing the type `TelegrafI18nContext`

### Available Methods

| Method | Description |
|--------|-------------|
| `ctx.t(key, options?)` | Translate a key |
| `ctx.translate(key, options?)` | Alias for `t()` |
| `ctx.tReply(key, options?)` | Translate and reply in one call |
| `ctx.replyWithTranslation(key, options?)` | Alias for `tReply()` |
| `ctx.i18n()` | Get the underlying I18nContext |

```typescript
import { Ctx, Start, Update } from 'nestjs-telegraf';
import { TelegrafI18nContext } from 'nestjs-telegraf-i18n';

@Update()
export class BotUpdate {
    @Start()
    async startCommand(@Ctx() ctx: TelegrafI18nContext) {
        // Option 1: Translate and reply separately
        const message = ctx.t("greeting.hello");
        await ctx.reply(message);

        // Option 2: Translate and reply in one call
        await ctx.tReply("greeting.hello");
    }
}
```

If you have multiple Telegraf context types that you want to use, chain them with `&`.

```typescript
import { Command, Ctx, Update } from 'nestjs-telegraf';
import { Scenes } from "telegraf";
import { TelegrafI18nContext } from 'nestjs-telegraf-i18n';

@Update()
export class BotUpdate {
    @Command('hello')
    async helloCommand(@Ctx() ctx: Scenes.WizardContext & TelegrafI18nContext) {
        // You have access to both the WizardContext and TelegrafI18nContext
        await ctx.tReply("greeting.hello");
        await ctx.scene.enter('someScene');
    }
}

```

### Bot injection
If you need to [use the native bot instance](https://nestjs-telegraf.0x467.com/extras/bot-injection.html),
you can still benefit from the injected i18n instance by providing the correct context.

```typescript
import { Telegraf } from "telegraf";
import { InjectBot, Update } from 'nestjs-telegraf';
import { TelegrafI18nContext } from 'nestjs-telegraf-i18n';

@Update()
export class BotUpdate {
    constructor(
        @InjectBot() private readonly bot: Telegraf<TelegrafI18nContext>
    ) {
        this.bot.help((ctx) => {
                const message = ctx.t("i18n.menus.help.message");
                ctx.reply(message)
            }
        )
    }
}
```

## Type Safety

You can use the built in [type safety features from nestjs-i18n](https://nestjs-i18n.com/guides/type-safety)
Follow their instructions to generate the translation types, and you can pass them to the extended context.

```typescript
@Update()
export class BotUpdate {
    @Start()
    async startCommand(@Ctx() ctx: TelegrafI18nContext<I18nTranslations>) {
        // TypeScript will autocomplete and validate your translation keys
        await ctx.tReply("greeting.hello");
    }
}
```

The same applies to native bot injection.
```typescript
@Update()
export class BotUpdate {
    constructor(
        @InjectBot() private readonly bot: Telegraf<TelegrafI18nContext<I18nTranslations>>
    ) {
        this.bot.help((ctx) => {
                const message = ctx.t("i18n.menus.help.message");
                ctx.reply(message)
            }
        )
    }
}
```

## Using nestjs-telegraf-i18n with other telegraf middlewares
If you want to have the access to i18n in your other telegraf middlewares you can easily do that by providing the I18nContext.
Make sure you initialize the i18n middleware (put it first in the array) before the middleware where you want to use it.

E.g. your custom middleware
```typescript
import { Middleware } from 'telegraf';
import { TelegrafI18nContext } from 'nestjs-telegraf-i18n';

const WHITELISTED_USERS: number[] = [123456789, 987654321];

export const whitelistMiddleware: Middleware<TelegrafI18nContext> = async (ctx: TelegrafI18nContext, next) => {
    if (!ctx.from) {
        return;
    }

    if (WHITELISTED_USERS.includes(ctx.from.id)) {
        await next();
    } else {
        await ctx.reply(ctx.t('errors.userNotWhitedMessage'));
    }
};
```

Make sure to put the telegrafI18nMiddleware before the custom middleware

```typescript
@Module({
  imports: [
    TelegrafI18nModule,
    TelegrafModule.forRootAsync({
      inject: [TelegrafI18nMiddlewareProvider],
      useFactory: (telegrafI18nMiddlewareProvider: TelegrafI18nMiddlewareProvider) => ({
        token: "<your_bot_token>",
        options: {
          contextType: TelegrafI18nContext,
        },
        middlewares: [
          telegrafI18nMiddlewareProvider.telegrafI18nMiddleware,
          whitelistMiddleware
        ],
      }),
    }),
  ],
})
export class TelegramModule {}
```

## I18nContext
If you need the underlying I18nContext object directly:
```typescript
async someHandler(@Ctx() ctx: TelegrafI18nContext) {
    const i18nContext = ctx.i18n();
    const currentLang = i18nContext?.lang;
}
```