import { Telegraf, Markup, session, Context, Scenes, Composer } from 'telegraf'
import { Postgres } from '@telegraf/session/pg'
import { PrismaClient } from '@prisma/client'

import { message, callbackQuery, channelPost } from 'telegraf/filters'
import { createWallet } from './utils/createWallet'
import { awardToken, getActivities, createActivity, createUser, getUserByTGName, sendTransaction } from './utils/queries';

require('dotenv').config()
global.fetch = require('node-fetch')
const prisma = new PrismaClient()

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
// Not used yet
// const store = Postgres({
//     host: process.env.PGHOST,
//     database: process.env.PGDATABASE,
//     user: process.env.PGUSER,
//     password: process.env.PGPASSWORD
// })

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

bot.on('text', async (ctx) => {

})

bot.start( async (ctx) => {
    console.log('ChatId: ', ctx.chat.id)
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

    await ctx.setChatMenuButton({
        type: 'commands'
    })
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
        /send | Example: /send @TGHandle Amount(1-100) "Message" ) \n
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
        return ctx.reply(`Your Vibe balance is: ${user.balance}`)
    }
})

bot.command('schedule', async (ctx) => {
    console.log('Running schedule command')
    try {
        const todaysEvents = await getActivities()
        todaysEvents.forEach( async (event) => {
            ctx.reply(`${event.name} at ${event.time} in ${event.location}`)
        })

    } catch (error) {
        console.log('Get Events Error: ', error)
        return ctx.reply('Error fetching events. Please send Mike a message (@MikeCski).')
    }

})

bot.command('createActivity', async (ctx) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    console.log('Arguments for new event: ', ctx.args)
    const params = ctx.payload
    console.log('Payload is : ', params)
    const eventName = params[0]
    const description = ''
    const date = today
    const time = await Number(params[2])
    const location = params[3]
    const facilitator = params[4]

    console.log(`Creating new event: ${eventName} on ${date} at ${time} in ${location}`)

    try {
        const newEvent = await createActivity(
            eventName,
            description,
            date,
            time,
            location,
            facilitator
        );

        const eventData = await JSON.stringify(newEvent);
        console.log('New Event: ', newEvent);
        return ctx.reply(`New event created: ${eventData}`);
    } catch (error) {
        console.log('Error creating new event: ', error)
        return ctx.reply('Error creating new event. Please send Mike a message (@MikeCski).')
    }
   
})

// bot.command('showPrivateKey', async (ctx) => {
//     ctx.reply('Do not share your private key with anyone!')
//     ctx.reply(`Your private key is: ${ctx.session.privateKey}`)
//     return ctx.reply('Please delete the message with the private key after you have copied it!')
// })


bot.command('send', async (ctx) => {
    console.log('----------------- Starting new send command started -----------------')
    const args = ctx.args
    const payload = ctx.payload
    let sender
    let recipient
    let recipientChatId
    let newMessage
    console.log('Send args: ', args)
    console.log('Send payload', payload)

    if ((args.length === 0 )){
        return ctx.reply('Please provide the recipient and amount. \n Example: /send @TGHandle Amount(1-100) "Message"')
    }
    if (args[0] && typeof args[0] === 'string' &&
        args[1] && !isNaN(Number(args[1]))
        ) {
        recipient = args[0]
        console.log(`Recipient: ${recipient}`)

        if (recipient.startsWith('@')) {
            recipient = recipient.replace('@', '')
        }
        console.log(`Recipient: ${recipient}`)
        
        const amount: number = Number(args[1])
        console.log(`Amount: ${amount}`)
        const message = args[2]
        console.log(`Message: ${message}`)
        sender = ctx.message.from.username || ''
        
        const recipientQuery = await getUserByTGName(recipient)
        console.log('Recipient Query: ', recipientQuery)
        if (recipientQuery !== 'User not found.') {
            recipientChatId = recipientQuery.chatId
        }
        console.log('Recipient Chat Id: ', recipientChatId)

        if (message !== '' || message !== undefined) {
            console.log('Message detected in args')
            newMessage = `${sender} sent you some MetaCoins with a message: \n ${message}`
            console.log(`User ${sender} is sending ${amount} to ${recipient} with message ${newMessage}.`)

            if (recipientChatId !== undefined){
                try {
                    console.log('Recipient Chat Id: ', recipientChatId)
                    await ctx.telegram.sendMessage(Number(recipientChatId), newMessage)
                } catch (error) {
                    console.log(`Error sending message to recipient: ${error}`)
                    ctx.reply('Error sending message to recipient. Please dm Mike. (@MikeCski) \n The transaction is still processing...')
                }
            } else {
                ctx.reply('Error sending message to recipient. Please dm Mike. (@MikeCski) \n The transaction is still processing...')
                console.log('New message: ', newMessage)
            }
        }

        try {
            if (sender !== ''){
                console.log('Sending transaction...')
                await sendTransaction(sender, recipient, amount, message)
                return ctx.reply(`Sent ${amount} MetaCoins to ${recipient}!`)
            }
        } catch (error){
            console.log(`Error sending transaction: ${sender}, ${recipient}, ${amount}, ${message}`, error)
            return ctx.reply('Error. Please DM Mike. (@MikeCski)')
        }
    }
})

//
// Interaction Commands
//
// Photo and video rewards. Need to upload from the bot to ipfs and then award token.
// bot.on(message("photo", "media_group_id"), async (ctx) => {
//     console.log('Photo posted')
//     let user = ctx.session.telegramName
//     console.log(`${user} posted a photo.`)
//     if (user.startsWith('@')){
//         user = user.toString().replace('@', '')
//     }
//     let photoCount = 0
//     ctx.message.photo.forEach(async (photo) => {
//         //Need to copy the image to a thread somewhere. Maybe copy to ipfs?
//         await awardToken(user, 1)
//         photoCount++
//     })
//     console.log(`${user} has been awarded ${photoCount} Vibe(s) for a video.`)
//     return ctx.reply(`Thanks! 📸 ❤️ \n I sent you ${photoCount} MetaCoins.`)
// })

// bot.on(message("video"), async (ctx) => {
//     let user = ctx.session.telegramName
//     console.log(`${user} posted a video.`)
//     if (user.startsWith('@')){
//         user = user.toString().replace('@', '')
//     }
//     if (ctx.message.video.duration < 5)
//         {
//             //Need to copy the image to a thread somewhere. Maybe copy to ipfs?
//             await awardToken(user, 1)
//             console.log(`${user} has been awarded 1 Vibe for a video.`)
//             return ctx.reply('Thanks for the video! 🤩 \n I just sent you one Vibe.')
//         }
//     console.log('Video posted')
// })

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
    return ctx.reply('Version 0.19')
})


bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
