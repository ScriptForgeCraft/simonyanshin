import './projects.css'
import { locale, text } from './main.js'
import { projects } from './projects-data.generated.js'

const grid = document.querySelector('[data-project-grid]')
const serviceGrid = document.querySelector('[data-service-grid]')
const filterButtons = [...document.querySelectorAll('[data-work-filter]')]
const modal = document.querySelector('[data-project-modal]')
const modalTitle = document.querySelector('[data-project-title]')
const modalKicker = document.querySelector('[data-project-kicker]')
const modalCopy = document.querySelector('[data-project-copy]')
const modalMeta = document.querySelector('[data-project-meta]')
const modalGallery = document.querySelector('[data-project-gallery]')
const modalPanel = document.querySelector('.project-modal-panel')
const modalScroll = document.querySelector('.project-modal-scroll')
const modalCloseButton = document.querySelector('.project-modal-close')
const lightbox = document.querySelector('[data-lightbox]')
const lightboxImage = document.querySelector('[data-lightbox-image]')
const lightboxTitle = document.querySelector('[data-lightbox-title]')
const lightboxCounter = document.querySelector('[data-lightbox-counter]')
const lightboxStage = document.querySelector('[data-lightbox-stage]')
const lightboxThumbs = document.querySelector('[data-lightbox-thumbs]')
const lightboxCloseButton = document.querySelector('.lightbox-close')
const previousButton = document.querySelector('[data-lightbox-prev]')
const nextButton = document.querySelector('[data-lightbox-next]')

const portfolioRoot = 'portfolio'
let activeFilter = 'all'
let activeProject = null
let activeImageIndex = 0
let projectOpener = null
let lightboxOpener = null
let swipeStartX = null

const localizedContent = (project) => project.content[locale] ?? project.content.hy

const encodePath = (path) => path
  .split('/')
  .map((part) => encodeURIComponent(part))
  .join('/')

const assetUrl = (project, imageName) => {
  const base = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`
  return `${base}${portfolioRoot}/${encodePath(project.sourcePath)}/${encodeURIComponent(imageName)}`
}

const firstBody = (project) => localizedContent(project).blocks.find((block) => block.body)?.body ?? ''

const groupLabel = (project) => {
  if (project.kind === 'machinery') return text.worksMachineryLabel
  if (project.kind === 'service') return text.worksServiceLabel
  return text.worksProjectLabel
}

const photoLabel = (count) => {
  const category = new Intl.PluralRules(locale).select(count)
  const template = text[`worksPhotoCount${category[0].toUpperCase()}${category.slice(1)}`]
    ?? text.worksPhotoCountOther
    ?? `${count} ${text.worksPhotoLabel}`
  return template.replace('{count}', String(count))
}

const actionLabel = (project) => (
  project.kind === 'service' ? text.worksOpenService : text.worksOpenProject
)

const createIcon = (id) => {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('aria-hidden', 'true')
  const use = document.createElementNS('http://www.w3.org/2000/svg', 'use')
  use.setAttribute('href', `#${id}`)
  svg.append(use)
  return svg
}

const renderCounts = () => {
  const counts = {
    all: projects.filter((project) => project.kind !== 'service').length,
    projects: projects.filter((project) => project.kind === 'project').length,
    machinery: projects.filter((project) => project.kind === 'machinery').length,
  }

  Object.entries(counts).forEach(([key, value]) => {
    const target = document.querySelector(`[data-filter-count="${key}"]`)
    if (target) target.textContent = String(value)
  })
}

const createProjectCard = (project, index) => {
  const content = localizedContent(project)
  const article = document.createElement('article')
  article.className = 'work-card'
  article.dataset.group = project.group

  const button = document.createElement('button')
  button.type = 'button'
  button.className = 'work-card-button'
  button.setAttribute('aria-label', `${actionLabel(project)}: ${content.title}`)
  button.addEventListener('click', () => openProject(project, button))

  const media = document.createElement('span')
  media.className = `work-card-media${project.images.length ? '' : ' work-card-media-empty'}`

  if (project.images.length) {
    const image = document.createElement('img')
    image.src = assetUrl(project, project.images[0])
    image.alt = content.title
    image.loading = index < 6 ? 'eager' : 'lazy'
    image.decoding = 'async'
    if (index < 3) image.fetchPriority = 'high'
    image.addEventListener('error', () => {
      image.remove()
      media.classList.add('work-card-media-empty')
    }, { once: true })
    media.append(image)
  }

  const mediaShade = document.createElement('span')
  mediaShade.className = 'work-card-shade'
  media.append(mediaShade)

  const mediaTop = document.createElement('span')
  mediaTop.className = 'work-card-media-top'

  const type = document.createElement('span')
  type.className = 'work-card-type'
  type.textContent = groupLabel(project)
  mediaTop.append(type)

  if (project.images.length) {
    const count = document.createElement('span')
    count.className = 'work-card-photo-count'
    count.textContent = photoLabel(project.images.length)
    mediaTop.append(count)
  }

  media.append(mediaTop)

  const expand = document.createElement('span')
  expand.className = 'work-card-expand'
  expand.append(createIcon('icon-expand'))
  media.append(expand)

  const body = document.createElement('span')
  body.className = 'work-card-body'

  const title = document.createElement('strong')
  title.className = 'work-card-title'
  title.textContent = content.title

  const action = document.createElement('span')
  action.className = 'work-card-action'
  action.textContent = actionLabel(project)
  action.append(createIcon('icon-arrow'))

  body.append(title)
  const summaryText = firstBody(project)
  if (summaryText) {
    const summary = document.createElement('span')
    summary.className = 'work-card-summary'
    summary.textContent = summaryText
    body.append(summary)
  }
  body.append(action)
  button.append(media, body)
  article.append(button)
  return article
}

