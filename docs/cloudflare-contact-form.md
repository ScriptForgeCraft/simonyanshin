# Contact form: Cloudflare Pages setup

The browser submits the form to the same-origin `POST /api/contact` Pages Function.
It validates the request, optionally validates Cloudflare Turnstile, and then sends a
plain-text email through Cloudflare Email Sending. No credential is exposed to the
browser or committed to the repository.

## Required Pages secrets

Set these for the **Production** environment in the Cloudflare Pages project. Set
the same values for Preview too if the preview form should deliver real emails.

| Variable | Value |
| --- | --- |
| `CF_EMAIL_API_TOKEN` | Cloudflare API token that has permission to send email. Keep it secret. |
| `CF_ACCOUNT_ID` | Cloudflare account ID that owns the Pages project and Email Sending configuration. |
| `CONTACT_EMAIL` | `simonyanshinllc@gmail.com` — destination for form messages. |
| `EMAIL_FROM` | A sender address that is verified in Cloudflare Email Sending, for example `website@your-domain.am`. |

The API token must never start with `VITE_` and must not be placed in `.env`.

## Optional Turnstile protection

To enable bot verification, create a Turnstile widget for the production domain and
add the following variables:

| Variable | Where | Value |
| --- | --- | --- |
| `VITE_TURNSTILE_SITE_KEY` | Pages build variable | The public Turnstile site key. It is safe to expose in browser code. |
| `TURNSTILE_SECRET_KEY` | Pages Function secret | The matching private Turnstile secret key. |
| `LEAD_REQUIRE_TURNSTILE` | Pages Function variable | `true` after both keys are configured; otherwise leave it `false`. |

After changing `VITE_TURNSTILE_SITE_KEY`, redeploy the site: Vite embeds public
`VITE_*` values during the build. Function secrets are read at request time.

## Local Functions testing

Copy `functions/.dev.vars.example` to `functions/.dev.vars` and use only
non-production credentials. `vite dev` does not execute Pages Functions; use
Cloudflare Pages local development or a Pages preview deployment to exercise
`/api/contact` end to end.
