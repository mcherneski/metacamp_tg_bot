import { Telegraf, Markup, session, Context, Scenes } from 'telegraf'

import { message, callbackQuery, channelPost } from 'telegraf/filters'
import { getAllUsers, createUser, sendReward, sendMetaCash } from './utils/queries'
import { createWallet } from './utils/createWallet'

require('dotenv').config()
global.fetch = require('node-fetch')

interface BotContext extends Context {
    address?: string
    private_key?: string
    scene: Scenes.SceneContextScene<BotContext>
}

const { enter, leave } = Scenes.Stage;

const bot = new Telegraf<BotContext>(process.env.BOT_TOKEN as string)

const onboardScene = new Scenes.BaseScene<BotContext>("onboard")
onboardScene.enter((ctx) => {
    ctx.reply(`GM ${ctx.from?.username}! Welcome to MetaCamp!`)
    ctx.reply('Do you want to create a new wallet or use an existing one?', 
        Markup.inlineKeyboard([
            Markup.button.callback('Create Wallet', 'create-wallet'),
            Markup.button.callback('Use Existing Wallet', 'use-existing')
        ])
    )
})

onboardScene.action('create-wallet', async (ctx) => {
    const response = await createWallet()
    const data = await JSON.parse(response)
    ctx.reply(`Your new wallet address is: ${data.address}`)
    ctx.reply(`Your private key is: ${data.privateKey} \n Please keep this safe!`)
    try {
        await createUser(ctx.from?.username as string, data.address)
        return ctx.scene.leave()
    } catch (error) {
        return ctx.reply('Error creating user. Please talk to Mike. (@MikeCski)')
    }
    
})

onboardScene.action('use-existing', (ctx) => {
    ctx.reply('Please enter your wallet address')
    bot.on('text', async (ctx) => {
        const input = ctx.message.text
        if (input.length === 42 && input.startsWith('0x')) {
            const addy = input
            const username = ctx.from?.username

            try {
                await createUser(username as string, addy)
            } catch (error) {
                console.error('Error creating user: ', error)
                ctx.reply('Error creating user. Please talk to Mike. (@MikeCski)')
            }
        } else {
            return ctx.reply('Invalid address. Please call the /start command again.')
        }
    })
})
onboardScene.leave((ctx) => ctx.reply(`Good to go! Type /help for a list of commands! Pura Vida!`))

const stage = new Scenes.Stage<BotContext>([onboardScene], { ttl: 10 })

//
// Standard Commands
//
bot.start( async (ctx) => {
    console.log('Start command run')
    console.log('Start command ctx: ', ctx)
    const scene = ctx.scene

    console.log(scene)

    ctx.scene.enter('onboard')
})

bot.command('signup', async (ctx) => {
    console.log('Signup command received.')
    ctx.scene.enter('onboard')
})

bot.command('help', (ctx) => {
    ctx.reply('Available commands: \n /signup - Sign up for MetaCamp Coordinape Circle \n /send - send MetaCash to a user \n /version - Outputs bot version number')
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
                    await sendMetaCash(sender as string, recipient, amount)
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

bot.use(session())
bot.use(stage.middleware())
bot.use((ctx, next) => {
    ctx.address ??= ''
    ctx.private_key ??= ''
    return next()
})


bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