const renderProjects = () => {
  if (!grid) return

  const visibleProjects = activeFilter === 'all'
    ? projects.filter((project) => project.kind !== 'service')
    : projects.filter((project) => (
      activeFilter === 'projects'
        ? project.kind === 'project'
        : project.kind === 'machinery'
    ))

  const fragment = document.createDocumentFragment()
  visibleProjects.forEach((project, index) => fragment.append(createProjectCard(project, index)))
  grid.replaceChildren(fragment)
}

const renderServices = () => {
  if (!serviceGrid) return

  const fragment = document.createDocumentFragment()
  projects
    .filter((project) => project.kind === 'service')
    .forEach((project, index) => fragment.append(createProjectCard(project, index)))
  serviceGrid.replaceChildren(fragment)
}

const renderProjectCopy = (project) => {
  const content = localizedContent(project)
  const fragment = document.createDocumentFragment()

  content.blocks.forEach((block) => {
    const section = document.createElement(block.title ? 'section' : 'div')
    section.className = block.title ? 'project-copy-section' : 'project-copy-paragraph'

    if (block.title) {
      const heading = document.createElement('h3')
      heading.textContent = block.title
      section.append(heading)
    }

    if (block.body) {
      const paragraph = document.createElement('p')
      paragraph.textContent = block.body
      section.append(paragraph)
    }

    fragment.append(section)
  })

  modalCopy.hidden = !fragment.childNodes.length
  modalCopy.replaceChildren(fragment)
}

const renderProjectGallery = (project) => {
  const fragment = document.createDocumentFragment()
  modalGallery.setAttribute('aria-label', text.worksGallery)

  if (!project.images.length) {
    const empty = document.createElement('div')
    empty.className = 'project-gallery-empty'
    empty.textContent = text.worksNoPhotos
    fragment.append(empty)
    modalGallery.replaceChildren(fragment)
    return
  }

  project.images.forEach((imageName, index) => {
    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'project-gallery-item'
    button.setAttribute('aria-label', `${text.worksOpenImage} ${index + 1}`)
    button.addEventListener('click', () => openLightbox(index, button))

    const image = document.createElement('img')
    image.src = assetUrl(project, imageName)
    image.alt = `${localizedContent(project).title} — ${index + 1}`
    image.loading = index < 4 ? 'eager' : 'lazy'
    image.decoding = 'async'

    const overlay = document.createElement('span')
    overlay.className = 'project-gallery-overlay'
    overlay.append(createIcon('icon-expand'))

    button.append(image, overlay)
    fragment.append(button)
  })

  modalGallery.replaceChildren(fragment)
}

const syncBodyLock = () => {
  const shouldLock = (modal && !modal.hidden) || (lightbox && !lightbox.hidden)
  document.body.classList.toggle('is-overlay-open', shouldLock)
}

const openProject = (project, opener) => {
  activeProject = project
  projectOpener = opener
  const content = localizedContent(project)

  modalKicker.textContent = groupLabel(project)
  modalTitle.textContent = content.title
  modalMeta.textContent = project.images.length ? photoLabel(project.images.length) : text.worksNoPhotos
  renderProjectCopy(project)
  renderProjectGallery(project)

  modal.hidden = false
  if (modalScroll) modalScroll.scrollTop = 0
  syncBodyLock()
  requestAnimationFrame(() => modal.classList.add('is-open'))
  modalCloseButton.focus({ preventScroll: true })
}

