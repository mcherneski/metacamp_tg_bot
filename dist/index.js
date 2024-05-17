"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const telegraf_1 = require("telegraf");
const bot = new telegraf_1.Telegraf('6397062022:AAEtx_QmomucDI6Vzy4l0NDg0Ts8Mk2ED4I');
bot.start((ctx) => ctx.reply('Welcome!'));
bot.help((ctx) => {
    ctx.reply('Send /start to sign up');
    ctx.reply('Send /hello to get a greeting');
    ctx.reply('Send /keyboard to get a keyboard');
});
bot.command('hello', (ctx) => {
    ctx.reply('Hello friend!');
});
bot.command('keyboard', (ctx) => {
    ctx.reply('Keyboard', telegraf_1.Markup.inlineKeyboard([
        telegraf_1.Markup.button.callback('Button 1', 'One'),
        telegraf_1.Markup.button.callback('Button 2', 'Two')
    ]));
});
bot.on('text', (ctx) => {
    ctx.reply('You chose the ' + (ctx.message.text === 'first' ? 'First' : 'Second') + ' option!');
});
bot.launch();
console.log('Bot is running');
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
//# sourceMappingURL=index.js.map