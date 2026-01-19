// Loon 运行时全局对象类型声明

interface HttpClientRequestParams {
  /** 请求URL */
  url: string;
  /** 请求超时，单位ms，默认5000ms */
  timeout?: number;
  /** 请求头 */
  headers?: Record<string, string>;
  /** 请求体，仅在POST请求中有效，格式可以是json对象、字符串、二进制等 */
  body?: string | Record<string, unknown> | ArrayBuffer;
  /** 当有该字段时，会将body当做base64的格式解析成二进制 (build 612版本后有效) */
  "body-base64"?: boolean;
  /** 指定该请求使用哪一个节点或者策略组（可以是节点名称、策略组名称，也可以是Loon格式的节点描述） */
  node?: string;
  /** 请求响应返回二进制 */
  "binary-mode"?: boolean;
}

interface HttpClientResponse {
  /** HTTP状态码 */
  status: number;
  /** 响应头 */
  headers: Record<string, string>;
}

type HttpClientCallback = (
  /** 错误信息，无错误时为null或undefined */
  error: string | null | undefined,
  /** 响应对象 */
  response: HttpClientResponse,
  /** 响应body，binary-mode=true时或body无法转化为UTF8字符串时为二进制，否则为String类型 */
  data: string | ArrayBuffer,
) => void;

interface HttpClient {
  /** 发起一个HTTP GET请求 */
  get(params: HttpClientRequestParams, callback: HttpClientCallback): void;
  /** 发起一个HTTP POST请求 */
  post(params: HttpClientRequestParams, callback: HttpClientCallback): void;
  /** 发起一个HTTP PUT请求 */
  put(params: HttpClientRequestParams, callback: HttpClientCallback): void;
  /** 发起一个HTTP DELETE请求 */
  delete(params: HttpClientRequestParams, callback: HttpClientCallback): void;
  /** 发起一个HTTP HEAD请求 */
  head(params: HttpClientRequestParams, callback: HttpClientCallback): void;
  /** 发起一个HTTP OPTIONS请求 */
  options(params: HttpClientRequestParams, callback: HttpClientCallback): void;
  /** 发起一个HTTP PATCH请求 */
  patch(params: HttpClientRequestParams, callback: HttpClientCallback): void;
}

interface PersistentStore {
  /** 将value以key为键存储在本地，key不传时为当前脚本名字的hash值，存储成功返回true，失败返回false */
  write(value: string, key?: string): boolean;
  /** 读取保存在本地中key映射的值，key不传时为当前脚本名字的hash值，返回相应的value */
  read(key?: string): string | null;
  /** 清除所有使用脚本API保存在本地的数据 */
  remove(): void;
}

interface Utils {
  /** 查询IP地址的GEOIP，结果为ISO 3166 code */
  geoip(ipStr: string): string;
  /** 查询IP地址的ASN */
  ipasn(ipStr: string): string;
  /** 查询IP地址的ASO */
  ipaso(ipStr: string): string;
  /** 解压gzip的二进制数据，返回解压缩后的二进制数据 */
  ungzip(binary: Uint8Array): Uint8Array;
}

declare global {
  var $loon: {};
  var $httpClient: HttpClient;
  var $utils: Utils;
  var $persistentStore: PersistentStore;
}

export {};
