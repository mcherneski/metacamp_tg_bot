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
        mutation CreateUser {
            createUsers(
            payload: {circle_id: ${circleId}, users: {address: ${walletAddress}, name: ${telegramName}, starting_tokens: 100, entrance: "0"}}
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
    const data = await JSON.stringify(response)

    return data
}

export const sendMetaCash = async (sender: string, recipient: string, amount: number) => {
    const query = `

    `
}

export const sendReward = async (recipient: string, amount: number, note: string) => {
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

