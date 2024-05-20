import { Telegraf, Markup, Context } from 'telegraf'
import { message, callbackQuery, channelPost } from 'telegraf/filters'

require('dotenv').config()

global.fetch = require('node-fetch')
const bot = new Telegraf(process.env.BOT_TOKEN as string)
const fetchCoordinapeData = async (query: string) => {
    const url = 'https://coordinape-prod.hasura.app/v1/graphql'
    const Query = query

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': '82478|VpICtNupRgqJFwSjfDz3EJbrrTrEDoFNA8UHJMGK'

        },
        body: JSON.stringify({query: Query})
    }

    try {
        const response = await fetch(url, options)
        const data = await response.json()
        console.log(data)
        return data
    } catch (error) {
        console.error('Error fetching Coordinape data: ', error)
    }
}

// const query = `{
//     circles(where: {id: {_eq: "31099}}) {
//         id
//         name
//         epochs {
//             cirlce_id
//             id
//         }
//     }
// }`
// const data = fetchCoordinapeData(query)

const checkBalance = async () => {
    //TODO: Query DB and check balance
}

bot.start( async (ctx) => {
    ctx.reply('Welcome to MetaCamp!')
    return ctx.reply(
        'Welcome to MetaCamp!',
        Markup.inlineKeyboard([
            Markup.button.callback('Sign Up', 'signup'),
            Markup.button.callback('About MetaCamp', 'about')
        ])
    )
})

bot.command('signup', (ctx) => {
    const link = 'https://app.coordinape.com/join/cb116dd8-f1de-4ed8-9fd4-90c5f5a47c8a'
    ctx.reply(`Please sign up with this link: ${link}`)
})

bot.command('versionCheck', (ctx) => {
    return ctx.reply('Version 0.03')
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
