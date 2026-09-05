import './style.css'
import { locales, translations } from './i18n.js'

const localeFromPath = window.location.pathname.match(/\/(ru|en)\/?$/)?.[1]
const locale = translations[localeFromPath] ? localeFromPath : (translations[document.documentElement.lang] ? document.documentElement.lang : 'hy')
const text = translations[locale]
const toggle = document.querySelector('[data-menu-toggle]')
const menu = document.querySelector('[data-menu]')
const languageSelector = document.querySelector('[data-language-selector]')
const languageToggle = document.querySelector('[data-language-toggle]')
const languageMenu = document.querySelector('[data-language-menu]')

const setMenuToggleLabel = (isOpen) => {
  const icon = isOpen ? 'icon-close' : 'icon-menu'
  const label = isOpen ? text.menuClose : text.menuOpen

  toggle.innerHTML = `<svg aria-hidden="true"><use href="#${icon}" /></svg><span class="visually-hidden">${label}</span>`
}

const applyTranslations = () => {
  document.documentElement.lang = locale
  document.title = text.pageTitle

  document.querySelectorAll('[data-i18n]').forEach((element) => {
    element.textContent = text[element.dataset.i18n]
  })

  document.querySelectorAll('[data-i18n-html]').forEach((element) => {
    element.innerHTML = text[element.dataset.i18nHtml]
  })

  document.querySelectorAll('[data-i18n-alt]').forEach((element) => {
    element.alt = text[element.dataset.i18nAlt]
  })

  document.querySelectorAll('[data-i18n-aria-label]').forEach((element) => {
    element.setAttribute('aria-label', text[element.dataset.i18nAriaLabel])
  })

  document.querySelectorAll('[data-i18n-content]').forEach((element) => {
    element.setAttribute('content', text[element.dataset.i18nContent])
  })

  document.querySelector('[data-current-language]').textContent = locales[locale].code

  const base = import.meta.env.BASE_URL.replace(/\/$/, '')
  document.querySelectorAll('[data-locale-link]').forEach((link) => {
    const linkLocale = link.dataset.localeLink
    const path = locales[linkLocale].path
    link.href = path === '/' ? `${base}/` : `${base}${path}`
    link.toggleAttribute('aria-current', linkLocale === locale)
  })

  setMenuToggleLabel(false)
}

const closeMenu = () => {
  menu.classList.remove('is-open')
  toggle.setAttribute('aria-expanded', 'false')
  setMenuToggleLabel(false)
}

const closeLanguageMenu = () => {
  languageMenu.classList.remove('is-open')
  languageToggle.setAttribute('aria-expanded', 'false')
}

applyTranslations()

toggle.addEventListener('click', () => {
  const isOpen = menu.classList.toggle('is-open')
  toggle.setAttribute('aria-expanded', String(isOpen))
  setMenuToggleLabel(isOpen)
})

menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu))

languageToggle.addEventListener('click', () => {
  const isOpen = languageMenu.classList.toggle('is-open')
  languageToggle.setAttribute('aria-expanded', String(isOpen))
})

document.addEventListener('click', (event) => {
  if (!languageSelector.contains(event.target)) closeLanguageMenu()
})

window.addEventListener('resize', () => {
  if (window.innerWidth > 760) closeMenu()
  closeLanguageMenu()
})
