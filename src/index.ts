import { Telegraf, Markup } from 'telegraf'

const bot = new Telegraf(process.env.BOT_TOKEN)

bot.start((ctx) => ctx.reply('Welcome!'))
bot.help((ctx) => {
    ctx.reply('Send /start to sign up')
    ctx.reply('Send /hello to get a greeting')
    ctx.reply('Send /keyboard to get a keyboard')
})

bot.command('hello', (ctx) => {
    ctx.reply('Hello friend!')
})

bot.command('keyboard', (ctx) => {
    ctx.reply(
        'Keyboard',
        Markup.inlineKeyboard([
            Markup.button.callback('Button 1', 'One'),
            Markup.button.callback('Button 2', 'Two')
        ])
    )
})

bot.on('text', (ctx) => {
    ctx.reply('You chose the ' + (ctx.message.text === 'first' ? 'First' : 'Second') + ' option!')
})

bot.launch()

console.log('Bot is running')

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
