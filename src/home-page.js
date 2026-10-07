const loadProjectEnhancements = () => {
  void import('./projects.js')
}

const scheduleProjectEnhancements = () => {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(loadProjectEnhancements, { timeout: 6000 })
  } else {
    window.setTimeout(loadProjectEnhancements, 6000)
  }
}

if (document.readyState === 'complete') scheduleProjectEnhancements()
else window.addEventListener('load', scheduleProjectEnhancements, { once: true })
