# Contributing

Thank you for helping make Albania Travel Radar more accurate, useful, and
responsible.

## Before you start

- Search existing issues before opening a new one.
- Keep changes focused. One problem per pull request is easier to review.
- Do not include real people's private information in examples or tests.
- Use synthetic data or properly anonymised public examples.
- Do not propose automated unsolicited messaging or private-data extraction.

## Local setup

```bash
git clone https://github.com/merogjergj-sys/albania-travel-radar.git
cd albania-travel-radar
npm install
npm test
```

Node.js 20 or newer is required.

## Making a change

1. Create a branch from `main`.
2. Add or update tests for behavior changes.
3. Run `npm run check` and `npm test`.
4. Update the README when behavior or setup changes.
5. Open a pull request that explains the problem, solution, and responsible-use impact.

## Scoring changes

Every new scoring term or weight change should include:

- a short explanation of the user need;
- at least one positive test case;
- at least one possible false-positive test case;
- a note about the language, region, or travel context it represents.

Avoid terms that infer sensitive traits or identity.

## Reporting harmful behavior

If a proposed feature could enable spam, surveillance, or privacy harm, raise it
in the pull request. Security concerns should follow [SECURITY.md](SECURITY.md).
