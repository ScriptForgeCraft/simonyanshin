import './style.css'
import { normalizeContactIcons } from './contact-icons.js'
import { locales, translations } from './i18n.js'
import { contactDetails } from './site-data.js'

const localeFromPath = window.location.pathname.match(/\/(ru|en)(?:\/|$)/)?.[1]
const locale = translations[localeFromPath]
  ? localeFromPath
  : (translations[document.documentElement.lang] ? document.documentElement.lang : 'hy')
const text = translations[locale]
const page = document.body.dataset.page || 'home'
normalizeContactIcons()
const toggle = document.querySelector('[data-menu-toggle]')
const menu = document.querySelector('[data-menu]')
const languageSelector = document.querySelector('[data-language-selector]')
const languageToggle = document.querySelector('[data-language-toggle]')
const languageMenu = document.querySelector('[data-language-menu]')
const createScrollTopButton = () => {
  const button = document.createElement('button')
  button.type = 'button'
  button.className = 'scroll-top'
  button.dataset.scrollTop = ''
  button.setAttribute('aria-label', 'Վերադառնալ վերև')
  button.setAttribute('data-i18n-aria-label', 'scrollToTop')
  button.innerHTML = '<svg aria-hidden="true"><use href="#icon-arrow" /></svg>'
  document.body.append(button)
  return button
}

const scrollTopButton = document.querySelector('[data-scroll-top]') ?? createScrollTopButton()

const base = import.meta.env.BASE_URL.replace(/\/$/, '')

const pageRoutes = {
  home: '/',
  projects: '/projects/',
  about: '/about/',
  equipment: '/equipment/',
  contact: '/contact/',
}

const buildLocalePath = (targetLocale, targetPage = page) => {
  const localePrefix = targetLocale === 'hy' ? '' : `/${targetLocale}`
  const pageSuffix = pageRoutes[targetPage] ?? pageRoutes.home
  return `${base}${localePrefix}${pageSuffix}`.replace(/\/+/g, '/')
}

const buildHomeAnchorPath = (anchor = '') => {
  const home = buildLocalePath(locale, 'home')
  return anchor ? `${home}#${anchor}` : home
}

if (page === 'home' && window.location.hash === '#contact') {
  window.location.replace(buildLocalePath(locale, 'contact'))
}

const setMenuToggleLabel = (isOpen) => {
  if (!toggle) return

  const icon = isOpen ? 'icon-close' : 'icon-menu'
  const label = isOpen ? text.menuClose : text.menuOpen

  toggle.innerHTML = `<svg aria-hidden="true"><use href="#${icon}" /></svg><span class="visually-hidden">${label}</span>`
}

const applyContactDetails = () => {
  document.querySelectorAll('[data-contact-phone]').forEach((element) => {
    element.href = contactDetails.phoneHref
  })
  document.querySelectorAll('[data-contact-phone-text]').forEach((element) => {
    element.textContent = contactDetails.phone
  })
  document.querySelectorAll('[data-contact-email]').forEach((element) => {
    element.href = contactDetails.emailHref
  })
  document.querySelectorAll('[data-contact-email-text]').forEach((element) => {
    element.textContent = contactDetails.email
  })
  document.querySelectorAll('[data-social-link]').forEach((element) => {
    const href = contactDetails.socialLinks[element.dataset.socialLink]
    if (!href) {
      element.remove()
      return
    }
    element.href = href
    element.target = '_blank'
    element.rel = 'noopener noreferrer'
  })
}

