function fromRedditChild(child) {
  const item = child?.data ?? child;
  return {
    id: item.id,
    title: item.title ?? "",
    body: item.selftext ?? item.body ?? "",
    author: item.author ?? "",
    community: item.subreddit ?? "",
    url: item.permalink
      ? `https://www.reddit.com${item.permalink}`
      : item.url ?? "",
    createdAt: item.created_utc
      ? new Date(item.created_utc * 1000).toISOString()
      : item.createdAt ?? null
  };
}

export function parsePosts(input) {
  if (Array.isArray(input)) {
    return input.map(fromRedditChild);
  }

  if (Array.isArray(input?.data?.children)) {
    return input.data.children.map(fromRedditChild);
  }

  if (Array.isArray(input?.posts)) {
    return input.posts.map(fromRedditChild);
  }

  throw new TypeError(
    "Unsupported input. Use a JSON array, { posts: [] }, or a Reddit listing response."
  );
}

function csvCell(value) {
  const text = Array.isArray(value) ? value.join("; ") : String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

export function toCsv(posts) {
  const headers = [
    "score",
    "tier",
    "title",
    "community",
    "author",
    "createdAt",
    "url",
    "reasons"
  ];

  const rows = posts.map((post) =>
    [
      post.score,
      post.tier,
      post.title,
      post.community,
      post.author,
      post.createdAt,
      post.url,
      post.reasons
    ]
      .map(csvCell)
      .join(",")
  );

  return [headers.join(","), ...rows].join("\n");
}