const closeProject = () => {
  if (!modal || modal.hidden) return
  if (lightbox && !lightbox.hidden) closeLightbox()

  modal.classList.remove('is-open')
  const finish = () => {
    modal.hidden = true
    modal.removeEventListener('transitionend', finish)
    activeProject = null
    syncBodyLock()
    projectOpener?.focus({ preventScroll: true })
  }

  modal.addEventListener('transitionend', finish, { once: true })
  window.setTimeout(() => {
    if (!modal.hidden) finish()
  }, 260)
}

const renderLightboxThumbs = () => {
  if (!activeProject || !lightboxThumbs) return

  const start = Math.max(0, Math.min(activeImageIndex - 2, activeProject.images.length - 5))
  const end = Math.min(activeProject.images.length, start + 5)
  const fragment = document.createDocumentFragment()

  for (let index = start; index < end; index += 1) {
    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'lightbox-thumb'
    button.classList.toggle('is-active', index === activeImageIndex)
    button.setAttribute('aria-label', `${text.worksOpenImage} ${index + 1}`)
    button.addEventListener('click', () => showLightboxImage(index))

    const image = document.createElement('img')
    image.src = assetUrl(activeProject, activeProject.images[index])
    image.alt = ''
    image.loading = 'lazy'
    image.decoding = 'async'

    button.append(image)
    fragment.append(button)
  }

  lightboxThumbs.replaceChildren(fragment)
}

const showLightboxImage = (index) => {
  if (!activeProject?.images.length) return

  activeImageIndex = (index + activeProject.images.length) % activeProject.images.length
  const content = localizedContent(activeProject)
  const imageName = activeProject.images[activeImageIndex]

  lightboxImage.classList.add('is-changing')
  lightboxImage.src = assetUrl(activeProject, imageName)
  lightboxImage.alt = `${content.title} — ${activeImageIndex + 1}`
  lightboxTitle.textContent = content.title
  lightboxCounter.textContent = `${activeImageIndex + 1} / ${activeProject.images.length}`
  previousButton.hidden = activeProject.images.length < 2
  nextButton.hidden = activeProject.images.length < 2
  renderLightboxThumbs()

  const reveal = () => lightboxImage.classList.remove('is-changing')
  if (lightboxImage.complete) requestAnimationFrame(reveal)
  else lightboxImage.addEventListener('load', reveal, { once: true })
}

const openLightbox = (index, opener) => {
  if (!activeProject?.images.length) return
  lightboxOpener = opener
  showLightboxImage(index)
  lightbox.hidden = false
  syncBodyLock()
  requestAnimationFrame(() => lightbox.classList.add('is-open'))
  lightboxCloseButton.focus({ preventScroll: true })
}

const closeLightbox = () => {
  if (!lightbox || lightbox.hidden) return
  lightbox.classList.remove('is-open')

  const finish = () => {
    lightbox.hidden = true
    lightbox.removeEventListener('transitionend', finish)
    syncBodyLock()
    lightboxOpener?.focus({ preventScroll: true })
  }

  lightbox.addEventListener('transitionend', finish, { once: true })
  window.setTimeout(() => {
    if (!lightbox.hidden) finish()
  }, 220)
}

const nextImage = () => showLightboxImage(activeImageIndex + 1)
const previousImage = () => showLightboxImage(activeImageIndex - 1)

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    activeFilter = button.dataset.workFilter
    filterButtons.forEach((item) => {
      const isActive = item === button
      item.classList.toggle('is-active', isActive)
      item.setAttribute('aria-pressed', String(isActive))
    })
    renderProjects()
  })
})

document.querySelectorAll('[data-project-close]').forEach((button) => button.addEventListener('click', closeProject))
document.querySelectorAll('[data-lightbox-close]').forEach((button) => button.addEventListener('click', closeLightbox))
previousButton?.addEventListener('click', previousImage)
nextButton?.addEventListener('click', nextImage)

lightboxStage?.addEventListener('pointerdown', (event) => {
  if (event.pointerType === 'mouse') return
  swipeStartX = event.clientX
})

lightboxStage?.addEventListener('pointerup', (event) => {
  if (swipeStartX == null || event.pointerType === 'mouse') return
  const delta = event.clientX - swipeStartX
  swipeStartX = null
  if (Math.abs(delta) < 45) return
  if (delta < 0) nextImage()
  else previousImage()
})

document.addEventListener('keydown', (event) => {
  if (lightbox && !lightbox.hidden) {
    if (event.key === 'Escape') closeLightbox()
    if (event.key === 'ArrowRight') nextImage()
    if (event.key === 'ArrowLeft') previousImage()
    return
  }

  if (modal && !modal.hidden && event.key === 'Escape') closeProject()
})

renderCounts()
renderProjects()
renderServices()
