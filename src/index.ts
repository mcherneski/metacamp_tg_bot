import { Telegraf, Markup, Context } from 'telegraf'
import { message, callbackQuery, channelPost } from 'telegraf/filters'

require('dotenv').config()

global.fetch = require('node-fetch')
const bot = new Telegraf(process.env.BOT_TOKEN as string)

const signUp = async () => {
    console.log('Signing up')
}

const checkBalance = async () => {
    //TODO: Query DB and check balance
}

bot.start( async (ctx) => {
    return ctx.reply('Welcome to MetaCamp!')
})

bot.command('versionCheck', (ctx) => {
    return ctx.reply('Version 0.01')
})

bot.command('hello', (ctx) => {
    return ctx.reply('Hello New Friend!')
})

bot.help((ctx) => {
    // TODO: Add help message
})

bot.command('gm', (ctx) => {
    return ctx.reply(
        'gm!',
        Markup.inlineKeyboard([
            Markup.button.callback('Upcoming Activities', 'upcoming-activities'),
            Markup.button.callback('Propose Activity', 'propose-activity')
        ])
    )
})

bot.command('send', (ctx) => {
    
})

bot.command('account', (ctx) => {
    console.log('Getting user account info')
})


bot.on(message("photo", "media_group_id"), (ctx) => {
    ctx.message.photo.forEach((photo) => {
        //assign the poster +1 metacoin per photo posted
    })
})

bot.on(message("video"), (ctx) => {
    if (ctx.message.video.duration < 5)
        {
            //assign the poster +1 metacoin
        }
    console.log('Video posted')
})



bot.launch()

console.log('Bot is running')

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
