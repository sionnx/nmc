import logger from "@/util/logger";

/**
 * 统一的请求参数接口
 */
export interface HttpRequestOptions {
  /** 请求URL */
  url: string;
  /** 请求方法 */
  method?: "GET" | "POST" | "PUT" | "DELETE" | "HEAD" | "OPTIONS" | "PATCH";
  /** 请求头 */
  headers?: Record<string, string>;
  /** 请求体 */
  body?: string | Uint8Array | Record<string, unknown>;
  /** 请求超时时间（毫秒），默认 5000ms */
  timeout?: number;
  /** 是否返回二进制数据 */
  binaryMode?: boolean;
}

/**
 * 统一的响应接口
 */
export interface HttpResponse {
  /** HTTP状态码 */
  status: number;
  /** 响应头 */
  headers: Record<string, string>;
  /** 响应体 */
  body: string | Uint8Array | ArrayBuffer;
}

/**
 * 运行时类型检测
 */
const isLoon = typeof $loon !== "undefined";
const isSurge = typeof $httpClient !== "undefined" && !isLoon;
const isNode = eval(`typeof process !== "undefined"`);

/**
 * Surge 运行时的请求实现
 */
function surgeRequest(options: HttpRequestOptions): Promise<HttpResponse> {
  return new Promise((resolve, reject) => {
    const method = (options.method || "GET").toLowerCase();
    const httpClient = $httpClient as any;

    const surgeOptions = {
      url: options.url,
      headers: options.headers,
      body: options.body as string | Uint8Array | undefined,
      "binary-mode": options.binaryMode,
    };

    logger.debug(`[Surge] ${options.method || "GET"} ${options.url}`);

    httpClient[method](
      surgeOptions,
      (error: Error | null, response: any, data: string | Uint8Array) => {
        if (error) {
          reject(error);
        } else if (!response) {
          reject(new Error("Response is null"));
        } else {
          resolve({
            status: response.status || 200,
            headers: response.headers || {},
            body: data,
          });
        }
      }
    );
  });
}

/**
 * Loon 运行时的请求实现
 */
function loonRequest(options: HttpRequestOptions): Promise<HttpResponse> {
  return new Promise((resolve, reject) => {
    const method = (options.method || "GET").toLowerCase();
    const httpClient = $httpClient as any;

    const loonParams = {
      url: options.url,
      headers: options.headers,
      body: options.body,
      timeout: options.timeout,
      "binary-mode": options.binaryMode,
    };

    logger.debug(`[Loon] ${options.method || "GET"} ${options.url}`);

    httpClient[method](
      loonParams,
      (error: string | null, response: any, data: string | ArrayBuffer) => {
        if (error) {
          reject(new Error(error));
        } else {
          resolve({
            status: response.status,
            headers: response.headers,
            body: data,
          });
        }
      }
    );
  });
}

/**
 * Node.js 运行时的请求实现
 */
async function nodeRequest(options: HttpRequestOptions): Promise<HttpResponse> {
  logger.debug(`[Node] ${options.method || "GET"} ${options.url}`);

  const fetchOptions: RequestInit = {
    method: options.method || "GET",
    headers: options.headers,
  };

  // 处理请求体
  if (options.body) {
    if (typeof options.body === "string") {
      fetchOptions.body = options.body;
    } else if (options.body instanceof Uint8Array) {
      fetchOptions.body = options.body;
    } else {
      fetchOptions.body = JSON.stringify(options.body);
      if (!options.headers) {
        options.headers = {};
      }
      options.headers["Content-Type"] = "application/json";
    }
  }

  try {
    const response = await fetch(options.url, fetchOptions);
    const data = options.binaryMode
      ? await response.arrayBuffer()
      : await response.text();

    // 转换 Headers 对象为普通对象
    const headers: Record<string, string> = {};
    const headersIterable = response.headers as any;
    for (const [key, value] of headersIterable.entries()) {
      headers[key] = value;
    }

    return {
      status: response.status || 200,
      headers: headers,
      body: data,
    };
  } catch (error) {
    throw new Error(`Node request failed: ${error}`);
  }
}

/**
 * 统一的 HTTP 请求方法
 * 根据运行时自动选择对应的实现
 */
export function request(options: HttpRequestOptions): Promise<HttpResponse> {
  if (isSurge) {
    return surgeRequest(options);
  } else if (isLoon) {
    return loonRequest(options);
  } else if (isNode) {
    return nodeRequest(options);
  } else {
    return Promise.reject(new Error("Unsupported runtime environment"));
  }
}

/**
 * GET 请求快捷方法
 */
export function get(
  url: string,
  options?: Omit<HttpRequestOptions, "url" | "method">
): Promise<HttpResponse> {
  return request({
    ...options,
    url,
    method: "GET",
  });
}

/**
 * POST 请求快捷方法
 */
export function post(
  url: string,
  body?: string | Uint8Array | Record<string, unknown>,
  options?: Omit<HttpRequestOptions, "url" | "method" | "body">
): Promise<HttpResponse> {
  return request({
    ...options,
    url,
    method: "POST",
    body,
  });
}
