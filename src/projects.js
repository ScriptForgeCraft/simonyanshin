import './projects.css'
import { locale, text } from './main.js'
import {
  loadProjectDataPage,
  projectPages,
  serviceProjects,
} from './projects-data.generated.js'

const grid = document.querySelector('[data-project-grid]')
const pagination = document.querySelector('[data-project-pagination]')
const serviceGrid = document.querySelector('[data-service-grid]')
const modal = document.querySelector('[data-project-modal]')
const modalTitle = document.querySelector('[data-project-title]')
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
const featuredProjectLinks = [...document.querySelectorAll('[data-featured-project-link]')]
const additionalServiceProjectIds = [
  'projects-restoration-of-the-gavit-at-anapastanats-monastery-in-meghri-ongoing-work',
]

const portfolioRoot = 'portfolio'
const dataPageCache = new Map()
const prefetchCache = new Set()
const slowConnection = navigator.connection?.saveData
  || /(^|-)2g$/.test(navigator.connection?.effectiveType ?? '')
const urlState = new URL(window.location.href)
const initialPage = Number.parseInt(urlState.searchParams.get('page') ?? '1', 10)
let activePage = Number.isSafeInteger(initialPage) && initialPage > 0 ? initialPage : 1
let activeProject = null
let activeImageIndex = 0
let projectOpener = null
let lightboxOpener = null
let swipeStartX = null
let projectRenderVersion = 0

const localizedContent = (project) => project.content[locale] ?? project.content.hy

const encodePath = (path) => path
  .split('/')
  .map((part) => encodeURIComponent(part))
  .join('/')

