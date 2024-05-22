export const usersQuery = `
    query MyQuery {
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