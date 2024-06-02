import { z } from 'zod'

export const sendSchema = z.object({
   recipient: z.string().min(1),
   amount: z.number()
      .min(1,{message: 'Amount must be greater than 0'})
      .max(100,{message: 'Amount must be less than 100'})
      .int({message: 'Amount must be an integer'}),
   sender: z.string().min(1),
   message: z.string()
})

