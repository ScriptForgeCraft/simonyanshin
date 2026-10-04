import { ApiError, isApiError } from './http.js'

const locales = new Set(['hy', 'ru', 'en'])
const phonePattern = /^[+()\d\s-]{6,32}$/
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const text = (value) => (typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : '')
const envText = (env, key) => text(env?.[key]) || null
const validPhone = (value) => phonePattern.test(value) && /\d/.test(value)
const validEmail = (value) => emailPattern.test(value)

export const validateContact = (body) => {
  const name = text(body?.name)
  const phone = text(body?.phone)
  const email = text(body?.email)
  const message = text(body?.message)
  const locale = text(body?.locale).toLowerCase().split('-')[0]
  const turnstileToken = text(body?.turnstileToken)

  if (
    name.length < 2 || name.length > 100 ||
    !validPhone(phone) ||
    (email && (!validEmail(email) || email.length > 254)) ||
    message.length < 5 || message.length > 2_000 ||
    !locales.has(locale) ||
    turnstileToken.length > 4_096 ||
    text(body?.company)
  ) {
    throw new ApiError('INVALID_INPUT')
  }

  return { name, phone, email, message, locale, turnstileToken }
}

const fetchWithTimeout = async (fetchImpl, url, options, { signal, timeoutMs = 8_000, timeoutCode, unavailableCode }) => {
  const controller = new AbortController()
  const onAbort = () => controller.abort(signal?.reason)
  if (signal) signal.addEventListener('abort', onAbort, { once: true })
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    return await fetchImpl(url, { ...options, signal: controller.signal })
  } catch (error) {
    if (signal?.aborted) throw new ApiError('LEAD_DELIVERY_UNAVAILABLE')
    if (controller.signal.aborted) throw new ApiError(timeoutCode)
    throw new ApiError(unavailableCode)
  } finally {
    clearTimeout(timeout)
    if (signal) signal.removeEventListener('abort', onAbort)
  }
}

const verifyTurnstile = async (lead, env, { fetchImpl, signal, remoteIp }) => {
  const secret = envText(env, 'TURNSTILE_SECRET_KEY')
  const required = envText(env, 'LEAD_REQUIRE_TURNSTILE')?.toLowerCase() === 'true'

  if (!secret) {
    if (required || lead.turnstileToken) throw new ApiError('TURNSTILE_NOT_CONFIGURED')
    return 'not-configured'
  }

  if (!lead.turnstileToken) throw new ApiError('BOT_VERIFICATION_REQUIRED')

  const payload = new URLSearchParams({ secret, response: lead.turnstileToken })
  if (remoteIp) payload.set('remoteip', remoteIp)

  const response = await fetchWithTimeout(
    fetchImpl,
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: payload },
    { signal, timeoutCode: 'BOT_VERIFICATION_UNAVAILABLE', unavailableCode: 'BOT_VERIFICATION_UNAVAILABLE' },
  )

  if (!response.ok) throw new ApiError('BOT_VERIFICATION_UNAVAILABLE')
  try {
    if ((await response.json())?.success !== true) throw new ApiError('BOT_VERIFICATION_FAILED')
  } catch (error) {
    if (isApiError(error)) throw error
    throw new ApiError('BOT_VERIFICATION_UNAVAILABLE')
  }
  return 'verified'
}

const formatEmail = (lead) => [
  'Նոր հաղորդագրություն՝ SimonyanShin կայքից',
  '',
  `Անուն: ${lead.name}`,
  `Հեռախոս: ${lead.phone}`,
  `Էլ. փոստ: ${lead.email || 'Չի նշվել'}`,
  `Լեզու: ${lead.locale.toUpperCase()}`,
  '',
  'Հաղորդագրություն:',
  lead.message,
].join('\n')

const sendEmail = async (lead, env, { fetchImpl, signal }) => {
  const apiToken = envText(env, 'CF_EMAIL_API_TOKEN')
  const accountId = envText(env, 'CF_ACCOUNT_ID')
  const recipient = envText(env, 'CONTACT_EMAIL')
  const from = envText(env, 'EMAIL_FROM')

  if (!apiToken || !accountId || !recipient || !validEmail(recipient) || !from || !validEmail(from)) {
    throw new ApiError('LEAD_DELIVERY_NOT_CONFIGURED')
  }

  const response = await fetchWithTimeout(
    fetchImpl,
    `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(accountId)}/email/sending/send`,
    {
      method: 'POST',
      headers: {
        accept: 'application/json',
        authorization: `Bearer ${apiToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        to: recipient,
        from,
        subject: 'Նոր հաղորդագրություն՝ SimonyanShin կայքից',
        text: formatEmail(lead),
        ...(lead.email ? { reply_to: lead.email } : {}),
      }),
    },
    { signal, timeoutCode: 'LEAD_DELIVERY_TIMEOUT', unavailableCode: 'LEAD_DELIVERY_UNAVAILABLE' },
  )

  if (!response.ok) {
    throw new ApiError(response.status === 429 || response.status >= 500 ? 'LEAD_DELIVERY_UNAVAILABLE' : 'LEAD_DELIVERY_REJECTED')
  }

  try {
    if ((await response.json())?.success !== true) throw new ApiError('LEAD_DELIVERY_REJECTED')
  } catch (error) {
    if (isApiError(error)) throw error
    throw new ApiError('LEAD_DELIVERY_REJECTED')
  }
}

export const submitContact = async (body, env, { fetchImpl = fetch, signal, remoteIp } = {}) => {
  const lead = validateContact(body)
  const turnstile = await verifyTurnstile(lead, env, { fetchImpl, signal, remoteIp })
  await sendEmail(lead, env, { fetchImpl, signal })
  return { accepted: true, turnstile }
}
