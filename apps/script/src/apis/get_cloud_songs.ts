import { eapiReqDecrypt, eapiReqEncrypt, eapiResDecrypt } from "../util/crypto";

async function getCloudSongs() {
    console.log("getting cloud songs");

    // 复制 原请求，替换URL 和 body中的 URL

    const originalRequest = $request!!;

    const decryptedParams = eapiReqDecrypt((originalRequest.body!! as string).split("=")[1])

    const encryptedParams = eapiReqEncrypt(decryptedParams!.url, decryptedParams!.data);


    $httpClient.post({
        url: `https://interface.music.163.com/eapi/v1/cloud/get`,
        method: originalRequest.method,
        headers: originalRequest.headers,
        body: `params=${encryptedParams}`,
        "binary-mode": true
    }, (error, response, data) => {
        if (error) {
            console.log("Request error:" + error);
            return;
        }

        if (data instanceof Uint8Array) {
            console.log("Response data is Uint8Array");
            const encryptedHex = Array.from(data)
                .map((byte: number) => byte.toString(16).padStart(2, '0'))
                .join(''); 

            const decryptedBody = eapiResDecrypt(encryptedHex);

            console.log("cloud songs:" + JSON.stringify(decryptedBody));
        } else {
            console.log("Response data is not Uint8Array");
        }
    });
}

export default getCloudSongs;