import type http from "http";
import liburl from "url";
import { Cookie, CookieJar } from "tough-cookie";

declare module "http" {
  interface Agent {
    addRequest(
      req: http.ClientRequest,
      options: http.RequestOptions | any
    ): void;
  }
  interface ClientRequest {
    _headerSent: boolean;
    _header: string | null;
    _implicitHeader(): void;
    _onPendingData(amount: number): void;
    outputSize: number;
    outputData: Array<{
      data: string;
      encoding: string;
      callback: unknown;
    }>;
  }
}

type Primitive = string | number | bigint | boolean | symbol | null | undefined;
type Diff<T, U> = T extends U ? never : T;

export type CookieAgentOptions = {
  jar: CookieJar;
};

const GET_REQUEST_URL = Symbol("getRequestUrl");
const SET_COOKIE_HEADER = Symbol("setCookieHeader");
const CREATE_COOKIE_HEADER_STRING = Symbol("createCookieHeaderString");
const OVERWRITE_REQUEST_EMIT = Symbol("overwriteRequestEmit");

export function createCookieAgent<
  BaseAgent extends http.Agent = http.Agent,
  BaseAgentOptions = unknown,
  BaseAgentConstructorRestParams extends unknown[] = unknown[]
>(
  BaseAgentClass: new (
    options: BaseAgentOptions,
    ...rest: BaseAgentConstructorRestParams
  ) => BaseAgent
) {
  // @ts-ignore
  class CookieAgent extends BaseAgentClass {
    jar: CookieJar;

    constructor(
      options: Diff<BaseAgentOptions, Primitive> & CookieAgentOptions,
      ...rest: BaseAgentConstructorRestParams
    ) {
      super(options, ...rest);
      this.jar = options.jar;
    }

    private [GET_REQUEST_URL](req: http.ClientRequest): string {
      const requestUrl = liburl.format({
        protocol: req.protocol,
        host: req.host,
        pathname: req.path,
      });

      return requestUrl;
    }

    private async [CREATE_COOKIE_HEADER_STRING](
      req: http.ClientRequest
    ): Promise<string> {
      const requestUrl = this[GET_REQUEST_URL](req);

      const cookies = await this.jar.getCookies(requestUrl);
      const cookiesMap = new Map(cookies.map((cookie) => [cookie.key, cookie]));

      const cookieHeaderList = [req.getHeader("Cookie")].flat();

      for (const header of cookieHeaderList) {
        if (typeof header !== "string") {
          continue;
        }

        for (const str of header.split(";")) {
          const cookie = Cookie.parse(str.trim());
          if (cookie === undefined) {
            continue;
          }
          cookiesMap.set(cookie.key, cookie);
        }
      }

      const cookieHeader = Array.from(cookiesMap.values())
        .map((cookie) => cookie.cookieString())
        .join(";\x20");

      return cookieHeader;
    }

    private async [SET_COOKIE_HEADER](req: http.ClientRequest): Promise<void> {
      const cookieHeader = await this[CREATE_COOKIE_HEADER_STRING](req);

      if (cookieHeader === "") {
        return;
      }
      if (req._header === null) {
        req.setHeader("Cookie", cookieHeader);
        return;
      }

      const alreadyHeaderSent = req._headerSent;

      req._header = null;
      req.setHeader("Cookie", cookieHeader);
      req._implicitHeader();

      if (alreadyHeaderSent !== true) {
        return;
      }

      const firstChunk = req.outputData.shift()!;
      const dataWithoutHeader = firstChunk.data
        .split("\r\n\r\n")
        .slice(1)
        .join("\r\n\r\n");

      const chunk = {
        ...firstChunk,
        data: `${req._header}${dataWithoutHeader}`,
      };
      req.outputData.unshift(chunk);

      const diffSize = chunk.data.length - firstChunk.data.length;
      req.outputSize += diffSize;
      req._onPendingData(diffSize);
    }

    private async [OVERWRITE_REQUEST_EMIT](
      req: http.ClientRequest
    ): Promise<void> {
      const requestUrl = this[GET_REQUEST_URL](req);

      const emit = req.emit.bind(req);
      req.emit = (event: string, ...args: unknown[]): boolean => {
        if (event !== "response") {
          return emit(event, ...args);
        }

        const res = args[0] as http.IncomingMessage;

        (async () => {
          const cookies = res.headers["set-cookie"];
          if (cookies !== undefined) {
            for (const cookie of cookies) {
              await this.jar.setCookie(cookie, requestUrl, {
                ignoreError: true,
              });
            }
          }
        })()
          .then(() => emit("response", res))
          .catch((err) => emit("error", err));

        return req.listenerCount(event) !== 0;
      };
    }

    addRequest(req: http.ClientRequest, options: http.RequestOptions): void {
      Promise.resolve()
        .then(() => this[SET_COOKIE_HEADER](req))
        .then(() => this[OVERWRITE_REQUEST_EMIT](req))
        .then(() =>
          super.addRequest(req, {
            secureEndpoint: options.protocol === "https:",
            ...options,
          })
        )
        .catch((err) => req.emit("error", err));
    }
  }

  return CookieAgent;
}
