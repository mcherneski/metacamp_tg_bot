import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const createUser = async (telegram_id: string, walletAddress: string, chatId: string) => {
   const newUser = await prisma.user.create({
      data: {
         telegram_id: telegram_id,
         walletAddress: walletAddress,
         chatId: chatId
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
      await prisma.transaction.create({
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

      const response = {
         sender: sender.telegram_id,
         recipient: recipient.telegram_id,
         value: value,
         success: true
      }
      return JSON.stringify(response)

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

