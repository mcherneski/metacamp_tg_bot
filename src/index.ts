import { Telegraf, Markup, session, Context, Scenes, Composer } from 'telegraf'

import { message, callbackQuery, channelPost } from 'telegraf/filters'
import { getAllUsers, createUser, sendReward, sendMetaCash } from './utils/queries'
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
    // ctx.mycontextprop
    session: AppSession

    scene: Scenes.SceneContextScene<AppContext, Scenes.WizardSessionData>

    wizard: Scenes.WizardContextWizard<AppContext>
}


const bot = new Telegraf<AppContext>(process.env.BOT_TOKEN as string)
const stepHandler = new Composer<AppContext>()

const onboard = new Scenes.WizardScene<AppContext>(
    'onboard',
    async (ctx) => {
        await ctx.reply('How is your day?')
        return ctx.wizard.next()
    },
    stepHandler,
    async (ctx) => {
        await ctx.reply('What is your wallet address?')
        return ctx.wizard.next()
    },
    async (ctx) => {
        await ctx.reply('Ok done!')
        return await ctx.scene.leave()
    }
)

const stage = new Scenes.Stage<AppContext>([onboard])

bot.use(session())
bot.use(stage.middleware())

bot.command('register', async (ctx) => {
    ctx.scene.enter('onboard')
})

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
