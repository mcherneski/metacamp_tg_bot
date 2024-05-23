import { Telegraf, Markup, session, Context } from 'telegraf'
import { message, callbackQuery, channelPost } from 'telegraf/filters'
import { getAllUsers, createUser, sendReward,  } from './queries'


require('dotenv').config()

global.fetch = require('node-fetch')
const bot = new Telegraf(process.env.BOT_TOKEN as string)
//
// Standard Commands
//
bot.start( async (ctx) => {
    ctx.reply(
        'Welcome to MetaCamp Coordinape Bot! \n \n' + 'Please provide an EVM Addy to continue!',
        Markup.keyboard()
    )
})

bot.command('help', (ctx) => {
    ctx.reply('Available commands: \n /signup - Sign up for MetaCamp Coordinape Circle \n /send - send MetaCash to a user \n /version - Outputs bot version number')
})


bot.command('signup', (ctx) => {
    ctx.reply('Please sign up with this link')
    return ctx.reply('https://app.coordinape.com/join/50603e37-b3cf-4334-af9f-be3957576924')
})

bot.command('gm', (ctx) => {
    // console.log('ctx object: ', ctx)
    // return ctx.reply(
    //     'gm!',
    //     Markup.inlineKeyboard([
    //         Markup.button.callback('Upcoming Activities', 'upcoming-activities'),
    //         Markup.button.callback('Propose Activity', 'propose-activity')
    //     ])
    // )

})

// bot.action('upcoming-activities', (ctx) => {
//     return ctx.reply('This is where we would return upcoming activities')
// })

bot.command('send', async (ctx) => {
    const args = ctx.args
    const payload = ctx.payload

    console.log('Payload: ', payload)

    if (args[0] && typeof args[0] === 'string' &&
        
        args[1] && !isNaN(Number(args[1]))
        
        ) {
            const recipient = args[0]
            const amount = args[1]
            await ctx.reply(`Send a shoutout? (reply 'no' if not) `)
            bot.on('text', async (ctx) => {
                
                if (
                    ctx.message.text === 'No' || 
                    ctx.message.text === '' || 
                    ctx.message.text === 'no'
                ) {
                    return ctx.reply(`Sent ${amount} to ${recipient}!`)
                }

                const message = ctx.message.text
                const sender = ctx.from?.username
                console.log('Sender: ', sender)
                console.log('Message Received: ', message)             


                await ctx.telegram.sendMessage(message, recipient)
                return ctx.reply(`Sent ${amount} to ${recipient}!`)
                // Figure out how to send the message to the recipient. 
            })
            
        } else {
            return ctx.reply('Invalid arguments. Please use /send @username amount')
        }

    

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
    return ctx.reply('Version 0.08')
})


bot.launch()

console.log('Bot is running')

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
