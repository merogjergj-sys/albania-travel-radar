# Albania Travel Radar

[![Test](https://github.com/merogjergj-sys/albania-travel-radar/actions/workflows/test.yml/badge.svg)](https://github.com/merogjergj-sys/albania-travel-radar/actions/workflows/test.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-red.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-20%2B-43853d.svg)](https://nodejs.org/)

Albania Travel Radar is a privacy-friendly, open-source tool that ranks public
travel conversations by their likelihood of representing a genuine, near-term
trip to Albania.

It helps local guides, community organisers, small tourism operators, and
destination teams notice public questions where useful local knowledge can make
a difference. The scoring is deterministic and explainable. There is no black
box, private-data collection, or automated messaging.

> **Project status:** early public release. The scoring model is ready for
> testing and community feedback, not unattended commercial use.

## What it does

- Accepts a JSON array, a `{ "posts": [] }` object, or a Reddit listing response.
- Scores destination mentions, planning language, timing, freshness, and questions.
- Down-ranks research, politics, old trip reports, and other lower-intent signals.
- Explains every score instead of returning an unexplained number.
- Exports ranked results as a readable table, JSON, or CSV.
- Runs as a command-line tool or a local browser demo.
- Can query Reddit through the official Reddit OAuth API using your own credentials.

## Quick start

You need [Node.js 20 or newer](https://nodejs.org/).

```bash
git clone https://github.com/merogjergj-sys/albania-travel-radar.git
cd albania-travel-radar
npm install
npm run scan
```

The sample command prints ranked results from
[`examples/sample-posts.json`](examples/sample-posts.json).

### Browser demo

```bash
npm start
```

Open `http://127.0.0.1:4173`, load the sample, and scan it. Data pasted into the
browser interface stays in the browser.

## Command-line use

Scan an export:

```bash
node src/cli.js scan my-public-posts.json --threshold 35
```

Export the ranked results:

```bash
node src/cli.js scan my-public-posts.json \
  --threshold 45 \
  --format csv \
  --output albania-signals.csv
```

Available output formats are `table`, `json`, and `csv`.

## Optional Reddit integration

The live fetch command uses Reddit's official OAuth API. Create a Reddit
"script" application, then set these variables in your own terminal:

```bash
export REDDIT_CLIENT_ID="your-client-id"
export REDDIT_CLIENT_SECRET="your-client-secret"
export REDDIT_USER_AGENT="albania-travel-radar/0.1 by your-reddit-name"
```

Do not commit these values. The `.gitignore` excludes `.env`, but environment
variables are still the recommended setup.

Run a search:

```bash
node src/cli.js fetch \
  --query 'Albania (travel OR visit OR itinerary OR "tour guide")' \
  --limit 50 \
  --threshold 35
```

Respect Reddit's API rules, community rules, rate limits, and the context in
which people post.

## How the score works

The current model combines five transparent categories:

| Category | Maximum contribution | Example |
|---|---:|---|
| Albania destination | 28 | Tirana, Berat, Theth, Ksamil |
| Travel-planning intent | 40 | "planning a trip", "local guide", "itinerary" |
| Timing | 15 | "tomorrow", "next week", "September" |
| Direct question | 7 | A question a knowledgeable local can answer |
| Freshness | 10 | Newer public posts score higher |

Lower-intent phrases can subtract up to 35 points. Scores are capped between
zero and 100.

The defaults are deliberately conservative. Tourism language changes across
countries and communities, so local contributors should improve the term lists
and test cases before using the project for another destination.

## Responsible-use principles

This project is built to support useful participation in public communities.

1. Help first. Answer the question before mentioning any service.
2. Do not automate unsolicited direct messages.
3. Do not collect private or sensitive personal data.
4. Do not use the score to make high-stakes decisions about people.
5. Follow platform terms and each community's rules.
6. Treat the score as a filter for human review, not proof of intent.

Features that require private-data extraction, deceptive identities, or
automated spam are out of scope.

## Project structure

```text
src/
  cli.js          Command-line interface
  config.js       Explainable scoring terms and weights
  parsers.js      Input normalization and CSV output
  reddit.js       Optional official Reddit OAuth integration
  scoring.js      Pure scoring and ranking functions
  server.js       Dependency-free local demo server
web/
  index.html      Browser interface
  app.js          Demo interactions and rendering
  styles.css      Responsive visual design
test/             Node test suite
examples/         Synthetic sample data
```

## Development

```bash
npm install
npm run check
npm test
```

The project has no runtime dependencies. Tests use Node's built-in test runner,
and GitHub Actions runs syntax checks and the full suite on every pull request.

Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request. Good
first contributions include:

- adding regional destination names with tests;
- testing travel-intent language from other English-speaking communities;
- improving accessibility in the browser demo;
- adding adapters for user-owned, platform-compliant exports;
- translating documentation into Albanian.

## Why this exists

Small tourism operators rarely have enterprise social-listening budgets.
Meanwhile, travellers ask public, answerable questions every day and often
receive generic advice.

This project began in Tirana as a practical experiment: can simple,
explainable open-source software help local experts find the right conversation
and contribute something genuinely useful? Albania is the first test case, but
the architecture is intentionally small enough for other communities to fork
and adapt.

## License

[MIT](LICENSE) © 2026 Gjergj Mero
