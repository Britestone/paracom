# britestone.github.io/paracom/
paracom.co.kr homepage

## Security Header Notes

This repository is hosted on GitHub Pages.

- GitHub Pages does not allow arbitrary custom response headers at origin.
- The `web.config` file applies only when this same static site is hosted on IIS.
- For production scans that require response headers (`Content-Security-Policy`, `Strict-Transport-Security`, `X-Content-Type-Options`), add an edge proxy/CDN in front of GitHub Pages.

Recommended edge response headers:

- `Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; frame-src 'self' https://www.google.com https://maps.google.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'; upgrade-insecure-requests`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
- `X-Content-Type-Options: nosniff`

Redirect policy at edge:

- Force HTTP to HTTPS with 301.
- Keep one canonical host (either `paracom.co.kr` or `www.paracom.co.kr`) and redirect the other host to canonical over HTTPS.
