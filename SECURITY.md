# Security policy

## Supported versions

Security fixes are applied to the latest release on the `main` branch.

## Reporting a vulnerability

Please do not open a public issue for a vulnerability that could expose
credentials, private data, or another person's account.

Contact the maintainer privately through the contact method listed on the
maintainer's GitHub profile. Include:

- the affected file or feature;
- steps to reproduce the issue;
- the possible impact;
- a suggested fix, if you have one.

Please allow a reasonable period for investigation before public disclosure.

## Credential safety

The Reddit integration reads credentials from environment variables. Never
commit credentials, tokens, exported private messages, or `.env` files.
