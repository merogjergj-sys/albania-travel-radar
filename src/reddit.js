const TOKEN_URL = "https://www.reddit.com/api/v1/access_token";
const SEARCH_URL = "https://oauth.reddit.com/search";

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name}. See README.md for Reddit API setup.`);
  }
  return value;
}

export async function getRedditToken(fetchImpl = fetch) {
  const clientId = requireEnv("REDDIT_CLIENT_ID");
  const clientSecret = requireEnv("REDDIT_CLIENT_SECRET");
  const userAgent = process.env.REDDIT_USER_AGENT ?? "albania-travel-radar/0.1";
  const authorization = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const response = await fetchImpl(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${authorization}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": userAgent
    },
    body: "grant_type=client_credentials"
  });

  if (!response.ok) {
    throw new Error(`Reddit token request failed with HTTP ${response.status}.`);
  }

  const data = await response.json();
  if (!data.access_token) {
    throw new Error("Reddit did not return an access token.");
  }

  return data.access_token;
}

export async function searchReddit(options = {}, fetchImpl = fetch) {
  const token = await getRedditToken(fetchImpl);
  const userAgent = process.env.REDDIT_USER_AGENT ?? "albania-travel-radar/0.1";
  const query = options.query ?? 'Albania (travel OR visit OR itinerary OR "tour guide")';
  const limit = Math.max(1, Math.min(100, Number(options.limit ?? 50)));
  const time = options.time ?? "month";
  const sort = options.sort ?? "new";
  const url = new URL(SEARCH_URL);

  url.search = new URLSearchParams({
    q: query,
    limit: String(limit),
    sort,
    t: time,
    type: "link"
  }).toString();

  const response = await fetchImpl(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "User-Agent": userAgent
    }
  });

  if (!response.ok) {
    throw new Error(`Reddit search failed with HTTP ${response.status}.`);
  }

  return response.json();
}
