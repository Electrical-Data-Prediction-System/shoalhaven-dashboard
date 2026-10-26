import { NextRequest, NextResponse } from "next/server"

const API_INTERNAL_URL = process.env.API_INTERNAL_URL

// Only forward requests under these upstream path prefixes. Anything else is
// rejected so this route cannot be used as an open proxy.
const ALLOWED_PREFIXES = ["meters", "readings", "market"]

type RouteContext = { params: Promise<{ path: string[] }> }

function hasBody(method: string) {
  return method !== "GET" && method !== "HEAD"
}

function isAllowed(segment: string) {
  return ALLOWED_PREFIXES.some(
    (prefix) => segment === prefix || segment.startsWith(`${prefix}/`),
  )
}

function forwardHeaders(request: NextRequest) {
  const headers = new Headers()
  for (const name of ["content-type", "accept", "authorization"]) {
    const value = request.headers.get(name)
    if (value) headers.set(name, value)
  }
  return headers
}

async function proxy(request: NextRequest, { params }: RouteContext) {
  if (!API_INTERNAL_URL) {
    return NextResponse.json(
      { error: "API_INTERNAL_URL is not configured" },
      { status: 500 },
    )
  }

  const { path } = await params
  const segment = path.join("/")

  if (!isAllowed(segment)) {
    return NextResponse.json({ error: `Path not allowed: ${segment}` }, { status: 404 })
  }

  const search = new URL(request.url).search
  const target = `${API_INTERNAL_URL.replace(/\/$/, "")}/${segment}${search}`

  try {
    const upstream = await fetch(target, {
      method: request.method,
      headers: forwardHeaders(request),
      body: hasBody(request.method) ? await request.text() : undefined,
      cache: "no-store",
    })

    const body = await upstream.text()
    return new NextResponse(body, {
      status: upstream.status,
      headers: {
        "content-type": upstream.headers.get("content-type") ?? "application/json",
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to reach upstream API: ${error instanceof Error ? error.message : String(error)}` },
      { status: 502 },
    )
  }
}

export const GET = proxy
export const POST = proxy
export const PUT = proxy
export const PATCH = proxy
export const DELETE = proxy
