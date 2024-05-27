import { Telegraf, Markup, session, Context, Scenes, Composer } from 'telegraf'
import { Postgres } from '@telegraf/session/pg'
import { PrismaClient } from '@prisma/client'

import { message, callbackQuery, channelPost } from 'telegraf/filters'
import { createWallet } from './utils/createWallet'
import { awardToken, getUserByTGName, sendTransaction } from './utils/queries';

require('dotenv').config()
global.fetch = require('node-fetch')
const prisma = new PrismaClient()

const store = Postgres({
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
})

interface SessionData {
    address: string
    privateKey: string
    userId: number
    telegramName: string
    photoCount: number
    videoCount: number
    chatId: number
}

interface AppContext extends Context {
    session: SessionData
}

interface UserCreateInput {
    telegram_id: string;

    // walletAddress: string;
}

const bot = new Telegraf<AppContext>(process.env.BOT_TOKEN as string)
bot.use(session({ defaultSession: () => ({ userId: 0, telegramName: '', chatId: 0, address: '', privateKey: '', photoCount: 0, videoCount: 0 }) }))

//
// Standard Commands
//

bot.start( async (ctx) => {

    if (ctx.session.telegramName && ctx.session.userId) {
        return ctx.reply('You are already registered! Type /help for a list of commands.')
    }

    const checkExistingUser = await getUserByTGName(ctx.from.username || '')


    

    if (checkExistingUser !== "User not found." && checkExistingUser.telegram_id === ctx.from.username) {
        ctx.session.telegramName === checkExistingUser.telegram_id
        ctx.session.userId === checkExistingUser.id

        return ctx.reply('You are already registered! Try /help to see a list of commands.')
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
        console.log('Local chat id: ', ctx.chat.id)
        try {
            const newUser = await prisma.user.create({
                data: {
                    telegram_id: user,
                    walletAddress: ctx.session.address,
                    chatId: ctx.chat.id,
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
        /account - Check your account details. \n
        /send - ( /send @username amount "Message" ) \n
    `)
})

bot.command('account', async (ctx) => {
    const tgusername = ctx.from.username || ''
    try {
        const user = await getUserByTGName(tgusername)

        if (user !== "User not found.") {
        return ctx.reply(`Your account details: \n
            Username: ${user.telegram_id} \n
            Balance: ${user.balance} \n
            Received: ${user.received} \n
            Sent: ${user.sent} \n
        `)
        }

    } catch (error) {
        console.log(`${ctx.session.telegramName} call to /account failed: ${error}`)
        return ctx.reply('Error fetching account details. Please send Mike a message (@MikeCski).')
    }
})

bot.command('gm', (ctx) => {
    const currentHour = new Date().getHours()
    let response 
    ctx.react('❤')
    if (currentHour < 18) {
        response = `gm 🌚`
    } else {
        response = `gm 😁`
    }
    return ctx.reply(response)
})

bot.command('balance', async (ctx) => {
    const user = await getUserByTGName(ctx.session.telegramName)
    if (user !== "User not found.") {
        return ctx.reply(`Your balance is: ${user.balance}`)
    }
    
})

// bot.command('showPrivateKey', async (ctx) => {
//     ctx.reply('Do not share your private key with anyone!')
//     ctx.reply(`Your private key is: ${ctx.session.privateKey}`)
//     return ctx.reply('Please delete the message with the private key after you have copied it!')
// })


bot.command('send', async (ctx) => {
    console.log('----------------- Starting new send command -----------------')
    const args = ctx.args
    const payload = ctx.payload
    let sender
    let recipient
    let recipientChatId
    console.log('Send args: ', args)

    if (args[0] && typeof args[0] === 'string' &&
        args[1] && !isNaN(Number(args[1]))
    ) {
        recipient = args[0]
        recipient = recipient.replace('@', '')
        const amount: number = Number(args[1])
        const message = args[2]
        sender = ctx.message.from.username || ''
        
        const recipientQuery = await getUserByTGName(recipient)
        if (recipientQuery !== 'User not found.') {
            recipientChatId = recipientQuery.chatId
        }
        
        console.log('Recipient Chat Id: ', recipientChatId)

        if (message !== '' || message !== undefined) {
            const newMessage = `${sender} sent you some Vibes! /n ${message}`
            
            await ctx.telegram.sendMessage(recipientChatId as number, newMessage)
        }

        try {
            if (sender !== ''){
                console.log('Sending transaction')
                await sendTransaction(sender, recipient, amount, message)
                return ctx.reply(`Sent ${amount} Vibes to ${recipient}!`)
            }
        } catch (error){
            console.log(`Error sending transaction: ${sender}, ${recipient}, ${amount}, ${message}`, error)
            return ctx.reply('Error. Please dm Mike. (@MikeCski)')
        }
    }
})

//
// Interaction Commands
//
// Photo and video rewards. Need to upload from the bot to ipfs and then award token.
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
// bot.command('adminAward', async (ctx) => {
//     if (ctx.from.username !== "MikeCski" || ctx.from.username !== "Yaylormewn" || ctx.from.username !== "Zakku99"){
//         return ctx.reply('You are not authorized to use this command.')
//     }
// )
// })

bot.command('version', (ctx) => {
    return ctx.reply('Version 0.16')
})


bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
