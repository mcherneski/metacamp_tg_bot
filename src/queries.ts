import { fetchCoordinapeData } from "./utils"

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

export const getUserByTGUsername = async (username: string) => {
    const query = `
        query UserByTGUsername {
            users(where: {profile: {telegram_username: {_eq: "${username}"}}}) {
            id
            give_token_remaining
            give_token_received
            profile {
                telegram_username
                address
                name
            }
            }
        }
      `

      const response = await fetchCoordinapeData(query)
      const data = await JSON.stringify(response)

      return data
      
}

