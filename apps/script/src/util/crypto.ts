import CryptoJS from "crypto-js";

const iv = '0102030405060708'
const presetKey = '0CoJUm6Qyw8W8jud'
const linuxapiKey = 'rFgB&h#%2?^eDg:Q'
const base62 = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
const publicKey = `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDgtQn2JZ34ZC28NWYpAUd98iZ37BUrX/aKzmFbt7clFSs6sXqHauqKWqdtLkF2KexO40H1YTX8z2lSgBBOAxLsvaklV8k4cBFK9snQXE9/DDaFt6Rr7iVZMldczhC0JNgTz+SHXT6CBHuX3e9SdB1Ua44oncaTWz7OBGLbCiK45wIDAQAB
-----END PUBLIC KEY-----`
const eapiKey = 'e82ckenh8dichen8'

function aesEncrypt(text: string, key: string, iv: string, format: string = 'base64'): string | Uint8Array {
    let encrypted = CryptoJS.AES.encrypt(
        CryptoJS.enc.Utf8.parse(text),
        CryptoJS.enc.Utf8.parse(key),
        {
            iv: CryptoJS.enc.Utf8.parse(iv),
            mode: CryptoJS.mode.ECB, // WARN !! mode ? 
            padding: CryptoJS.pad.Pkcs7,
        },
    )

    if (format === 'base64') {
        return encrypted.toString()
    }

    if (format === 'uint8array') {
        // 将 WordArray 转换为 Uint8Array
        const words = encrypted.ciphertext.words
        const sigBytes = encrypted.ciphertext.sigBytes
        const bytes = new Uint8Array(sigBytes)
        
        for (let i = 0; i < sigBytes; i++) {
            const byte = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff
            bytes[i] = byte
        }
        
        return bytes
    }


    return encrypted.ciphertext.toString().toUpperCase() // default to hex
}

function aesDecrypt(ciphertext: string, key: string, iv: string, format: string = 'base64') {
    let bytes
    if (format === 'base64') {
        bytes = CryptoJS.AES.decrypt(ciphertext, CryptoJS.enc.Utf8.parse(key), {
            iv: CryptoJS.enc.Utf8.parse(iv),
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7,
        })
    } else {
        const cipherParams = CryptoJS.lib.CipherParams.create({
            ciphertext: CryptoJS.enc.Hex.parse(ciphertext),
        })
        bytes = CryptoJS.AES.decrypt(
            cipherParams,
            CryptoJS.enc.Utf8.parse(key),
            {
                iv: CryptoJS.enc.Utf8.parse(iv),
                mode: CryptoJS.mode.ECB,
                padding: CryptoJS.pad.Pkcs7,
            },
        )
    }
    return bytes.toString(CryptoJS.enc.Utf8)
}

// https://interface.music.163.com/eapi

// eapi 请求解密
function eapiReqDecrypt(encryptedParams: string) {
    // 使用aesDecrypt解密参数
    const decryptedData = aesDecrypt(encryptedParams, eapiKey, '', 'hex')
    // 使用正则表达式解析出URL和数据
    //${urlPath}-36cd479b6b5-${payloadJson}-36cd479b6b5-${digest}`
    const match = decryptedData.match(/(.*?)-36cd479b6b5-(.*?)-36cd479b6b5-(.*)/)

    if (match) {
        const url = match[1]
        const data = JSON.parse(match[2])
        return { url, data }
    }

    // 如果没有匹配到，返回null
    return null
}


function eapiReqEncrypt(url:string,decryptedParams: object) {
    const urlPath = new URL(url).pathname;
    const payloadJson = JSON.stringify(decryptedParams);
    const digest = CryptoJS.MD5(`nobody${urlPath}use${payloadJson}md5forencrypt`).toString();
    const textToEncrypt = `${urlPath}-36cd479b6b5-${payloadJson}-36cd479b6b5-${digest}`;
    const encryptedParams = aesEncrypt(textToEncrypt, eapiKey, '', 'hex')
    return encryptedParams
}

// eapi 响应解密
function eapiResDecrypt(encryptedParams: string) {
    let pureHexString = encryptedParams.replace(/\s/g, '')
    // 使用aesDecrypt解密参数
    try {
        const decryptedData = aesDecrypt(pureHexString, eapiKey, '', 'hex')
        return JSON.parse(decryptedData)
    } catch (error) {
        console.log('eapiResDecrypt error:', error)
        return null
    }
}

// eapi 响应加密
function eapiResEncrypt(body: object): Uint8Array {
    const encryptedData = aesEncrypt(JSON.stringify(body), eapiKey, '', 'uint8array')
    return encryptedData as Uint8Array
}

export { eapiReqDecrypt, eapiResDecrypt,eapiResEncrypt,eapiReqEncrypt}