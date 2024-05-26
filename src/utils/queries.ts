import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const createUser = async (telegram_id: string, walletAddress: string) => {
   const newUser = await prisma.user.create({
      data: {
         telegram_id: telegram_id,
         walletAddress: walletAddress
      }
   })
   return newUser
}

export const sendTransaction = async (senderTelegram: string, recipientTelegram: string, value: number, message: string) => {
   const sender = await prisma.user.findUnique({where: {telegram_id: senderTelegram}})
   const recipient = await prisma.user.findUnique({where: {telegram_id: recipientTelegram}})
   
   if (!sender) {
      throw new Error('Sender not found')
   }

   if (!recipient) {
      throw new Error('Recipient not found')
   }

   if (sender.balance < value) {
      throw new Error('Not enough tokens to send')
   }
   try {
      const transaction = await prisma.transaction.create({
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
         where: {telegram_id: senderTelegram},
         data: {balance: {decrement: value}}
      })
   
      await prisma.user.update({
         where: {telegram_id: recipientTelegram},
         data: { received: {increment: value}}
      })
   
      return transaction
   } catch (error) {
      return new Error('Error sending transaction')
   }
   
}

export const getUserTransactions = async (telegram_id: string) => {
   // Fetch user by their telegram_id
   const user = await prisma.user.findUnique({ where: { telegram_id } });
 
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
   const user = await prisma.user.findUnique({ where : {telegram_id}})

   if (!user) {
      throw new Error('User not found')
   }
   return user
 }


 export const awardToken = async (telegram_id: string, amount: number) => {
   const user = await prisma.user.findUnique({where: {telegram_id}})
   if (!user) {
      throw new Error('User not found')
   }

   const updatedUser = await prisma.user.update({
      where: {telegram_id},
      data: {received: {increment: amount}}
   })

   return updatedUser
 }

