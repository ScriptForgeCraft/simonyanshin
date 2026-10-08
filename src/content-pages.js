import './content-pages.css'
import './main.js'

const revealItems = document.querySelectorAll('[data-reveal]')
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

if (revealItems.length && !reduceMotion && 'IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return
      entry.target.classList.remove('is-pending')
      entry.target.classList.add('is-revealed')
      observer.unobserve(entry.target)
    })
  }, { threshold: .12 })

  revealItems.forEach((item) => {
    const delay = Number(item.dataset.revealDelay || 0)
    item.style.setProperty('--reveal-delay', `${delay}ms`)
    item.classList.add('is-pending')
    revealObserver.observe(item)
  })
}

const partnerMarquees = [...document.querySelectorAll('[data-partners-marquee]')]

partnerMarquees.forEach((marquee) => {
  const track = marquee.querySelector('[data-partners-track]')
  const sourceSet = marquee.querySelector('[data-partners-set]')
  if (!track || !sourceSet || track.querySelector('[aria-hidden="true"]')) return

  const duplicateSet = sourceSet.cloneNode(true)
  duplicateSet.removeAttribute('data-partners-set')
  duplicateSet.setAttribute('aria-hidden', 'true')
  track.append(duplicateSet)
  marquee.classList.add('is-marquee-ready')
})

if (partnerMarquees.length && !reduceMotion) {
  const syncPartnerMarqueePlayback = () => {
    const pageIsVisible = document.visibilityState === 'visible'
    partnerMarquees.forEach((marquee) => {
      marquee.classList.toggle('is-marquee-running', pageIsVisible && marquee.classList.contains('is-marquee-visible'))
    })
  }

  if ('IntersectionObserver' in window) {
    const marqueeObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle('is-marquee-visible', entry.isIntersecting)
      })
      syncPartnerMarqueePlayback()
    }, { threshold: .12 })

    partnerMarquees.forEach((marquee) => marqueeObserver.observe(marquee))
  } else {
    partnerMarquees.forEach((marquee) => marquee.classList.add('is-marquee-visible'))
    syncPartnerMarqueePlayback()
  }

  document.addEventListener('visibilitychange', syncPartnerMarqueePlayback)
}

document.querySelectorAll('[data-partners-scroller]').forEach((scroller) => {
  scroller.addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return
    event.preventDefault()
    const direction = event.key === 'ArrowRight' ? 1 : -1
    scroller.scrollBy({
      left: direction * Math.min(scroller.clientWidth * .8, 300),
      behavior: reduceMotion ? 'auto' : 'smooth',
    })
  })
})
