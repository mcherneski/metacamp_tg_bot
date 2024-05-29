import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const createUser = async (telegram_id: string, walletAddress: string, chatId: string, firstName?: string, lastName?: string) => {
   const newUser = await prisma.user.create({
      data: {
         telegram_id: telegram_id,
         walletAddress: walletAddress,
         chatId: chatId, 
         firstName: firstName || '',
         lastName: lastName || ''
      }
   })
   return newUser
}

export const sendTransaction = async (senderTelegram: string, recipientTelegram: string, value: number, message: string) => {
   console.log('----------------------- Running new sendTransaction query call -----------------------')
   const sender = await prisma.user.findFirst({
      where: { telegram_id: {equals: senderTelegram, mode: 'insensitive'}}
   })
   const recipient = await prisma.user.findFirst({
      where: {telegram_id: {equals: recipientTelegram, mode: 'insensitive'}}
   })
   
   if (!sender) {
      throw new Error('Sender not found')
   }

   if (!recipient) {
      throw new Error('Recipient not found')
   }

   console.log(`Sender: ${sender.telegram_id}, Recipient: ${recipient.telegram_id}, Value: ${value}, Message: ${message}`)

   if (sender.balance < value) {
      throw new Error('Not enough tokens to send')
   }
   try {
      const txn = await prisma.transaction.create({
         data: {
            value: value,
            senderId: sender.id,
            recipientId: recipient.id,
            message: message
         },
         include: {
            sender: true,
         }
      })
   
      await prisma.user.update({
         where: {telegram_id: sender.telegram_id},
         data: {balance: {decrement: value}}
      })
   
      await prisma.user.update({
         where: {telegram_id: recipient.telegram_id},
         data: {received: {increment: value}}
      })
      
      console.log('Transaction successful')

      return txn

   } catch (error) {
      console.log('Error sending transaction: ', error)
      return new Error('Error sending transaction')
   }
   
}

export const getUserTransactions = async (telegram_id: string) => {
   // Fetch user by their telegram_id
   const user = await prisma.user.findFirst({ where: { telegram_id: { equals: telegram_id, mode: 'insensitive'}}
})
 
   if (!user) {
     throw new Error('User not found');
   }
 
   // Fetch transactions for the user
   const transactions = await prisma.transaction.findMany({
     where: {
       senderId: user.id,
     },
   });
 
   return transactions;
 }

 export const getUserByTGName = async (telegram_id: string) => {
   console.log('----------------- Starting new getUserByTGName command -----------------')
   const user = await prisma.user.findFirst({ where : {telegram_id: { equals: telegram_id, mode: 'insensitive'}}})

   if (!user) {
      return "User not found."
   }
   return user
 }

export const getUserByName = async (firstName: string) => {
   console.log('Looking for the user by their name values')

   const user = await prisma.user.findMany({ where: { firstName: { equals: firstName, mode: 'insensitive'}}})

   if (Array.isArray(user) && user.length > 1){
      console.log('User array: ', user)
   }
   if (!user) {
      return "User not found"
   }

   return user
}

 export const awardToken = async (telegram_id: string, amount: number) => {
   const user = await prisma.user.findFirst({where: {telegram_id: { equals: telegram_id, mode: 'insensitive'}}})
   if (!user) {
      throw new Error('User not found')
   }

   const updatedUser = await prisma.user.update({
      where: {telegram_id},
      data: {received: {increment: amount}}
   })

   return updatedUser
 }

export const createSession = async (creator: string, name: string, description: string, date: Date, time: number, location: string) => {
   let creatortg
   if (creator.startsWith('@')) {
      creatortg = creator.replace('@', '')
   } else {
      creatortg = creator
   }
   

   // const creatorUser = await prisma.user.findFirst({
   //    where: { telegram_id: {equals: creatortg, mode: 'insensitive'}}
   // })

   // const creatorId = creatorUser.id
   
   const newSession = await prisma.session.create({
      data: {
         name: name,
         description: description,
         date: date,
         time: time,
         location: location,
         facilitator: creatortg
      }
   })
   return newSession

}

type Event = {
   id: number
   name: string
   description: string
   date: Date
   time: number
   location: string
   facilitator: string
}

export const getSessions = async (): Promise<Event[]> => {
   const today = new Date()
   today.setHours(0, 0, 0, 0)

   const tomorrow = new Date(today)
   tomorrow.setDate(tomorrow.getDate() + 1)
   try {
      const events = await prisma.session.findMany({
         where: {
            date: {
               gte: today,
               lt: tomorrow
            }
         }
      })
      return events
   } catch (error) {
      console.log('Error getting sessions: ', error)
      return [] // Fix: Return an empty array instead of new Error('Error getting sessions')
   }
   
}