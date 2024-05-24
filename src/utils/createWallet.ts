import ethers from 'ethers'

export const createWallet = async () => {

    const wallet = await ethers.Wallet.createRandom()

    const privateKey = wallet.privateKey
    const address = wallet.address

    return JSON.stringify({
        address: address,
        privateKey: privateKey,
    })
}