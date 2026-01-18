// Surge 运行时全局对象类型声明
declare global {
  interface RuntimeRequest {
    url: string;
    method: string;
    headers: Record<string, string>;
    body?: string | Uint8Array;
  }

  interface RuntimeResponse {
    status?: number;
    headers: Record<string, string>;
    body?: string | Uint8Array;
  }

  interface HttpClientOptions {
    url: string;
    method?: string;
    headers?: Record<string, string>;
    'binary-mode'?: boolean;
    body?: string | Uint8Array;
  }

  interface HttpClient {
    post(url: string, callback: (error: Error | null, response: RuntimeResponse | null, data?: string | Uint8Array) => void): void;
    post(options: HttpClientOptions, callback: (error: Error | null, response: RuntimeResponse | null, data?: string | Uint8Array) => void): void;
  }

  interface PersistentStore {
    write(data: string, key: string): void;
    read(key: string): string | null | undefined;
  }

  var $request: RuntimeRequest
  var $response: RuntimeResponse | null | undefined;
  var $httpClient: HttpClient;
  var $persistentStore: PersistentStore;
  
  function $done(options?: {
    status?: number;
    headers?: Record<string, string>;
    body?: string | Uint8Array;
  }): void;
}

export {};
