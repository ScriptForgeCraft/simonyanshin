const loadProjectEnhancements = () => {
  void import('./projects.js')
}

const warmupDelay = 8000
const warmupCardLimit = 6

const runWhenIdle = (callback) => {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(callback, { timeout: 2000 })
  } else {
    window.setTimeout(callback, 0)
  }
}

const scheduleProjectEnhancements = () => {
  runWhenIdle(loadProjectEnhancements)
}

const shouldWarmupProjectCards = () => {
  const connection = navigator.connection
  if (document.visibilityState !== 'visible' || connection?.saveData) return false

  // Do not spend a mobile visitor's data plan on a speculative download.
  return !/(^|-)2g$|3g/.test(connection?.effectiveType ?? '')
}

const hasStorageHeadroom = async () => {
  const estimate = await navigator.storage?.estimate?.()
  if (estimate?.quota == null || estimate.usage == null) return true

  return estimate.quota - estimate.usage > 15 * 1024 * 1024
}

const encodePath = (path) => path
  .split('/')
  .map((part) => encodeURIComponent(part))
  .join('/')

const thumbnailUrl = (project) => {
  const firstImage = project.images?.[0]
  const thumbnail = typeof firstImage === 'string' ? firstImage : firstImage?.thumbnail
  if (!thumbnail || !project.sourcePath) return null

  const avifThumbnail = thumbnail.replace(/\.[^.]+$/, '.avif')
  const base = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`
  return `${base}portfolio/${encodePath(project.sourcePath)}/${encodeURIComponent(avifThumbnail)}`
}

const prefetchImage = (href) => {
  const link = document.createElement('link')
  link.rel = 'prefetch'
  link.as = 'image'
  link.href = href
  link.setAttribute('fetchpriority', 'low')
  document.head.append(link)
}

const warmupProjectCards = async () => {
  if (!shouldWarmupProjectCards() || !await hasStorageHeadroom()) return

  try {
    // This dynamic import keeps portfolio data out of the Home critical path.
    const { loadProjectDataPage } = await import('./projects-data.generated.js')
    const { projects } = await loadProjectDataPage(1)
    const cards = projects
      .slice(0, warmupCardLimit)
      .map(thumbnailUrl)
      .filter(Boolean)

    cards.forEach(prefetchImage)
  } catch {
    // Prefetching is optional and must never affect the Home experience.
  }
}

const scheduleProjectWarmup = () => {
  window.setTimeout(() => {
    runWhenIdle(() => { void warmupProjectCards() })
  }, warmupDelay)
}

const initialiseHome = () => {
  scheduleProjectEnhancements()
  scheduleProjectWarmup()
}

if (document.readyState === 'complete') initialiseHome()
else window.addEventListener('load', initialiseHome, { once: true })
