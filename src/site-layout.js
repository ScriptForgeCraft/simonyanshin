const page = document.body.dataset.page || 'home'

const sprite = `
  <svg class="svg-sprite" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
    <symbol id="icon-crane" viewBox="0 0 64 64"><path d="M18 58V10h28M9 20h49M18 20l25 15H27l25-15M26 58V39h19v19M35 20v38M9 58h49"/></symbol>
    <symbol id="icon-house" viewBox="0 0 64 64"><path d="m8 31 24-21 24 21v24H8V31Zm13 24V42h22v13m-22-18h14"/></symbol>
    <symbol id="icon-column" viewBox="0 0 64 64"><path d="M13 12h38M10 17h44M18 23h28M21 23v28m8-28v28m8-28v28m8-28v28M15 51h34m-38 5h42"/></symbol>
    <symbol id="icon-tool" viewBox="0 0 64 64"><path d="M43 10a14 14 0 0 0-16 18L10 45a6 6 0 1 0 9 9l17-17a14 14 0 0 0 18-16l-9 9-8-8 6-12Z"/></symbol>
    <symbol id="icon-people" viewBox="0 0 64 64"><path d="M32 32a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm-16 3a7 7 0 1 0 0-14m32 14a7 7 0 1 0 0-14M19 54v-7c0-7 6-12 13-12s13 5 13 12v7M6 54v-5c0-6 4-10 10-11m42 16v-5c0-6-4-10-10-11"/></symbol>
    <symbol id="icon-eye" viewBox="0 0 64 64"><path d="M4 32s10-16 28-16 28 16 28 16-10 16-28 16S4 32 4 32Zm28 9a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-14v10m-5-5h10"/></symbol>
    <symbol id="icon-badge" viewBox="0 0 64 64"><path d="m32 8 6 5 8-1 3 7 7 4-2 8 2 8-7 4-3 7-8-1-6 5-6-5-8 1-3-7-7-4 2-8-2-8 7-4 3-7 8 1 6-5Zm0 17 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1 3-6Z"/></symbol>
    <symbol id="icon-shield" viewBox="0 0 64 64"><path d="M32 7 52 15v14c0 13-8 23-20 28C20 52 12 42 12 29V15l20-8Zm-9 24 6 6 12-13"/></symbol>
    <symbol id="icon-solid-helmet" viewBox="0 0 576 512"><path d="M256 32c-17.7 0-32 14.3-32 32v101.9c0 5.6-4.5 10.1-10.1 10.1-3.6 0-7-1.9-8.8-5.1L157.1 87C83 123.5 32 199.8 32 288v64h512v-66.4C543.1 198.4 492.3 123.2 418.9 87l-48 83.9c-1.8 3.2-5.2 5.1-8.8 5.1-5.6 0-10.1-4.5-10.1-10.1V64c0-17.7-14.3-32-32-32h-64zM16.6 384C7.4 384 0 391.4 0 400.6c0 4.7 2 9.2 5.8 11.9C27.5 428.4 111.8 480 288 480s260.5-51.6 282.2-67.5c3.8-2.8 5.8-7.2 5.8-11.9 0-9.2-7.4-16.6-16.6-16.6H16.6z"/></symbol>
    <symbol id="icon-solid-tools" viewBox="0 0 512 512"><path d="M78.6 5C69.1-2.4 55.6-1.5 47 7L7 47c-8.5 8.5-9.4 22-2.1 31.6l80 104c4.5 5.9 11.6 9.4 19 9.4h54.1l109 109c-14.7 29-10 65.4 14.3 89.6l112 112c12.5 12.5 32.8 12.5 45.3 0l64-64c12.5-12.5 12.5-32.8 0-45.3l-112-112c-24.2-24.2-60.6-29-89.6-14.3l-109-109v-54.1c0-7.5-3.5-14.5-9.4-19L78.6 5zM19.9 396.1C7.2 408.8 0 426.1 0 444.1 0 481.6 30.4 512 67.9 512c18 0 35.3-7.2 48-19.9L233.7 374.3c-7.8-20.9-9-43.6-3.6-65.1l-61.7-61.7L19.9 396.1zM512 144c0-10.5-1.1-20.7-3.2-30.5-2.4-11.2-16.1-14.1-24.2-6l-63.9 63.9c-3 3-7.1 4.7-11.3 4.7H352c-8.8 0-16-7.2-16-16v-57.4c0-4.2 1.7-8.3 4.7-11.3l63.9-63.9c8.1-8.1 5.2-21.8-6-24.2C388.7 1.1 378.5 0 368 0c-79.5 0-144 64.5-144 144v.8l85.3 85.3c36-9.1 75.8.5 104 28.7l15.7 15.7c49-23 83-72.8 83-130.5zM56 432a24 24 0 1 1 48 0 24 24 0 1 1-48 0z"/></symbol>
    <symbol id="icon-solid-landmark" viewBox="0 0 512 512"><path d="M240.1 4.2c9.8-5.6 21.9-5.6 31.8 0l171.8 98.1L448 104v.9l47.9 27.4c12.6 7.2 18.8 22 15.1 36S494.6 192 480.1 192H32c-14.5 0-27.2-9.8-30.9-23.8s2.5-28.8 15.1-36L64 104.9v-.9l4.4-1.6L240.1 4.2zM64 224h64v192h40V224h64v192h48V224h64v192h40V224h64v196.3c.6.3 1.2.7 1.8 1.1l48 32c11.7 7.8 17 22.4 12.9 35.9S494.1 512 480 512H32c-14.1 0-26.5-9.2-30.6-22.7s1.1-28.1 12.9-35.9l48-32c.6-.4 1.2-.7 1.8-1.1L64 224z"/></symbol>
    <symbol id="icon-arrow" viewBox="0 0 24 24"><path d="M4 12h15m-5-5 5 5-5 5"/></symbol>
    <symbol id="icon-menu" viewBox="0 0 24 24"><path d="M3 6h18M3 12h18M3 18h18"/></symbol>
    <symbol id="icon-close" viewBox="0 0 24 24"><path d="m5 5 14 14M19 5 5 19"/></symbol>
    <symbol id="icon-chevron-left" viewBox="0 0 24 24"><path d="m15 5-7 7 7 7"/></symbol>
    <symbol id="icon-chevron-right" viewBox="0 0 24 24"><path d="m9 5 7 7-7 7"/></symbol>
    <symbol id="icon-expand" viewBox="0 0 24 24"><path d="M8 3H3v5m13-5h5v5M8 21H3v-5m13 5h5v-5M3 8l6-6m12 6-6-6M3 16l6 6m12-6-6 6"/></symbol>
    <symbol id="icon-phone" viewBox="0 0 24 24"><path d="M7 3h3l2 5-2 2c1 2 3 4 5 5l2-2 5 2v3c0 2-2 3-4 3C10 21 3 14 3 6c0-2 2-3 4-3Z"/></symbol>
    <symbol id="icon-mail" viewBox="0 0 24 24"><path d="M3 5h18v14H3V5Zm0 2 9 6 9-6"/></symbol>
    <symbol id="icon-pin" viewBox="0 0 24 24"><path d="M20 10c0 5-8 11-8 11s-8-6-8-11a8 8 0 1 1 16 0Zm-8 3a3 3 0 1 0 0-6 3 3 0 0 6Z"/></symbol>
    <symbol id="icon-linkedin" viewBox="0 0 448 512"><path d="M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z"/></symbol>
    <symbol id="icon-telegram" viewBox="0 0 496 512"><path d="M248 8C111.033 8 0 119.033 0 256s111.033 248 248 248 248-111.033 248-248S384.967 8 248 8zm114.952 168.66c-3.732 39.215-19.881 134.378-28.1 178.3-3.476 18.584-10.322 24.816-16.948 25.425-14.4 1.326-25.338-9.517-39.287-18.661-21.827-14.308-34.158-23.215-55.346-37.177-24.485-16.135-8.612-25 5.342-39.5 3.652-3.793 67.107-61.51 68.335-66.746.153-.655.3-3.1-1.154-4.384s-3.59-.849-5.135-.5q-3.283.746-104.608 69.142-14.845 10.194-26.894 9.934c-8.855-.191-25.888-5.006-38.551-9.123-15.531-5.048-27.875-7.717-26.8-16.291q.84-6.7 18.45-13.7 108.446-47.248 144.628-62.3c68.872-28.647 83.183-33.623 92.511-33.789 2.052-.034 6.639.474 9.61 2.885a10.452 10.452 0 0 1 3.53 6.716 43.765 43.765 0 0 1 .201 9.318z"/></symbol>
    <symbol id="icon-whatsapp" viewBox="0 0 448 512"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/></symbol>
    <symbol id="icon-viber" viewBox="0 0 24 24"><path d="M5.2 4.3h13.6A2.2 2.2 0 0 1 21 6.5v9a2.2 2.2 0 0 1-2.2 2.2h-6.4L8 21v-3.3H5.2A2.2 2.2 0 0 1 3 15.5v-9a2.2 2.2 0 0 1 2.2-2.2Z"/><path d="M9.2 8.2c.2-.4.5-.4.7-.4h.3c.2 0 .4.1.5.4l.5 1.2c.1.2.1.4 0 .5l-.4.5c.5.8 1.1 1.4 1.9 1.9l.5-.4c.1-.1.3-.1.5 0l1.2.5c.3.1.4.3.4.5v.3c0 .2 0 .5-.4.7-.4.2-1 .2-1.7-.1-1.1-.5-2.1-1.2-3-2.1-.9-.9-1.6-1.9-2.1-3-.3-.7-.3-1.3-.1-1.7Z"/><path d="M14.8 6.9c1.3.2 2.1 1 2.3 2.3M14.6 8.6c.5.1.8.4.9.9"/></symbol>
  </svg>`

