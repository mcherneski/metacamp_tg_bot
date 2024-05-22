import { Telegraf, Markup, session, Context } from 'telegraf'
import { message, callbackQuery, channelPost } from 'telegraf/filters'
import { getAllUsers } from './queries'


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

bot.command('signup', (ctx) => {
    ctx.reply('Please sign up with this link')
    return ctx.reply('https://app.coordinape.com/join/50603e37-b3cf-4334-af9f-be3957576924')
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
    try {
        const users = await getAllUsers()
        return ctx.reply(users)
    } catch {
        return ctx.reply('Error fetching data')
    }
})

bot.command('send', async (ctx) => {
    const args = ctx.args
    console.log('++++++++++++++++++++++++++++++++++++++++')
    console.log('CTX Args: ', args)
    console.log('CTX Object: ', ctx)

})

bot.help((ctx) => {
    console.dir(ctx, {depth: null})
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
bot.command('version', (ctx) => {
    return ctx.reply('Version 0.07')
})


bot.launch()

console.log('Bot is running')

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