const applyTranslations = () => {
  document.documentElement.lang = locale
  const titleKey = document.body.dataset.titleKey || 'pageTitle'
  document.title = text[titleKey] ?? text.pageTitle

  document.querySelectorAll('[data-i18n]').forEach((element) => {
    const value = text[element.dataset.i18n]
    if (value != null) element.textContent = value
  })

  document.querySelectorAll('[data-i18n-html]').forEach((element) => {
    const value = text[element.dataset.i18nHtml]
    if (value != null) element.innerHTML = value
  })

  document.querySelectorAll('[data-i18n-alt]').forEach((element) => {
    const value = text[element.dataset.i18nAlt]
    if (value != null) element.alt = value
  })

  document.querySelectorAll('[data-i18n-aria-label]').forEach((element) => {
    const value = text[element.dataset.i18nAriaLabel]
    if (value != null) element.setAttribute('aria-label', value)
  })

  document.querySelectorAll('[data-i18n-content]').forEach((element) => {
    const value = text[element.dataset.i18nContent]
    if (value != null) element.setAttribute('content', value)
  })

  document.querySelectorAll('[data-i18n-placeholder]').forEach((element) => {
    const value = text[element.dataset.i18nPlaceholder]
    if (value != null) element.setAttribute('placeholder', value)
  })

  const currentLanguage = document.querySelector('[data-current-language]')
  if (currentLanguage) currentLanguage.textContent = locales[locale].code

  document.querySelectorAll('.brand, .site-footer-brand-link').forEach((link) => {
    link.removeAttribute('aria-label')
  })

  if (languageToggle) {
    languageToggle.setAttribute('aria-label', `${locales[locale].code} — ${text.languageMenu}`)
  }

  document.querySelectorAll('[data-locale-link]').forEach((link) => {
    const linkLocale = link.dataset.localeLink
    link.href = buildLocalePath(linkLocale)
    link.toggleAttribute('aria-current', linkLocale === locale)
  })

  document.querySelectorAll('[data-home-link]').forEach((link) => {
    link.href = buildHomeAnchorPath()
  })

  document.querySelectorAll('[data-home-anchor]').forEach((link) => {
    link.href = buildHomeAnchorPath(link.dataset.homeAnchor)
  })

  document.querySelectorAll('[data-projects-link]').forEach((link) => {
    link.href = buildLocalePath(locale, 'projects')
  })

  document.querySelectorAll('[data-featured-project-link]').forEach((link) => {
    const projectId = link.dataset.featuredProjectLink
    if (projectId) {
      link.href = page === 'home'
        ? buildHomeAnchorPath(`project=${encodeURIComponent(projectId)}`)
        : `${buildLocalePath(locale, 'projects')}#project=${encodeURIComponent(projectId)}`
    }
  })

  document.querySelectorAll('[data-about-link]').forEach((link) => {
    link.href = buildLocalePath(locale, 'about')
  })

  document.querySelectorAll('[data-equipment-link]').forEach((link) => {
    link.href = buildLocalePath(locale, 'equipment')
  })

  document.querySelectorAll('[data-contact-link], [data-contact-page-link]').forEach((link) => {
    link.href = buildLocalePath(locale, 'contact')
  })

  setMenuToggleLabel(false)
}

const closeMenu = () => {
  if (!menu || !toggle) return
  menu.classList.remove('is-open')
  toggle.setAttribute('aria-expanded', 'false')
  setMenuToggleLabel(false)
}

const closeLanguageMenu = () => {
  if (!languageMenu || !languageToggle) return
  languageMenu.classList.remove('is-open')
  languageToggle.setAttribute('aria-expanded', 'false')
}

applyTranslations()
applyContactDetails()

document.querySelectorAll('[data-current-year]').forEach((element) => {
  element.textContent = String(new Date().getFullYear())
})

if (toggle && menu) {
  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('is-open')
    toggle.setAttribute('aria-expanded', String(isOpen))
    setMenuToggleLabel(isOpen)
  })

  menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu))
}

if (languageToggle && languageMenu) {
  languageToggle.addEventListener('click', () => {
    const isOpen = languageMenu.classList.toggle('is-open')
    languageToggle.setAttribute('aria-expanded', String(isOpen))
  })
}

if (languageSelector) {
  document.addEventListener('click', (event) => {
    if (!languageSelector.contains(event.target)) closeLanguageMenu()
  })
}

if (scrollTopButton) {
  const updateScrollTopButton = () => {
    scrollTopButton.classList.toggle('is-visible', window.scrollY > 360)
  }

  scrollTopButton.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  })

  window.addEventListener('scroll', updateScrollTopButton, { passive: true })
  updateScrollTopButton()
}

window.addEventListener('resize', () => {
  if (window.innerWidth > 760) closeMenu()
  closeLanguageMenu()
})

export { locale, text, buildLocalePath }