const navItems = [
  ['home', 'navHome'],
  ['about', 'navAbout'],
  ['services', 'navServices'],
  ['projects', 'navProjects'],
  ['equipment', 'navEquipment'],
  ['contact', 'navContact'],
]

const navLink = (id, key) => {
  const active = id === page ? ' class="is-current" aria-current="page"' : ''
  const attribute = id === 'services' ? 'data-home-anchor="services"' : `data-${id}-link`
  return `<a${active} href="/" ${attribute} data-i18n="${key}"></a>`
}

const header = `
  <header class="site-header" data-header>
    <div class="container header-inner">
      <a class="brand" href="/" data-home-link aria-label="SimonyanShin գլխավոր էջ" data-i18n-aria-label="brandHome">
        <span class="brand-copy"><strong>SIMONYAN SHIN</strong><small data-i18n="brandTagline">ՇԻՆԱՐԱՐԱԿԱՆ ԸՆԿԵՐՈՒԹՅՈՒՆ</small></span>
      </a>
      <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="primary-navigation" data-menu-toggle><svg aria-hidden="true"><use href="#icon-menu" /></svg><span class="visually-hidden" data-i18n="menuOpen">Բացել ընտրացանկը</span></button>
      <nav id="primary-navigation" class="primary-nav" aria-label="Հիմնական ընտրացանկ" data-menu>${navItems.map(([id, key]) => navLink(id, key)).join('')}</nav>
      <div class="language-selector" data-language-selector>
        <button class="language-select" type="button" aria-expanded="false" aria-controls="language-menu" data-language-toggle data-i18n-aria-label="languageMenu"><span data-current-language>HY</span><span aria-hidden="true">⌄</span></button>
        <div id="language-menu" class="language-menu" data-language-menu>
          <a href="/" hreflang="hy" lang="hy" data-locale-link="hy">Հայ</a>
          <a href="/ru/" hreflang="ru" lang="ru" data-locale-link="ru">RU</a>
          <a href="/en/" hreflang="en" lang="en" data-locale-link="en">EN</a>
        </div>
      </div>
    </div>
  </header>`

