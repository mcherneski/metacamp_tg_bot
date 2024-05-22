import { Telegraf, Markup, session, Context } from 'telegraf'
// import * as tg from 'telegraf'
import { message, callbackQuery, channelPost } from 'telegraf/filters'
import { fetchCoordinapeData } from './utils'
// const { inlineKeyboard, button, Telegraf } = tg;
require('dotenv').config()

global.fetch = require('node-fetch')
const bot = new Telegraf(process.env.BOT_TOKEN as string)
//
// Standard Commands
//
bot.start( async (ctx) => {
    return ctx.reply(
        'Welcome to MetaCamp!'
    )
})

bot.command('gm', (ctx) => {
    console.log('ctx object: ', ctx)
    return ctx.reply(
        'gm!',
        Markup.inlineKeyboard([
            Markup.button.callback('Upcoming Activities', 'upcoming-activities'),
            Markup.button.callback('Propose Activity', 'propose-activity')
        ])
    )

})

bot.action('upcoming-activities', (ctx) => {
    return ctx.reply('This is where we would return upcoming activities')
})

bot.command('checkAPI', async (ctx) => {
    const query = `{
        circles(where: {id: {_eq: "31099}}) {
            id
            name
            epochs {
                cirlce_id
                id
            }
        }
    }`

    const data = await fetchCoordinapeData(query)
    const stringData = JSON.stringify(data)
    ctx.reply(stringData)


})

bot.command('send', (ctx) => {
    
})


bot.help((ctx) => {
    // TODO: Add help message
})

//
// Interaction Commands
//

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

// 
// Admin Commands
//
bot.command('admin-versionCheck', (ctx) => {
    return ctx.reply('Version 0.03')
})


bot.launch()

console.log('Bot is running')

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
