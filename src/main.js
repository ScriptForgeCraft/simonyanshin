import './style.css'

const toggle = document.querySelector('[data-menu-toggle]')
const menu = document.querySelector('[data-menu]')

const closeMenu = () => {
  menu.classList.remove('is-open')
  toggle.setAttribute('aria-expanded', 'false')
  toggle.innerHTML = '<svg aria-hidden="true"><use href="#icon-menu" /></svg><span class="visually-hidden">Բացել ընտրացանկը</span>'
}

toggle.addEventListener('click', () => {
  const isOpen = menu.classList.toggle('is-open')
  toggle.setAttribute('aria-expanded', String(isOpen))
  toggle.innerHTML = isOpen
    ? '<svg aria-hidden="true"><use href="#icon-close" /></svg><span class="visually-hidden">Փակել ընտրացանկը</span>'
    : '<svg aria-hidden="true"><use href="#icon-menu" /></svg><span class="visually-hidden">Բացել ընտրացանկը</span>'
})

menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu))

window.addEventListener('resize', () => {
  if (window.innerWidth > 760) closeMenu()
})
