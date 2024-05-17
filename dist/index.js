"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const telegraf_1 = require("telegraf");
const filters_1 = require("telegraf/filters");
require('dotenv').config();
global.fetch = require('node-fetch');
const bot = new telegraf_1.Telegraf(process.env.BOT_TOKEN);
const signUp = async () => {
    console.log('Signing up');
};
const checkBalance = async () => {
    //TODO: Query DB and check balance
};
bot.start(async (ctx) => {
    return ctx.reply('Welcome to MetaCamp!', telegraf_1.Markup.keyboard([
        telegraf_1.Markup.button.callback('Opt-in to MetaCash', 'opt-in')
    ]));
});
bot.command('hello', (ctx) => {
    return ctx.reply('Hello Friend!');
});
bot.help((ctx) => {
    // TODO: Add help message
});
bot.command('gm', (ctx) => {
    return ctx.reply('gm!', telegraf_1.Markup.inlineKeyboard([
        telegraf_1.Markup.button.callback('Upcoming Activities', 'upcoming-activities'),
        telegraf_1.Markup.button.callback('Propose Activity', 'propose-activity')
    ]));
});
bot.command('send', (ctx) => {
});
bot.command('account', (ctx) => {
    console.log('Getting user account info');
});
bot.on((0, filters_1.message)("photo", "media_group_id"), (ctx) => {
    ctx.message.photo.forEach((photo) => {
        //assign the poster +1 metacoin per photo posted
    });
});
bot.on((0, filters_1.message)("video"), (ctx) => {
    if (ctx.message.video.duration < 5) {
        //assign the poster +1 metacoin
    }
    console.log('Video posted');
});
bot.launch();
console.log('Bot is running');
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
//# sourceMappingURL=index.js.map