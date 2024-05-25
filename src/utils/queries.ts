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

export const getUserById = async (username: string) => {
    const query = `
        query GetUserById($_eq: bigint = "296490") {
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

export const sendToken = async (sender: string, recipient: string, amount: number) => {

    // NEEDS WORK
    // Get Recipient user ID
    
    const senderAPI = await getUserById(recipient)
    const senderData = await JSON.parse(senderAPI)
    const senderId = senderData.id

    // const recipientAPI = await getUserByUsername(recipient)
    // const recipientData = await JSON.parse(recipientAPI)
    // const recipientId = recipientData.id
    // console.log('Recipient ID: ', recipientId)

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