const assetUrl = (project, imageName) => {
  const base = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`
  return `${base}${portfolioRoot}/${encodePath(project.sourcePath)}/${encodeURIComponent(imageName)}`
}

const thumbnailName = (image) => (typeof image === 'string' ? image : image.thumbnail)
const fullImageName = (image) => (typeof image === 'string' ? image : image.full)
const cardThumbnailName = (image) => thumbnailName(image).replace(/\.[^.]+$/, '.avif')

const firstBody = (project) => localizedContent(project).blocks.find((block) => block.body)?.body ?? ''

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

const getPageCount = () => projectPages.all?.length ?? 0

const getPageDefinition = (page) => projectPages.all?.[page - 1] ?? null

const loadDataPage = (page) => {
  if (!dataPageCache.has(page)) {
    dataPageCache.set(page, loadProjectDataPage(page).then((module) => module.projects))
  }
  return dataPageCache.get(page)
}

const loadProjectsForPage = async (page) => {
  const definition = getPageDefinition(page)
  if (!definition) return []

  const sourcePages = await Promise.all(definition.sourcePages.map(loadDataPage))
  const projectsById = new Map(sourcePages.flat().map((project) => [project.id, project]))
  return definition.ids.map((id) => projectsById.get(id)).filter(Boolean)
}

const formatPageText = (template, values) => Object.entries(values).reduce(
  (result, [key, value]) => result.replace(`{${key}}`, String(value)),
  template,
)

const syncPageUrl = () => {
  const url = new URL(window.location.href)
  if (activePage === 1) url.searchParams.delete('page')
  else url.searchParams.set('page', String(activePage))

  window.history.replaceState(null, '', url)
}

const prefetchProjectsForPage = async (page) => {
  const key = String(page)
  if (prefetchCache.has(key) || slowConnection || !getPageDefinition(page)) return

  prefetchCache.add(key)
  const nextProjects = await loadProjectsForPage(page)

  nextProjects.forEach((project) => {
    if (!project.images.length) return

    const href = assetUrl(project, cardThumbnailName(project.images[0]))
    const selector = `link[data-project-prefetch="${CSS.escape(href)}"]`
    if (document.head.querySelector(selector)) return

    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.as = 'image'
    link.href = href
    link.dataset.projectPrefetch = href
    document.head.append(link)
  })
}

const queueNextPagePrefetch = (renderVersion) => {
  const nextPage = activePage + 1
  if (slowConnection || !getPageDefinition(nextPage)) return

  const prefetch = () => {
    if (renderVersion !== projectRenderVersion || nextPage !== activePage + 1) return
    void prefetchProjectsForPage(nextPage)
  }

  const runWhenIdle = () => {
    if ('requestIdleCallback' in window) window.requestIdleCallback(prefetch, { timeout: 4000 })
    else window.setTimeout(prefetch, 1200)
  }

  if (document.readyState === 'complete') runWhenIdle()
  else window.addEventListener('load', runWhenIdle, { once: true })
}

const makePaginationButton = ({ label, page, isCurrent = false, disabled = false }) => {
  const button = document.createElement('button')
  button.type = 'button'
  button.className = 'works-pagination-button'
  button.textContent = label
  button.disabled = disabled

  if (isCurrent) {
    button.classList.add('is-current')
    button.setAttribute('aria-current', 'page')
  }

  if (page != null) {
    button.setAttribute('aria-label', `${label} — ${formatPageText(text.worksPaginationPage, { page })}`)
    button.addEventListener('mouseenter', () => void prefetchProjectsForPage(page), { once: true })
    button.addEventListener('focus', () => void prefetchProjectsForPage(page), { once: true })
    button.addEventListener('click', () => {
      if (page === activePage) return
      activePage = page
      syncPageUrl()
      void renderProjects({ scrollToGrid: true })
    })
  }

  return button
}

const renderPagination = () => {
  if (!pagination) return

  const totalPages = getPageCount()
  pagination.hidden = totalPages < 2
  pagination.setAttribute('aria-label', text.worksPaginationLabel)
  if (totalPages < 2) {
    pagination.replaceChildren()
    return
  }

  const fragment = document.createDocumentFragment()
  const previous = makePaginationButton({
    label: text.worksPaginationPrevious,
    page: activePage > 1 ? activePage - 1 : null,
    disabled: activePage === 1,
  })
  previous.classList.add('works-pagination-previous')
  fragment.append(previous)

  for (let page = 1; page <= totalPages; page += 1) {
    fragment.append(makePaginationButton({
      label: String(page),
      page,
      isCurrent: page === activePage,
    }))
  }

  const next = makePaginationButton({
    label: text.worksPaginationNext,
    page: activePage < totalPages ? activePage + 1 : null,
    disabled: activePage === totalPages,
  })
  next.classList.add('works-pagination-next')
  fragment.append(next)

  pagination.replaceChildren(fragment)
}

const createProjectCard = (project, index) => {
  const content = localizedContent(project)
  const article = document.createElement('article')
  article.className = 'work-card'
  article.dataset.group = project.group

  const button = document.createElement('button')
  button.type = 'button'
  button.className = 'work-card-button'
  button.dataset.projectId = project.id
  button.addEventListener('click', () => openProject(project, button))

  const media = document.createElement('span')
  media.className = `work-card-media${project.images.length ? '' : ' work-card-media-empty'}`

  if (project.images.length) {
    const image = document.createElement('img')
    image.src = assetUrl(project, cardThumbnailName(project.images[0]))
    image.dataset.fallbackSrc = assetUrl(project, thumbnailName(project.images[0]))
    image.alt = content.title
    image.loading = 'lazy'
    image.decoding = 'async'
    image.fetchPriority = 'low'
    image.addEventListener('error', () => {
      if (image.dataset.fallbackSrc) {
        image.src = image.dataset.fallbackSrc
        delete image.dataset.fallbackSrc
        return
      }
      image.remove()
      media.classList.add('work-card-media-empty')
    })
    media.append(image)
  }

  const mediaShade = document.createElement('span')
  mediaShade.className = 'work-card-shade'
  media.append(mediaShade)

  const mediaTop = document.createElement('span')
  mediaTop.className = 'work-card-media-top'

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

const renderProjects = async ({ scrollToGrid = false } = {}) => {
  if (!grid) return

  const totalPages = getPageCount()
  activePage = Math.min(Math.max(activePage, 1), Math.max(totalPages, 1))
  const renderVersion = ++projectRenderVersion
  const visibleProjects = await loadProjectsForPage(activePage)
  if (renderVersion !== projectRenderVersion) return

  const fragment = document.createDocumentFragment()
  visibleProjects.forEach((project, index) => fragment.append(createProjectCard(project, index)))
  grid.replaceChildren(fragment)
  grid.removeAttribute('aria-busy')
  renderPagination()
  queueNextPagePrefetch(renderVersion)

  if (scrollToGrid) {
    grid.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'start',
    })
  }
}

const loadAdditionalServiceProjects = async () => {
  const projects = await Promise.all(additionalServiceProjectIds.map(async (projectId) => {
    const page = projectPages.all.findIndex((definition) => definition.ids.includes(projectId)) + 1
    if (!page) return null

    const pageProjects = await loadProjectsForPage(page)
    return pageProjects.find((project) => project.id === projectId) ?? null
  }))

  return projects.filter(Boolean)
}

const renderServices = async () => {
  if (!serviceGrid) return

  const additionalProjects = await loadAdditionalServiceProjects()
  const projects = [...serviceProjects, ...additionalProjects]
  const fragment = document.createDocumentFragment()
  projects
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

  project.images.forEach((imageEntry, index) => {
    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'project-gallery-item'
    button.setAttribute('aria-label', `${text.worksOpenImage} ${index + 1}`)
    button.addEventListener('click', () => openLightbox(index, button))

    const image = document.createElement('img')
    image.src = assetUrl(project, thumbnailName(imageEntry))
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

  const url = new URL(window.location.href)
  if (new URLSearchParams(url.hash.slice(1)).has('project')) {
    url.hash = ''
    window.history.replaceState(null, '', url)
  }

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

const getProjectIdFromHash = () => new URLSearchParams(window.location.hash.slice(1)).get('project')

const openProjectById = async (projectId, opener = null) => {
  const serviceProject = serviceProjects.find((project) => project.id === projectId)
  if (serviceProject) {
    openProject(serviceProject, opener)
    return true
  }

  const page = projectPages.all.findIndex((definition) => definition.ids.includes(projectId)) + 1
  if (!page) return false

  activePage = page
  if (grid) await renderProjects()

  const project = (await loadProjectsForPage(page)).find((item) => item.id === projectId)
  if (!project) return false

  const projectOpener = opener ?? document.querySelector(`[data-project-id="${project.id}"]`)
  openProject(project, projectOpener)
  return true
}

const openProjectFromHash = async () => {
  const projectId = getProjectIdFromHash()
  if (!projectId) return false

  const opener = featuredProjectLinks.find((link) => link.dataset.featuredProjectLink === projectId)
  return openProjectById(projectId, opener)
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
    image.src = assetUrl(activeProject, thumbnailName(activeProject.images[index]))
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
  const imageName = fullImageName(activeProject.images[activeImageIndex])

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

featuredProjectLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    if (!modal) return

    const projectId = link.dataset.featuredProjectLink
    if (!projectId) return

    event.preventDefault()
    const url = new URL(window.location.href)
    url.hash = `project=${encodeURIComponent(projectId)}`
    window.history.pushState({ projectId }, '', url)
    void openProjectById(projectId, link)
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

const syncProjectFromNavigation = () => {
  const projectId = getProjectIdFromHash()
  if (projectId) {
    void openProjectFromHash()
  } else if (modal && !modal.hidden) {
    closeProject()
  }
}

window.addEventListener('hashchange', syncProjectFromNavigation)
window.addEventListener('popstate', syncProjectFromNavigation)

const renderInitialProjects = async () => {
  await renderServices()
  await renderProjects()
}

const initializeProjects = async () => {
  if (getProjectIdFromHash()) {
    await renderServices()
    await openProjectFromHash()
    return
  }

  await renderInitialProjects()
}

void initializeProjects()
