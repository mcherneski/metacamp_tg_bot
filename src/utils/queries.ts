import { message } from "telegraf/filters";
import { fetchCoordinapeData } from "./utils";
const circleId = 31099;

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
    `;
  const response = await fetchCoordinapeData(query);
  const data = await JSON.stringify(response);
  return data;
};

export const getUserByUsername = async (username: string) => {
  const query = `
        query GetUserByUsername {
            users(where: {profile: {name: {_eq: "${username}"}}}) {
            id
            give_token_received
            give_token_remaining
            }
        }
      `;

  const response = await fetchCoordinapeData(query);
  const data = await JSON.stringify(response);

  return data;
};

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
      `;
  const response = await fetchCoordinapeData(query);
  const data = await JSON.stringify(response);

  return data;
};

export const createUser = async (
  telegramName: string,
  walletAddress: string
) => {
  const date = new Date();
  console.log("Create User Query: ", date.toLocaleDateString());

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
    `;
  console.log("Create User Mutation: ", mutation);
  const response = await fetchCoordinapeData(mutation);

  const data = await JSON.stringify(response);
  console.log("Create User Response: ", data);
  return data;
};

export const balanceCheck = async (username: string, amount: number) => {
  const userBalance = await getUserByUsername(username);
  console.log("User Balance: ", userBalance);
  const data = await JSON.parse(userBalance);
  console.log("User Balance Data: ", data);
  const balance = data.data.users[0].give_token_remaining;

  console.log(
    `${username} has ${balance} tokens remaining. They are attempting to send ${amount} tokens.`
  );

  if (balance >= amount) {
    console.log("User has enough tokens to send.");
    return true;
  }

  return false;
};

export const sendToken = async (
  sender: string,
  recipient: string,
  amount: number,
  message?: string
) => {
  // Send amounts already verified in the bot code.
  console.log(
    `Send Token Function: ${sender} is sending ${amount} to ${recipient} with message ${message}`
  );
  // Get sender information
  const senderResponse = await getUserByUsername(sender);
  console.log("Sender Response: ", senderResponse);
  const senderData = await JSON.parse(senderResponse);
  console.log(`Sender Data: ${senderData}`);

  const recipientResponse = await getUserByUsername(recipient);
  console.log("Recipient response: ", recipientResponse);
  const recipientData = await JSON.parse(recipientResponse);
  console.log(`Recipient Data: ${recipientData}`);

  const senderId: number = senderData.data.users[0].id
  const currentSenderBalance = senderData.data.users[0].give_token_remaining;
  const newSenderBalance = currentSenderBalance - amount;
  console.log(
    `Current sender balance is ${currentSenderBalance} new balance will be ${newSenderBalance}`
  );

  const recipientId: number = recipientData.data.users[0].id
  const currentRecipientBalance = recipientData.data.users[0].give_token_received;
  const newRecipientBalance = currentRecipientBalance + amount;
  console.log(
    `Current recipient received balance is ${currentRecipientBalance}, new received balance will be ${newRecipientBalance}`
  );

  console.log(`Sender: ${senderId} recipient: ${recipientId} amount: ${amount} message: ${message}`)

    try {

        const sendTokens = `
        mutation SendTokens {
            updateAllocations(
              payload: {circle_id: ${circleId}, user_id: ${senderId}, allocations: {recipient_id: ${recipientId}, note: "${message}", tokens: ${amount}}}
            ) {
              user_id
              user {
                give_token_received
                give_token_remaining
                profile {
                  name
                }
                sent_gifts {
                  recipient {
                    id
                    profile {
                      name
                    }
                    give_token_received
                    give_token_remaining
                  }
                }
              }
            }
          }`
        const response = await fetchCoordinapeData(sendTokens);
        console.log('SendToken response: ', response)
        const data = await JSON.stringify(response);
        return data
  } catch (error) {
    const errorString = JSON.stringify({
        status: 'Update Allocation Failed',
        error: error
    })
    return errorString
  }
};

export const sendReward = async (
  recipient: string,
  amount: number,
  note: string
) => {
  // ADMIN FUNCTION FOR REWARDING USERS FOR ACTIONS
  // Pending sendMetaCash function working.

  const mutation = `
    mutation Reward {
        updateAllocations(
          payload: {circle_id: ${circleId}, allocations: {note: ${note}, recipient_id: ${recipient}, tokens: ${amount}}}
        )
      }
    `;

  const response = await fetchCoordinapeData(mutation);
  const data = await JSON.stringify(response);

  return data;
};
