import { Telegraf, Markup, session, Context, Scenes, Composer } from 'telegraf'
import { PrismaClient } from '@prisma/client'

import { message, callbackQuery, channelPost } from 'telegraf/filters'
// import { 
//     getAllUsers,
//     createUser,
//     balanceCheck,
//     sendReward,
//     sendToken,
//     getUserById 
// } from './utils/co_queries'
import { createWallet } from './utils/createWallet'
import { awardToken, getUserByTGName, sendTransaction } from './utils/queries';
import { Postgres } from '@telegraf/session/pg';

require('dotenv').config()
global.fetch = require('node-fetch')
const prisma = new PrismaClient()


// interface SessionData {
//     address: string
//     privateKey: string
//     userId: number
//     telegramName: string
// }

// interface AppContext extends Context {
//     session: SessionData
// }

// interface UserCreateInput {
//     telegram_id: string;
//     walletAddress: string;
// }

const store = Postgres({
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    
})

const bot = new Telegraf<AppContext>(process.env.BOT_TOKEN as string)
// bot.use(session({ defaultSession: () => ({ address: '', privateKey: '', userId: 0, telegramName: '' }) }))
bot.use(session({ store }))

//
// Standard Commands
//

bot.start( async (ctx) => {

    if (ctx.session.address && ctx.session.privateKey) {
        return ctx.reply('You are already registered! Type /help for a list of commands.')
    }

    const user = ctx.from.username?.toString() || ''
    ctx.session.telegramName = user
    // if (!ctx.from.username) return ctx.reply('Error getting username')
    await ctx.reply(`🏝️ Welcome to MetaCamp, ${user}! 🌊`)
    await ctx.reply('Hold tight while we create your account...')
    
    console.log('\n New user workflow triggered: ', user)
    try {
        const wallet = await createWallet()
        const walletData = await JSON.parse(wallet)
        console.log('Wallet Data: ', walletData)
        // Store in session
        ctx.session.address = walletData.address
        ctx.session.privateKey = walletData.privateKey
        console.log('Context Address Data: ', ctx.session.address)
        console.log('Context Private Key Data: ', ctx.session.privateKey);

        try {
            const newUser = await prisma.user.create({
                data: {
                    telegram_id: user,
                    walletAddress: ctx.session.address,
                },
            })
            console.log('New User Created: ', newUser)

            ctx.session.userId = newUser.id

            return ctx.reply(`Your account has been created! \n Type /help for a list of commands!`)

        } catch (error) {
            console.log('Error creating new user: ', error)
            return ctx.reply(`Error creating new user. ${error}`)
        }
    } catch (error) {
        console.log('Error creating account: ', error)
        return ctx.reply(`Error creating account. ${error} Please send Mike a message (@MikeCski).`)
    }
})

bot.command('help', (ctx) => {
    return ctx.reply(`Hello ${ctx.from.username}! Here are the commands you can use: \n
        /gm - A web 3 neccessity for any bot. \n
        /balance - Check your MetaCash balance. \n
        /showPrivateKey - Show your private key. \n
        /account - Check your account details. \n
        /send - Send MetaCash to another user. \n
        /version - Check the current version of the bot. \n
    `)
})

bot.command('account', async (ctx) => {
    const tgusername = ctx.from.username || ''
    try {
        const user = await  getUserByTGName(tgusername)
        console.log('User ${ctx.from.username} called account: ', user)

        return ctx.reply(`Your account details: \n
            Username: ${user.telegram_id} \n
            Wallet Address: ${user.walletAddress} \n
            Received: ${user.received} \n
            Sent: ${user.sent} \n
        `)

    } catch (error) {
        console.log(`${ctx.session.telegramName} call to /account failed: ${error}`)
        return ctx.reply('Error fetching account details. Please send Mike a message (@MikeCski).')
    }
})

bot.command('gm', (ctx) => {
    const currentHour = new Date().getHours()
    let response 
    ctx.react('🥰')
    if (currentHour < 18) {
        response = `gm ${ctx.session.telegramName}! 🌚`
    } else {
        response = `gm ${ctx.session.telegramName}! 😁`
    }
    return ctx.reply(response)
})

// bot.command('balance', async (ctx) => {
//     const response = await getUserById(ctx.session.userId.toString())
//     const tokenData = await JSON.parse(response)

//     console.log('Balance Command token data: ', tokenData)
//     const tokensRemaining = tokenData.give_token_remaining
//     return ctx.reply(`You have ${tokensRemaining} Vibes remaining!`)
// })

bot.command('showPrivateKey', async (ctx) => {
    ctx.reply('Do not share your private key with anyone!')
    ctx.reply(`Your private key is: ${ctx.session.privateKey}`)
    return ctx.reply('Please delete the message with the private key after you have copied it!')

})


bot.command('send', async (ctx) => {
    const args = ctx.args
    const payload = ctx.payload
    console.log('Send args: ', args)
    console.log('Send payload: ', payload)

    console.log('Payload: ', payload)

    if (args[0] && typeof args[0] === 'string' &&

        args[1] && !isNaN(Number(args[1]))

    ) {
        const recipient = args[0]
        const amount: number = Number(args[1])
        const message = args[2]
        // console.log('Send command message: ', message)

        // if (message) {
        //     await ctx.telegram.sendMessage(recipient, message)
        // }
        // await ctx.reply(`Send a shoutout to recipient? (reply 'no' if not) `)
        // bot.on('text', async (ctx) => {
        //     let message
        //     if (ctx.message.text != 'No'){
        //         message = ctx.message.text
        //         await ctx.telegram.sendMessage(message, recipient)
        //     }
        const sender = ctx.session.telegramName
        console.log('Sender: ', sender)

        try {
            await sendTransaction(sender, recipient, amount, message)
        } catch (error){
            console.log(`Error sending transaction: ${sender}, ${recipient}, ${amount}, ${message}`, error)
            return ctx.reply('Error sending Vibes. Please talk to Mike. (@MikeCski)')
        }
    }
})

//
// Interaction Commands
//

bot.on(message("photo", "media_group_id"), async (ctx) => {
    ctx.message.photo.forEach(async (photo) => {
        //Need to copy the image to a thread somewhere. Maybe copy to ipfs?
        await awardToken(ctx.session.telegramName, 1)
    })
})

bot.on(message("video"), async (ctx) => {
    if (ctx.message.video.duration < 5)
        {
            //Need to copy the image to a thread somewhere. Maybe copy to ipfs?
            await awardToken(ctx.session.telegramName, 1)
        }
    console.log('Video posted')
})

// 
// Admin Commands
//
bot.command('version', (ctx) => {
    return ctx.reply('Version 0.14')
})


bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
