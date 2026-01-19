import  { cacheSearchKeyword,processSearchResult} from "./processes/process_search_result";
import { eapiReqDecrypt, eapiResDecrypt, eapiResEncrypt } from "./util/crypto";
import { cacheCloudSongs } from "./processes/cache_cloud_songs";
import logger from "@/util/logger";

async function processRequest() {
  console.log("received request");

  // 判断 body 的类型
  if ($request && $request.body !== undefined) {
    if (typeof $request.body === "string") {
      logger.debug("body type: string");
      //console.log("body content:" + $request.body);

      const bodyParts = $request.body.split("=");
      const encryptedParams = bodyParts[1];
      const decryptedParams = eapiReqDecrypt(encryptedParams);
      logger.debug("decrypted params:" + JSON.stringify(decryptedParams));

      cacheSearchKeyword(decryptedParams!.data);

    } else if ($request.body instanceof Uint8Array) {
      logger.debug("body type: Uint8Array");
    } else {
      logger.debug("body type: unknown", typeof $request.body);
    }
  } else {
    logger.warn("body is undefined or request is null");
  }
}

async function processResponse() {
  logger.debug("received response");
  if ($response && $response.body !== undefined && $response.body !== null) {
    const body_array = $response.body as Uint8Array; 
    const resp_body_array = Array.from(body_array)
    const encryptedHex = resp_body_array
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join(''); 

    const decryptedBody = eapiResDecrypt(encryptedHex);
   // console.log("decrypted body:" + JSON.stringify(decryptedBody));

    cacheCloudSongs(decryptedBody);

    const processedBody = processSearchResult($request!!.url, decryptedBody) || decryptedBody;

    const encryptedBody:Uint8Array = eapiResEncrypt(decryptedBody);

    $done({body: encryptedBody});

  } else {
    logger.warn("body is undefined or response is null");
  }
}

(async () => {
  try {
    if (typeof $response === "undefined" || $response == null) {
      await processRequest();
    } else {
      await processResponse();
    }
    $done({});
  } catch (err) {
    logger.error("Error in main execution:" +  err);
    $done({});
  }
})();
