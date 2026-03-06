import http from "http";
import https from "https";
import net from "net";

const ALLOWED_HOST_SUFFIXES = [
  "localhost",
  "127.0.0.1",
  "accufinservices.ca",
  "ep-billowing-dew-ail3afew.c-4.us-east-1.aws.neon.tech",
  "ep-billowing-dew-ail3afew-pooler.c-4.us-east-1.aws.neon.tech",
  "amazonaws.com",
  "googleusercontent.com",
];

function isAllowed(host: any) {
  if (!host) return false;
  const h = String(host).toLowerCase();
  return ALLOWED_HOST_SUFFIXES.some((suffix) => h === suffix || h.endsWith(`.${suffix}`));
}

function logConnection(prefix: string, host: any, port: any, path?: any) {
  const stack = new Error().stack?.split("\n").slice(2, 8).join(" | ") ?? "";
  console.error(`[net-debug] ${prefix} host=${host} port=${port} path=${path ?? ""} stack=${stack}`);
}

const origConnect = net.connect;
(net as any).connect = function (...args: any[]) {
  const opts = typeof args[0] === "object" ? args[0] : { port: args[0], host: args[1] };
  if (!isAllowed((opts as any).host)) {
    throw new Error(`[net-debug] blocked outbound host ${(opts as any).host}`);
  }
  logConnection("net.connect", (opts as any).host, (opts as any).port);
  return origConnect.apply(net, args as any);
};

const origHttpRequest = http.request;
(http as any).request = function (options: any, cb?: any) {
  const host = options?.hostname ?? options?.host;
  const port = options?.port ?? 80;
  const path = options?.path;
  if (!isAllowed(host)) {
    throw new Error(`[net-debug] blocked outbound host ${host}`);
  }
  logConnection("http.request", host, port, path);
  return origHttpRequest.call(http, options, cb);
};

const origHttpsRequest = https.request;
(https as any).request = function (options: any, cb?: any) {
  const host = options?.hostname ?? options?.host;
  const port = options?.port ?? 443;
  const path = options?.path;
  if (!isAllowed(host)) {
    throw new Error(`[net-debug] blocked outbound host ${host}`);
  }
  logConnection("https.request", host, port, path);
  return origHttpsRequest.call(https, options, cb);
};