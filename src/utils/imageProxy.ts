const IMAGE_PROXY_PATH = '/api/proxy/image'
const ALLOWED_PROXY_HOSTS = new Set([
  'ankhanhhouse.com',
  'www.ankhanhhouse.com',
])

function toRelativeProxyPath(url: string): string | null {
  const parsed = tryParseUrl(url)
  if (!parsed) return null

  if (parsed.pathname.toLowerCase().endsWith('/api/proxy/image')) {
    return `${IMAGE_PROXY_PATH}${parsed.search}`
  }

  return null
}

function getCurrentOrigin(): string | null {
  return typeof window !== 'undefined' ? window.location.origin : null
}

function tryParseUrl(url: string): URL | null {
  try {
    return new URL(url)
  } catch {
    return null
  }
}

function normalizeExternalImageUrl(url: string): string {
  const protocolRelativeMatch = url.match(/^\/\/(.+)$/)
  if (protocolRelativeMatch) {
    return `https://${protocolRelativeMatch[1]}`
  }

  const parsedUrl = tryParseUrl(url)
  if (!parsedUrl) return url

  const hostname = parsedUrl.hostname.toLowerCase()
  if (parsedUrl.protocol === 'http:' && ALLOWED_PROXY_HOSTS.has(hostname)) {
    parsedUrl.protocol = 'https:'
    return parsedUrl.toString()
  }

  return url
}

function shouldProxyUrl(parsedUrl: URL): boolean {
  if (parsedUrl.protocol !== 'https:') return false

  const currentOrigin = getCurrentOrigin()

  if (currentOrigin && parsedUrl.origin === currentOrigin) return false

  return ALLOWED_PROXY_HOSTS.has(parsedUrl.hostname.toLowerCase())
}

export function toProxiedImageUrl(url?: string | null): string {
  if (!url) return ''

  const trimmed = normalizeExternalImageUrl(url.trim())
  if (!trimmed) return ''

  const relativeProxyPath = toRelativeProxyPath(trimmed)
  if (relativeProxyPath) {
    return relativeProxyPath
  }

  if (
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('/') ||
    trimmed.startsWith(IMAGE_PROXY_PATH)
  ) {
    return trimmed
  }

  const parsedUrl = tryParseUrl(trimmed)
  if (!parsedUrl || !shouldProxyUrl(parsedUrl)) {
    return trimmed
  }

  return `${IMAGE_PROXY_PATH}?url=${encodeURIComponent(trimmed)}`
}

export function proxyImageSourcesInHtml(html?: string | null): string {
  if (!html) return ''

  if (typeof DOMParser === 'undefined') {
    return html.replace(/(<img[^>]+src=["'])([^"']+)(["'][^>]*>)/gi, (_, prefix, src, suffix) => {
      return `${prefix}${toProxiedImageUrl(src)}${suffix}`
    })
  }

  const parser = new DOMParser()
  const documentFragment = parser.parseFromString(html, 'text/html')

  documentFragment.querySelectorAll('img[src]').forEach((image) => {
    const src = image.getAttribute('src')
    if (!src) return
    image.setAttribute('src', toProxiedImageUrl(src))
  })

  return documentFragment.body.innerHTML
}