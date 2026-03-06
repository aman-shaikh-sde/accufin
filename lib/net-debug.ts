import http from "http";
import https from "https";
import net from "net";

function logConnection(prefix: string, host: any, port: any, path?: any) {
  const stack = new Error().stack?.split("\n").slice(2, 8).join(" | ") ?? "";
  console.error(`[net-debug] ${prefix} host=${host} port=${port} path=${path ?? ""} stack=${stack}`);
}

const origConnect = net.connect;
(net as any).connect = function (...args: any[]) {
  const opts = typeof args[0] === "object" ? args[0] : { port: args[0], host: args[1] };
  logConnection("net.connect", (opts as any).host, (opts as any).port);
  return origConnect.apply(net, args as any);
};

const origHttpRequest = http.request;
(http as any).request = function (options: any, cb?: any) {
  const host = options?.hostname ?? options?.host;
  const port = options?.port ?? 80;
  const path = options?.path;
  logConnection("http.request", host, port, path);
  return origHttpRequest.call(http, options, cb);
};

const origHttpsRequest = https.request;
(https as any).request = function (options: any, cb?: any) {
  const host = options?.hostname ?? options?.host;
  const port = options?.port ?? 443;
  const path = options?.path;
  logConnection("https.request", host, port, path);
  return origHttpsRequest.call(https, options, cb);
};