import { submitContact } from '../_lib/contact.js'
import { handlePost, readJsonBody } from '../_lib/http.js'

export const onRequest = (context) => handlePost(context, async ({ request, env, fetchImpl }) => {
  const body = await readJsonBody(request)
  return submitContact(body, env, {
    fetchImpl,
    signal: request.signal,
    remoteIp: request.headers.get('cf-connecting-ip') ?? undefined,
  })
})
