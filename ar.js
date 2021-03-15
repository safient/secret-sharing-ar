const { ethers } = require("ethers");
const eccrypto = require("eccrypto");
const path = require("path");
const fs = require("fs-extra");
const { memorySizeOf, encryptData, decryptData } = require('./utils.js');


// const wallet = ethers.Wallet.createRandom()

function generateUserKeys(userCount) {

     // Generating user private, public key pairs

     let userKeys = [];
     for (userIndex = 0; userIndex < userCount; userIndex++) {
         let privateKey = eccrypto.generatePrivate();
         userKeys.push({private: privateKey,
     public: eccrypto.getPublic(privateKey) })
         console.log(`Generated user ${userIndex} keys`)
         console.log(`Private: ${privateKey.toString('hex')}, \nPublic: ${eccrypto.getPublic(privateKey).toString('hex')}\n\n` )    
     
     }

     return userKeys;

}

function readUserKeys() {

    console.log("Reading user keys from ./userKeys.json\n\n")
    return JSON.parse(fs.readFileSync('./userKeys.json'));

}

function readSecretShare() {

    return fs.readFileSync('./encryptedData.json');

}

async function generateSecretShare(userKeys, secretCipherText) {

    for (userIndex = 0; userIndex < userKeys.length; userIndex++) {
        
        // Temporary cipher text computation using each user keys
        secretCipherText = await encryptData(Buffer.from(userKeys[userIndex].public), JSON.stringify(secretCipherText))
    }

    return secretCipherText;
}

async function recoverSecret(userKeys, secretDecryptedText) {

    for (userIndex = 0; userIndex < userKeys.length; userIndex++) {

        secretDecryptedText = {iv: Buffer.from(JSON.parse(secretDecryptedText).iv),
            ephemPublicKey: Buffer.from(JSON.parse(secretDecryptedText).ephemPublicKey),
            ciphertext: Buffer.from(JSON.parse(secretDecryptedText).ciphertext),
            mac: Buffer.from(JSON.parse(secretDecryptedText).mac)}
        
        // Temporary cipher text computation using each user keys
        secretDecryptedText = await decryptData(Buffer.from(userKeys[userKeys.length - userIndex -1].private), secretDecryptedText)
        
    }
    return secretDecryptedText;

}

async function main() {  

   
    let userKeys = generateUserKeys(5);
    console.log("Writing user keys to ./userKeys.json\n\n")
    fs.writeFileSync(path.resolve("./userKeys.json"), JSON.stringify(userKeys))

    userKeys = readUserKeys()

    // Encrypting the data using multiple user keys
    const secretPainText = {type: "mnemonic", data: "indoor dish desk flag debris potato excuse depart ticket judge file exit"};
    const secretCipherText = await generateSecretShare(userKeys, secretPainText);

    console.log("Writing encrypted data to ./encryptedData.json\n\n")
    fs.writeFileSync(path.resolve("./encryptedData.json"), JSON.stringify(secretCipherText))


    // Decrypting the data using multiple user keys
    console.log("Reading encrypted data from ./encryptedData.json\n\n")
    const secretShare = readSecretShare()
    
    let recoveredSecret = await recoverSecret(userKeys, secretShare);
    
    
    console.log("Recovered secret text: ", recoveredSecret.toString())
    console.log("Total size of the cipher text: ", memorySizeOf(secretCipherText))
    console.log("Total size of the secret plain text: ", memorySizeOf(secretPainText))

}

main();  
