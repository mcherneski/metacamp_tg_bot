import { Telegraf, Markup, session, Context, Scenes, Composer } from 'telegraf'

import { message, callbackQuery, channelPost } from 'telegraf/filters'
import { getAllUsers, createUser, sendReward, sendToken } from './utils/queries'
import { createWallet } from './utils/createWallet'

require('dotenv').config()
global.fetch = require('node-fetch')

interface AppSession extends Scenes.WizardSession {
    address: string
    privateKey: number
}

interface AppContext extends Context {
    address: string
    privateKey: string
    userId: number
    
    session: AppSession
}
const bot = new Telegraf<AppContext>(process.env.BOT_TOKEN as string)
bot.use(session())

//
// Standard Commands
//
bot.start( async (ctx) => {
    const user = ctx.from.username?.toString() || ''
    // if (!ctx.from.username) return ctx.reply('Error getting username')
    await ctx.reply(`Welcome to MetaCamp Coordinape Circle, ${user}!`)
    await ctx.reply('Hold tight while we create your account...')
    
    console.log('\n New user workflow triggered: ', user)
    
    try {
        const wallet = await createWallet()
        const walletData = await JSON.parse(wallet)
        // Store in session
        ctx.address = walletData.address
        ctx.privateKey = walletData.privateKey
        console.log('Context Address Data: ', ctx.address)
        console.log('Context Private Key Data: ', ctx.privateKey)
        
        const newUser = await createUser(user, ctx.address)
        const newUserData = await JSON.parse(newUser)

        console.log('Coordinape New User Data: ', newUserData)

        ctx.userId = newUserData.createdUsers[0].id

        console.log('All contexts: ', ctx.address, ctx.privateKey, ctx.userId)

        console.log('New Coordinape user created! ', newUser)

        return ctx.reply('Your account has been created! \n Type /help for a list of commands!')
    
    } catch (error) {
        console.log('Error creating account: ', error)
        return ctx.reply(`Error creating account. ${error} Please send Mike a message (@MikeCski).`)
    }
})

bot.command('help', (ctx) => {
    ctx.reply('Available commands: ')
})


bot.command('gm', (ctx) => {

})


bot.command('send', async (ctx) => {
    const args = ctx.args
    const payload = ctx.payload

    console.log('Payload: ', payload)

    if (args[0] && typeof args[0] === 'string' &&
        
        args[1] && !isNaN(Number(args[1]))
        
        ) {
            const recipient = args[0]
            const amount: number = Number(args[1])
            await ctx.reply(`Send a shoutout to recipient? (reply 'no' if not) `)
            bot.on('text', async (ctx) => {
                let message
                if (ctx.message.text != 'No'){
                    message = ctx.message.text
                    await ctx.telegram.sendMessage(message, recipient)
                }
                const sender = ctx.from?.username
                console.log('Sender: ', sender)

                try {
                    await sendToken(sender as string, recipient, amount)
                } catch {
                    return ctx.reply('Error sending MetaCash. Please talk to Mike. (@MikeCski)')
                }
                

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
    return ctx.reply('Version 0.09')
})


bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
