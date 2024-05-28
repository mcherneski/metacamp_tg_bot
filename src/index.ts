import { Telegraf, Markup, session, Context, Scenes, Composer } from 'telegraf'
import { Postgres } from '@telegraf/session/pg'
import { PrismaClient } from '@prisma/client'

import { message, callbackQuery, channelPost } from 'telegraf/filters'
import { createWallet } from './utils/createWallet'
import { awardToken, getUserByName, getUserByTGName, sendTransaction } from './utils/queries';

require('dotenv').config()
global.fetch = require('node-fetch')
const prisma = new PrismaClient()

// const store = Postgres({
//     host: process.env.PGHOST,
//     database: process.env.PGDATABASE,
//     user: process.env.PGUSER,
//     password: process.env.PGPASSWORD,
// })

interface SessionData {
    address: string
    privateKey: string
    userId: number
    telegramName: string
    photoCount: number
    videoCount: number
    chatId: string
    firstName: string
    lastName: string
}

interface AppContext extends Context {
    session: SessionData
}

const bot = new Telegraf<AppContext>(process.env.BOT_TOKEN as string)
bot.use(session({ defaultSession: () => ({ 
    userId: 0,
    telegramName: '',
    chatId: '', 
    address: '', 
    privateKey: '', 
    photoCount: 0, 
    videoCount: 0, 
    firstName: '', 
    lastName: '' 
    })
}))

//
// Standard Commands
//

bot.start( async (ctx) => {
    
    // Check for existing users
    if (ctx.session.telegramName && ctx.session.userId) {
        return ctx.reply('You are already registered! Type /help for a list of commands.')
    }
    const checkExistingUser = await getUserByTGName(ctx.from.username || '')
    if (checkExistingUser !== "User not found." && checkExistingUser.telegram_id === ctx.from.username) {
        ctx.session.telegramName === checkExistingUser.telegram_id
        ctx.session.userId === checkExistingUser.id
        return ctx.reply('This Telegram handle is already registered! \n Try /help to see a list of commands.')
    }


    const user = ctx.from.username?.toString() || ''
    ctx.session.telegramName = user
    await ctx.reply(`🏝️ Welcome to MetaCamp, ${user}! 🌊`)
    await ctx.reply('Hold tight while we create your account...')
    
    console.log('\n New user workflow triggered: ', user)
    try {
        const wallet = await createWallet()
        const walletData = await JSON.parse(wallet)
        console.log('Wallet Data: ', walletData)
        // Store Wallet data in session
        ctx.session.address = walletData.address
        ctx.session.privateKey = walletData.privateKey

        // Store local chat ID in dabatabse for future use.
        console.log('Local chat id: ', ctx.chat.id)
        const chatIdStr = (ctx.chat.id).toString()

        // Get user's screen name
        const tgFirstName = ctx.from.first_name || ''
        const tgLastName = ctx.from.last_name || ''
        try {
            const newUser = await prisma.user.create({
                data: {
                    telegram_id: user,
                    walletAddress: ctx.session.address,
                    chatId: chatIdStr,
                    firstName: tgFirstName,
                    lastName: tgLastName,
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
    let response 
    ctx.react('❤')
    response = `gm`
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
// Handle Named User
    if (args[0].startsWith('@')) {
        console.log('Checking with TG username')
        recipient = args[0].replace('@', '')
    } else {
        let namedUser: any
        console.log('Checking with TG FirstName and LastName')
        console.log('User first name: ', args[1])
        namedUser = await getUserByName(args[1])

        if (namedUser === 'User not found') {
            return ctx.reply('User not found.')
        }

        if (Array.isArray(namedUser)) {
            console.log('More than one named user')
            return ctx.reply('More than one user found. Please use the TG username. \n (Feature in progress)')
        }

        recipient = namedUser.telegram_id
        console.log('Named user', namedUser)
        
    }
// Handle Telegram Handle
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
            const newMessage = `\${sender} sent you some Vibes! \n ${message}`
            
            await ctx.telegram.sendMessage(Number(recipientChatId), newMessage)
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
