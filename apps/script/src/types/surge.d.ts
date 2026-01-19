// Surge 运行时全局对象类型声明
declare global {
  interface Request {
    url: string;
    method: string;
    headers: Record<string, string>;
    body?: string | Uint8Array;
  }

  interface Response {
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
    post(url: string, callback: (error: Error | null, response: Response | null, data?: string | Uint8Array) => void): void;
    post(options: HttpClientOptions, callback: (error: Error | null, response: Response | null, data?: string | Uint8Array) => void): void;
    get(url: string, callback: (error: Error | null, response: Response | null, data?: string | Uint8Array) => void): void;
    get(options: HttpClientOptions, callback: (error: Error | null, response: Response | null, data?: string | Uint8Array) => void): void;
    put(url: string, callback: (error: Error | null, response: Response | null, data?: string | Uint8Array) => void): void;
    put(options: HttpClientOptions, callback: (error: Error | null, response: Response | null, data?: string | Uint8Array) => void): void;
    delete(url: string, callback: (error: Error | null, response: Response | null, data?: string | Uint8Array) => void): void;
    delete(options: HttpClientOptions, callback: (error: Error | null, response: Response | null, data?: string | Uint8Array) => void): void;
    head(url: string, callback: (error: Error | null, response: Response | null, data?: string | Uint8Array) => void): void;
    head(options: HttpClientOptions, callback: (error: Error | null, response: Response | null, data?: string | Uint8Array) => void): void;
    options(url: string, callback: (error: Error | null, response: Response | null, data?: string | Uint8Array) => void): void;
    options(options: HttpClientOptions, callback: (error: Error | null, response: Response | null, data?: string | Uint8Array) => void): void;
    patch(url: string, callback: (error: Error | null, response: Response | null, data?: string | Uint8Array) => void): void;
    patch(options: HttpClientOptions, callback: (error: Error | null, response: Response | null, data?: string | Uint8Array) => void): void;
  }

  interface PersistentStore {
    write(data: string, key: string): void;
    read(key: string): string | null | undefined;
  }

  var $request: Request
  var $response: Response | null | undefined;
  var $httpClient: HttpClient;
  var $persistentStore: PersistentStore;
  
  // setTimeout(function[, delay])
  // Same as the setTimeout in browsers.
  function setTimeout(handler: () => void, delay?: number): number;

  interface Utils {
    // $utils.geoip(ip<String>)
    // Perform a GeoIP lookup. The results are in the ISO 3166 code.
    geoip(ip: string): string;
    // $utils.ipasn(ip<String>)
    // Look up the ASN of the IP address.
    ipasn(ip: string): string;
    // $utils.ipaso(ip<String>)
    // Look up the ASO of the IP address.
    ipaso(ip: string): string;
    // $utils.ungzip(binary<Uint8Array>)
    // Decompress gzip data. The result is also a Uint8Array.
    ungzip(binary: Uint8Array): Uint8Array;
  }
  var $utils: Utils;
  
  function $done(options?: {
    status?: number;
    headers?: Record<string, string>;
    body?: string | Uint8Array;
  }): void;
}

export {};
