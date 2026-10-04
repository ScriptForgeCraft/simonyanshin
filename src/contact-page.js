import './content-pages.css'
import { locale, text } from './main.js'

const form = document.querySelector('[data-contact-form]')
const status = document.querySelector('[data-contact-form-status]')
const submitButton = document.querySelector('[data-contact-form-submit]')
const submitLabel = document.querySelector('[data-contact-form-submit-label]')
const turnstileContainer = document.querySelector('[data-contact-turnstile]')
const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY?.trim()

let turnstileWidgetId = null
let turnstileToken = ''

const showStatus = (message, state = '') => {
  if (!status) return
  status.textContent = message
  status.dataset.state = state
}

const loadTurnstile = () => new Promise((resolve, reject) => {
  if (window.turnstile) {
    resolve(window.turnstile)
    return
  }

  const existing = document.querySelector('script[data-contact-turnstile-script]')
  if (existing) {
    existing.addEventListener('load', () => resolve(window.turnstile), { once: true })
    existing.addEventListener('error', reject, { once: true })
    return
  }

  const script = document.createElement('script')
  script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
  script.async = true
  script.defer = true
  script.dataset.contactTurnstileScript = ''
  script.addEventListener('load', () => resolve(window.turnstile), { once: true })
  script.addEventListener('error', reject, { once: true })
  document.head.append(script)
})

const initialiseTurnstile = async () => {
  if (!turnstileSiteKey || !turnstileContainer) return

  turnstileContainer.hidden = false
  try {
    const turnstile = await loadTurnstile()
    turnstileWidgetId = turnstile.render(turnstileContainer, {
      sitekey: turnstileSiteKey,
      callback: (token) => { turnstileToken = token },
      'expired-callback': () => { turnstileToken = '' },
      'error-callback': () => { turnstileToken = '' },
    })
  } catch {
    showStatus(text.contactFormVerificationUnavailable, 'error')
  }
}

const resetTurnstile = () => {
  if (turnstileWidgetId !== null && window.turnstile) window.turnstile.reset(turnstileWidgetId)
  turnstileToken = ''
}

const responseMessage = (code) => {
  if (code === 'BOT_VERIFICATION_REQUIRED') return text.contactFormVerificationRequired
  if (code === 'BOT_VERIFICATION_FAILED' || code === 'BOT_VERIFICATION_UNAVAILABLE') {
    return text.contactFormVerificationUnavailable
  }
  if (code === 'INVALID_INPUT') return text.contactFormInvalid
  return text.contactFormError
}

if (form && status && submitButton && submitLabel) {
  initialiseTurnstile()

  form.addEventListener('submit', async (event) => {
    event.preventDefault()
    if (!form.reportValidity()) return

    if (turnstileSiteKey && !turnstileToken) {
      showStatus(text.contactFormVerificationRequired, 'error')
      return
    }

    const values = new FormData(form)
    const payload = Object.fromEntries(values.entries())
    payload.locale = locale
    if (turnstileToken) payload.turnstileToken = turnstileToken

    submitButton.disabled = true
    form.setAttribute('aria-busy', 'true')
    submitLabel.textContent = text.contactFormSubmitting
    showStatus('')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const result = await response.json().catch(() => null)
      if (!response.ok || result?.ok !== true) throw new Error(result?.error?.code ?? 'REQUEST_FAILED')

      form.reset()
      resetTurnstile()
      showStatus(text.contactFormSuccess, 'success')
    } catch (error) {
      showStatus(responseMessage(error.message), 'error')
    } finally {
      submitButton.disabled = false
      form.removeAttribute('aria-busy')
      submitLabel.textContent = text.contactFormSubmit
    }
  })
}