const footer = `
  <footer class="site-footer">
    <div class="container">
      <div class="site-footer-main">
        <div class="site-footer-brand">
          <a class="site-footer-brand-link" href="/" data-home-link aria-label="SimonyanShin գլխավոր էջ" data-i18n-aria-label="brandHome">
            <span class="site-footer-brand-name">SIMONYAN SHIN</span>
            <span class="site-footer-brand-tagline" data-i18n="brandTagline">ՇԻՆԱՐԱՐԱԿԱՆ ԸՆԿԵՐՈՒԹՅՈՒՆ</span>
          </a>
          <p data-i18n="footerDescription">Շինարարություն, վերանորոգում և պատմամշակութային ժառանգության վերականգնում Հայաստանում։</p>
        </div>
        <nav class="site-footer-nav" aria-label="ՆԱՎԻԳԱՑԻԱ" data-i18n-aria-label="footerNavigation">
          <h2 class="site-footer-heading" data-i18n="footerNavigation">ՆԱՎԻԳԱՑԻԱ</h2>
          <div class="site-footer-nav-links">${navItems.map(([id, key]) => navLink(id, key)).join('')}</div>
        </nav>
        <section class="site-footer-contact" aria-labelledby="site-footer-contact-title">
          <h2 id="site-footer-contact-title" class="site-footer-heading" data-i18n="footerContact">ԿԱՊ</h2>
          <address class="site-footer-address">
            <a data-contact-phone><svg aria-hidden="true"><use href="#icon-phone" /></svg><span data-contact-phone-text></span></a>
            <a data-contact-email><svg aria-hidden="true"><use href="#icon-mail" /></svg><span data-contact-email-text></span></a>
            <p><svg aria-hidden="true"><use href="#icon-pin" /></svg><span data-i18n="contactLocation">Երևան, Հայաստան</span></p>
          </address>
          <div class="socials site-footer-socials" aria-label="Սոցիալական հարթակներ" data-i18n-aria-label="contactSocialsLabel">
            <a aria-label="LinkedIn" data-social-link="linkedin"><svg aria-hidden="true"><use href="#icon-linkedin" /></svg></a>
            <a aria-label="Telegram" data-social-link="telegram"><svg aria-hidden="true"><use href="#icon-telegram" /></svg></a>
            <a aria-label="WhatsApp" data-social-link="whatsapp"><svg aria-hidden="true"><use href="#icon-whatsapp" /></svg></a>
            <a aria-label="Viber" data-social-link="viber"><svg aria-hidden="true"><use href="#icon-viber" /></svg></a>
          </div>
        </section>
      </div>
      <div class="site-footer-bottom">
        <span class="site-footer-copyright">© <span data-current-year></span> SIMONYAN SHIN</span>
        <p class="site-footer-credit" data-i18n-html="footerDeveloperCredit">Պատրաստված է <span>Script Forge</span>-ի կողմից</p>
      </div>
    </div>
  </footer>`

const existingSprite = document.querySelector('.svg-sprite')
if (existingSprite) existingSprite.outerHTML = sprite

const existingHeader = document.querySelector('[data-header]')
if (existingHeader) existingHeader.outerHTML = header

const existingFooter = document.querySelector('.site-footer')
if (existingFooter) existingFooter.outerHTML = footer
