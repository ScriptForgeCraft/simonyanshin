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
