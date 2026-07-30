import test from "node:test";
import assert from "node:assert/strict";
import { getRedditToken, searchReddit } from "../src/reddit.js";

function withRedditEnv(callback) {
  const before = {
    REDDIT_CLIENT_ID: process.env.REDDIT_CLIENT_ID,
    REDDIT_CLIENT_SECRET: process.env.REDDIT_CLIENT_SECRET,
    REDDIT_USER_AGENT: process.env.REDDIT_USER_AGENT
  };

  process.env.REDDIT_CLIENT_ID = "test-id";
  process.env.REDDIT_CLIENT_SECRET = "test-secret";
  process.env.REDDIT_USER_AGENT = "travel-radar-tests";

  return Promise.resolve(callback()).finally(() => {
    for (const [key, value] of Object.entries(before)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });
}

test("requests a Reddit application token without exposing credentials", () =>
  withRedditEnv(async () => {
    let request;
    const fakeFetch = async (url, options) => {
      request = { url, options };
      return {
        ok: true,
        json: async () => ({ access_token: "test-token" })
      };
    };

    const token = await getRedditToken(fakeFetch);

    assert.equal(token, "test-token");
    assert.equal(request.url, "https://www.reddit.com/api/v1/access_token");
    assert.match(request.options.headers.Authorization, /^Basic /);
    assert.equal(request.options.body, "grant_type=client_credentials");
  }));

test("searches Reddit with a bounded limit", () =>
  withRedditEnv(async () => {
    const calls = [];
    const fakeFetch = async (url, options) => {
      calls.push({ url: String(url), options });
      if (calls.length === 1) {
        return {
          ok: true,
          json: async () => ({ access_token: "test-token" })
        };
      }
      return {
        ok: true,
        json: async () => ({ data: { children: [] } })
      };
    };

    const result = await searchReddit({ query: "Albania travel", limit: 999 }, fakeFetch);

    assert.deepEqual(result, { data: { children: [] } });
    assert.match(calls[1].url, /limit=100/);
    assert.match(calls[1].url, /q=Albania\+travel/);
    assert.equal(calls[1].options.headers.Authorization, "Bearer test-token");
  }));
