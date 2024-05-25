import { Wallet } from 'ethers'

export const createWallet = async () => {

    const wallet = Wallet.createRandom()

    const privateKey = wallet.privateKey
    const address = wallet.address

    // Doesn't work so fix it later. 
    // const encryptAndStorePrivateKey = () => {
    //     const encryptedPrivateKey = CryptoJS.AES.encrypt(
    //       wallet()!.privateKey,
    //       password()
    //     ).toString();
    
    //     localStorage.setItem('encryptedPrivateKey', encryptedPrivateKey);
    //   };

    return JSON.stringify({
        address: address,
        privateKey: privateKey,
    })
}