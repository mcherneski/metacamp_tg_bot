import { fetchCoordinapeData } from "./utils"
const circleId = 31099

export const getAllUsers = async () => {
    const query = `
        query UsersQuery {
            users {
            give_token_received
            give_token_remaining
            id
            circle_id
            profile {
                name
                telegram_username
            }
            }
        }      
    `
    const response = await fetchCoordinapeData(query)
    const data = await JSON.stringify(response)
    return data
}

export const getUserByUsername = async (username: string) => {
    const query = `
        query GetUserByUsername {
            users(where: {profile: {name: {_eq: "${username}"}}}) {
            id
            give_token_received
            give_token_remaining
            }
        }
      `

      const response = await fetchCoordinapeData(query)
      const data = await JSON.stringify(response)
      
      return data
}

export const getUserById = async (id: string) => {
    const query = `
        query GetUserById($_eq: bigint = "${id}") {
            users(where: {id: {_eq: $_eq}}) {
            profile {
                address
                created_at
                name
                telegram_username
                updated_at
            }
            give_token_received
            give_token_remaining
            circle_id
            id
            }
        }
      `
      const response = await fetchCoordinapeData(query)
      const data = await JSON.stringify(response)

      return data
}

export const createUser = async (telegramName: string, walletAddress: string) => {
    const date = new Date()
    console.log('Create User Query: ', date.toLocaleDateString())
    
    const mutation = `
    mutation CreateUser{
        createUsers(
          payload: {circle_id: ${circleId}, users: {name: "${telegramName}", entrance: "0", address: "${walletAddress}"}}
        ) {
          id
          UserResponse {
            id
            created_at
            circle_id
            profile {
                id
                name
              }
          }
        }
      }
    `
    console.log('Create User Mutation: ', mutation)
    const response = await fetchCoordinapeData(mutation)
    

    const data = await JSON.stringify(response)
    console.log('Create User Response: ', data)
    return data
}

export const balanceCheck = async (username: string, amount: number) => {
    const userBalance = await getUserByUsername(username)
    console.log('User Balance: ', userBalance)
    const data = await JSON.parse(userBalance)
    console.log('User Balance Data: ', data)
    const balance = data.data.users[0].give_token_remaining

    console.log(`${username} has ${balance} tokens remaining. They are attempting to send ${amount} tokens.`)

    if (balance >= amount) {
        console.log('User has enough tokens to send.')
        return true
    }

    return false
}

export const sendToken = async (sender: string, recipient: string, amount: number) => {
    // Send amounts already verified in the bot code. 
    console.log(`Send Token Function: ${sender} is sending ${amount} to ${recipient}`)
    // Get sender information
    const senderResponse = await getUserByUsername(sender)
    const senderData = await JSON.parse(senderResponse)
    console.log(`Sender Data: ${senderData}`)

    const recipientResponse = await getUserByUsername(recipient)
    const recipientData = await JSON.parse(recipientResponse)
    console.log(`Recipient Data: ${recipientData}`)

    const currentSenderBalance = senderData.data.users[0].give_token_remaining

    console.log('Current sender balance is: ', currentSenderBalance)

    // const recipientAPI = await getUserByUsername(recipient)
    // const recipientData = await JSON.parse(recipientAPI)
    // const recipientId = recipientData.id
    // console.log('Recipient ID: ', recipientId)

    // const sendTokens = `
    //     mutation SendTokens {
    //         updateAllocations(
    //         payload: {circle_id: ${circleId}, allocations: {note: Sent ${recipient} ${amount}!, recipient_id:${senderId} , tokens: ${amount}}}
    //         )
    //     }
    // `
    // const response = await fetchCoordinapeData(sendTokens)
    // const data = await JSON.stringify(response)
    
    // return data
    return 'Send Tokens Function not working yet.'
}



export const sendReward = async (recipient: string, amount: number, note: string) => {
    // ADMIN FUNCTION FOR REWARDING USERS FOR ACTIONS
    // Pending sendMetaCash function working. 

    const mutation = `
    mutation Reward {
        updateAllocations(
          payload: {circle_id: ${circleId}, allocations: {note: ${note}, recipient_id: ${recipient}, tokens: ${amount}}}
        )
      }
    `

    const response = await fetchCoordinapeData(mutation)
    const data = await JSON.stringify(response)

    return data
}

