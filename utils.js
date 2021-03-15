const eccrypto = require("eccrypto");
const memorySizeOf = function(obj) {
    var bytes = 0;

    function sizeOf(obj) {
        if(obj !== null && obj !== undefined) {
            switch(typeof obj) {
            case 'number':
                bytes += 8;
                break;
            case 'string':
                bytes += obj.length * 2;
                break;
            case 'boolean':
                bytes += 4;
                break;
            case 'object':
                var objClass = Object.prototype.toString.call(obj).slice(8, -1);
                if(objClass === 'Object' || objClass === 'Array') {
                    for(var key in obj) {
                        if(!obj.hasOwnProperty(key)) continue;
                        sizeOf(obj[key]);
                    }
                } else bytes += obj.toString().length * 2;
                break;
            }
        }
        return bytes;
    };

    function formatByteSize(bytes) {
        if(bytes < 1024) return bytes + " bytes";
        else if(bytes < 1048576) return(bytes / 1024).toFixed(3) + " KiB";
        else if(bytes < 1073741824) return(bytes / 1048576).toFixed(3) + " MiB";
        else return(bytes / 1073741824).toFixed(3) + " GiB";
    };

    return formatByteSize(sizeOf(obj));
};

const encryptData = function(destKey, data){
    try {

        

        const iv = Buffer.alloc(16);
        iv.fill(5);
        const ephemPrivateKey = Buffer.alloc(32);
        ephemPrivateKey.fill(4);
        const encOpts = {ephemPrivateKey: ephemPrivateKey, iv: iv};
        return new Promise((resolve) => {
            eccrypto.encrypt(destKey, Buffer.from(data), encOpts).then(function (result) {
                // console.log(result)
                resolve(result);
            })
        })
    }catch(err) {
        console.error("Error while encrypting key:",err)
        return null
    }
}

const decryptData = function(privateKey, data){
    try {
        return new Promise((resolve) => {
            eccrypto.decrypt(privateKey, data)
                .then(function (decryptedData) {
                    // console.log('Decrypted key:', JSON.parse(decryptedData))
                    resolve(decryptedData)
                });
        })

    }catch(err){
        console.error("Error while decrypting key:",err)
        return null
    }
}

module.exports = { memorySizeOf, encryptData, decryptData }