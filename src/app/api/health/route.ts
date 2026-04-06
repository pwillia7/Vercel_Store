import { getHealth } from '@/lib/api/client'

/**
 * GET /api/health
 *
 * Proxies the upstream API health check and returns a combined status.
 * Returns 200 when the API and Redis are healthy, 503 when degraded.
 *
 * Use cases:
 * - Vercel deployment health checks (post-deploy traffic gate)
 * - External monitoring / uptime tools
 * - Load balancer readiness probes
 */
export async function GET() {
  try {
    const health = await getHealth()
    const isHealthy =
      health.status === 'ok' &&
      health.services?.redis === 'ok'

    return Response.json(
      {
        status: isHealthy ? 'ok' : 'degraded',
        api: health,
        timestamp: new Date().toISOString(),
      },
      { status: isHealthy ? 200 : 503 },
    )
  } catch {
    return Response.json(
      {
        status: 'error',
        error: 'Upstream API health check failed — service may be unreachable.',
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    )
  }
}
