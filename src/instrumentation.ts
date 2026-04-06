/**
 * Next.js instrumentation — runs once when the server process starts.
 *
 * Validates API connectivity at boot so degraded upstream state is
 * surfaced immediately in logs rather than discovered on the first
 * user request.
 *
 * Dynamic import keeps this out of the Edge runtime bundle; the health
 * check uses Node.js fetch and server-only imports.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { getHealth } = await import('@/lib/api/client')

    try {
      const health = await getHealth()
      const redisOk = health.services?.redis === 'ok'
      const apiOk = health.status === 'ok'

      if (apiOk && redisOk) {
        console.log(`[startup] API healthy — redis: ${health.services?.redis}`)
      } else {
        console.warn('[startup] API degraded at boot', {
          status: health.status,
          redis: health.services?.redis,
        })
      }
    } catch (err) {
      console.error('[startup] API health check failed — upstream may be unreachable', err)
    }
  }
}
