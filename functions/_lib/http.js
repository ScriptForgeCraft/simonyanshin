const JSON_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store',
  'referrer-policy': 'no-referrer',
  'x-content-type-options': 'nosniff',
}

const errors = Object.freeze({
  METHOD_NOT_ALLOWED: { status: 405, retryable: false },
  INVALID_CONTENT_TYPE: { status: 415, retryable: false },
  INVALID_JSON: { status: 400, retryable: false },
  PAYLOAD_TOO_LARGE: { status: 413, retryable: false },
  INVALID_INPUT: { status: 422, retryable: false },
  BOT_VERIFICATION_REQUIRED: { status: 422, retryable: false },
  BOT_VERIFICATION_FAILED: { status: 403, retryable: true },
  BOT_VERIFICATION_UNAVAILABLE: { status: 503, retryable: true },
  TURNSTILE_NOT_CONFIGURED: { status: 503, retryable: false },
  LEAD_DELIVERY_NOT_CONFIGURED: { status: 503, retryable: false },
  LEAD_DELIVERY_TIMEOUT: { status: 504, retryable: true },
  LEAD_DELIVERY_UNAVAILABLE: { status: 503, retryable: true },
  LEAD_DELIVERY_REJECTED: { status: 502, retryable: false },
  INTERNAL: { status: 500, retryable: true },
})

export class ApiError extends Error {
  constructor(code) {
    super(code)
    this.name = 'ApiError'
    this.code = errors[code] ? code : 'INTERNAL'
    this.status = errors[this.code].status
    this.retryable = errors[this.code].retryable
  }
}

export const isApiError = (error) => error instanceof ApiError

const json = (body, status = 200, headers = {}) => new Response(JSON.stringify(body), {
  status,
  headers: new Headers({ ...JSON_HEADERS, ...headers }),
})

const failure = (error, headers) => {
  const normalized = isApiError(error) ? error : new ApiError('INTERNAL')
  return json({
    ok: false,
    error: { code: normalized.code, retryable: normalized.retryable },
  }, normalized.status, headers)
}

export const readJsonBody = async (request, { maxBytes = 16_384 } = {}) => {
  const contentLength = Number(request.headers.get('content-length'))
  if (Number.isFinite(contentLength) && contentLength > maxBytes) {
    throw new ApiError('PAYLOAD_TOO_LARGE')
  }

  const contentType = request.headers.get('content-type') ?? ''
  if (!contentType.toLowerCase().includes('application/json')) {
    throw new ApiError('INVALID_CONTENT_TYPE')
  }

  let raw
  try {
    raw = await request.text()
  } catch {
    throw new ApiError('INVALID_JSON')
  }

  if (new TextEncoder().encode(raw).byteLength > maxBytes) {
    throw new ApiError('PAYLOAD_TOO_LARGE')
  }

  try {
    const body = JSON.parse(raw)
    if (!body || Array.isArray(body) || typeof body !== 'object') throw new Error('Invalid body')
    return body
  } catch {
    throw new ApiError('INVALID_JSON')
  }
}

export const handlePost = async (context, handler) => {
  const { request } = context

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: { allow: 'POST, OPTIONS', 'cache-control': 'no-store' },
    })
  }

  if (request.method !== 'POST') {
    return failure(new ApiError('METHOD_NOT_ALLOWED'), { allow: 'POST, OPTIONS' })
  }

  try {
    const data = await handler({
      request,
      env: context.env ?? {},
      fetchImpl: context.fetch ?? fetch,
    })
    return json({ ok: true, data })
  } catch (error) {
    return failure(error)
  }
}
