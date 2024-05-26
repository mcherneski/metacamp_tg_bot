import { Telegraf, Markup, session, Context, Scenes, Composer } from 'telegraf'
// import { Postgres } from '@telegraf/session/pg'
import { message, callbackQuery, channelPost } from 'telegraf/filters'
import { 
    getAllUsers,
    createUser,
    balanceCheck,
    sendReward,
    sendToken,
    getUserById 
} from './utils/queries'
import { createWallet } from './utils/createWallet'

require('dotenv').config()
global.fetch = require('node-fetch')

interface SessionData {
    address: string
    privateKey: string
    userId: number
    userName: string
}

interface AppContext extends Context {
    session: SessionData
}
const bot = new Telegraf<AppContext>(process.env.BOT_TOKEN as string)
bot.use(session({ defaultSession: () => ({ address: '', privateKey: '', userId: 0, userName: '' }) }))

//
// Standard Commands
//

bot.start( async (ctx) => {

    // if (ctx.session.address && ctx.session.privateKey) {
    //     return ctx.reply('You are already registered! Type /help for a list of commands.')
    // }

    const user = ctx.from.username?.toString() || ''
    // if (!ctx.from.username) return ctx.reply('Error getting username')
    await ctx.reply(`Welcome to MetaCamp Coordinape Circle, ${user}!`)
    await ctx.reply('Hold tight while we create your account...')
    
    console.log('\n New user workflow triggered: ', user)
    const randomNumber = Math.floor(Math.random() * 500)
    try {
        const wallet = await createWallet()
        const walletData = await JSON.parse(wallet)
        console.log('Wallet Data: ', walletData)
        // Store in session
        ctx.session.address = walletData.address
        ctx.session.privateKey = walletData.privateKey
        console.log('Context Address Data: ', ctx.session.address)
        console.log('Context Private Key Data: ', ctx.session.privateKey)
        const testName = '@TestUser' + randomNumber
        const newUser = await createUser(testName, ctx.session.address)
        const newUserData = await JSON.parse(newUser)

        console.log('Coordinape New User Data: ', newUserData)
        if (newUserData.errors) {
            console.log('Error creating user: ', newUserData.errors)
            return ctx.reply('Error creating account. Please send Mike a message (@MikeCski).')
        }
        console.log('New Coordinape user created! ', newUser)
             
        ctx.session.userId = newUserData.data.createUsers[0].UserResponse.profile.id
        ctx.session.userName = newUserData.data.createUsers[0].UserResponse.profile.name

        console.log('All contexts: ', ctx.session.address, ctx.session.privateKey, ctx.session.userId, ctx.session.userName)
        return ctx.reply(`Your account has been created! \n Type /help for a list of commands!`)
    
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
    return ctx.reply(`Your account details: \n
        Username: ${ctx.session.userName} \n
        UserId: ${ctx.session.userId} \n
        Address: ${ctx.session.address} \n
    `)
})

bot.command('gm', (ctx) => {
    // ctx.sendPhoto('')
    return ctx.reply('gm!')
})

bot.command('balance', async (ctx) => {
    const response = await getUserById(ctx.session.userId.toString())
    const tokenData = await JSON.parse(response)

    console.log('Balance Command token data: ', tokenData)
    const tokensRemaining = tokenData.give_token_remaining
    return ctx.reply(`You have ${tokensRemaining} Vibes remaining!`)
})

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
        // const message = args[2]
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
        const sender = ctx.session.userName
        console.log('Sender: ', sender)

        try {

            const canSendAmount: boolean = await balanceCheck(sender, amount)
            console.log('Can the user send specified amount: ', canSendAmount)
            if (!canSendAmount) { return ctx.reply('You do not have enough Vibes to send!') }

            const sendRequest = await sendToken(sender, recipient, amount)
            const sendData = await JSON.parse(sendRequest)

            console.log('Send data: ', sendData)
            if (sendData.errors) {
                return ctx.reply('Error sending Vibes. Please send Mike a message to troubleshoot. (@MikeCski)')
            }
            return ctx.reply(`Sent ${amount} Vibes to ${recipient}!`)
        } catch {
            return ctx.reply('Error sending Vibes. Please talk to Mike. (@MikeCski)')
        }
    }
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
    return ctx.reply('Version 0.14')
})


bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
