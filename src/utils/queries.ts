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
            users(where: {profile: {name: {_eq: ${username}}}}) {
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
    const mutation = `
    mutation CreateUser($circle_id: Int = 31099, $address: String = "", $name: String = "") {
        createUsers(
          payload: {circle_id: $circle_id, users: {name: ${telegramName}, entrance: "0", address: ${walletAddress}}}
        ) {
          id
          UserResponse {
            id
            give_token_remaining
            created_at
            circle_id
            starting_tokens
          }
        }
      }
    `

    const response = await fetchCoordinapeData(mutation)
    console.log('Create User Response: ', response)

    const data = await JSON.stringify(response)

    return data
}

export const sendMetaCash = async (sender: string, recipient: string, amount: number) => {

    // NEEDS WORK

    const senderAPI = await getUserByUsername(recipient)
    const senderData = await JSON.parse(senderAPI)
    const senderId = senderData.id

    const recipientAPI = await getUserByUsername(recipient)
    const recipientData = await JSON.parse(recipientAPI)
    const recipientId = recipientData.id
    console.log('Recipient ID: ', recipientId)

    const sendTokens = `
        mutation SendTokens {
            updateAllocations(
            payload: {circle_id: ${circleId}, allocations: {note: Sent ${recipient} ${amount}!, recipient_id:${senderId} , tokens: ${amount}}}
            )
        }
    `
    const response = await fetchCoordinapeData(sendTokens)
    const data = await JSON.stringify(response)
    
    return data
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

