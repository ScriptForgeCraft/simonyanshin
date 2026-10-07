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
    <symbol id="icon-instagram" viewBox="0 0 24 24"><path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z"/></symbol>
    <symbol id="icon-linkedin" viewBox="0 0 24 24"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></symbol>
    <symbol id="icon-telegram" viewBox="0 0 24 24"><path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z"/></symbol>
    <symbol id="icon-whatsapp" viewBox="0 0 24 24"><path d="M16.75 13.96c.25.13.41.2.46.3.06.11.04.61-.21 1.18-.2.56-1.24 1.1-1.7 1.12-.46.02-.47.36-2.96-.73-2.49-1.09-3.99-3.75-4.11-3.92-.12-.17-.96-1.38-.92-2.61.05-1.22.69-1.8.95-2.04.24-.26.51-.29.68-.26h.47c.15 0 .36-.06.55.45l.69 1.87c.06.13.1.28.01.44l-.27.41-.39.42c-.12.12-.26.25-.12.5.12.26.62 1.09 1.32 1.78.91.88 1.71 1.17 1.95 1.3.24.14.39.12.54-.04l.81-.94c.19-.25.35-.19.58-.11l1.67.88M12 2a10 10 0 0 1 10 10 10 10 0 0 1-10 10c-1.97 0-3.8-.57-5.35-1.55L2 22l1.55-4.65A9.969 9.969 0 0 1 2 12 10 10 0 0 1 12 2m0 2a8 8 0 0 0-8 8c0 1.72.54 3.31 1.46 4.61L4.5 19.5l2.89-.96A7.95 7.95 0 0 0 12 20a8 8 0 0 0 8-8 8 8 0 0 0-8-8z"/></symbol>
    <symbol id="icon-viber" viewBox="0 0 24 24"><path fill="currentColor" stroke="none" d="M11.4 0C9.473.028 5.333.344 3.02 2.467 1.302 4.187.696 6.7.633 9.817.57 12.933.488 18.776 6.12 20.36h.003l-.004 2.416s-.037.977.61 1.177c.777.242 1.234-.5 1.98-1.302.407-.44.972-1.084 1.397-1.58 3.85.326 6.812-.416 7.15-.525.776-.252 5.176-.816 5.892-6.657.74-6.02-.36-9.83-2.34-11.546-.596-.55-3.006-2.3-8.375-2.323 0 0-.395-.025-1.037-.017zm.058 1.693c.545-.004.88.017.88.017 4.542.02 6.717 1.388 7.222 1.846 1.675 1.435 2.53 4.868 1.906 9.897v.002c-.604 4.878-4.174 5.184-4.832 5.395-.28.09-2.882.737-6.153.524 0 0-2.436 2.94-3.197 3.704-.12.12-.26.167-.352.144-.13-.033-.166-.188-.165-.414l.02-4.018c-4.762-1.32-4.485-6.292-4.43-8.895.054-2.604.543-4.738 1.996-6.173 1.96-1.773 5.474-2.018 7.11-2.03zm.38 2.602c-.167 0-.303.135-.304.302 0 .167.133.303.3.305 1.624.01 2.946.537 4.028 1.592 1.073 1.046 1.62 2.468 1.633 4.334.002.167.14.3.307.3.166-.002.3-.138.3-.304-.014-1.984-.618-3.596-1.816-4.764-1.19-1.16-2.692-1.753-4.447-1.765zm-3.96.695c-.19-.032-.4.005-.616.117l-.01.002c-.43.247-.816.562-1.146.932-.002.004-.006.004-.008.008-.267.323-.42.638-.46.948-.008.046-.01.093-.007.14 0 .136.022.27.065.4l.013.01c.135.48.473 1.276 1.205 2.604.42.768.903 1.5 1.446 2.186.27.344.56.673.87.984l.132.132c.31.308.64.6.984.87.686.543 1.418 1.027 2.186 1.447 1.328.733 2.126 1.07 2.604 1.206l.01.014c.13.042.265.064.402.063.046.002.092 0 .138-.008.31-.036.627-.19.948-.46.004 0 .003-.002.008-.005.37-.33.683-.72.93-1.148l.003-.01c.225-.432.15-.842-.18-1.12-.004 0-.698-.58-1.037-.83-.36-.255-.73-.492-1.113-.71-.51-.285-1.032-.106-1.248.174l-.447.564c-.23.283-.657.246-.657.246-3.12-.796-3.955-3.955-3.955-3.955s-.037-.426.248-.656l.563-.448c.277-.215.456-.737.17-1.248-.217-.383-.454-.756-.71-1.115-.25-.34-.826-1.033-.83-1.035-.137-.165-.31-.265-.502-.297zm4.49.88c-.158.002-.29.124-.3.282-.01.167.115.312.282.324 1.16.085 2.017.466 2.645 1.15.63.688.93 1.524.906 2.57-.002.168.13.306.3.31.166.003.305-.13.31-.297.025-1.175-.334-2.193-1.067-2.994-.74-.81-1.777-1.253-3.05-1.346h-.024zm.463 1.63c-.16.002-.29.127-.3.287-.008.167.12.31.288.32.523.028.875.175 1.113.422.24.245.388.62.416 1.164.01.167.15.295.318.287.167-.008.295-.15.287-.317-.03-.644-.215-1.178-.58-1.557-.367-.378-.893-.574-1.52-.607h-.018z"/></symbol>
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
        <img class="brand-mark" src="/brand/simonyanshin-logo-navbar.png" alt="" width="256" height="256" />
        <span class="brand-copy"><strong data-i18n="brandName">ՍԻՄՈՆՅԱՆ ՇԻՆ</strong><small data-i18n="brandTagline">ՇԻՆԱՐԱՐԱԿԱՆ ԸՆԿԵՐՈՒԹՅՈՒՆ</small></span>
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
            <span class="site-footer-brand-name" data-i18n="footerCompanyName">«Սիմոնյան Շին» ՍՊԸ</span>
          </a>
          <p data-i18n="footerDescription">Շինարարություն, վերանորոգում և պատմամշակութային ժառանգության վերականգնում Հայաստանում։</p>
        </div>
        <nav class="site-footer-nav" aria-label="ԲԱԺԻՆՆԵՐ" data-i18n-aria-label="footerNavigation">
          <h2 class="site-footer-heading" data-i18n="footerNavigation">ԲԱԺԻՆՆԵՐ</h2>
          <div class="site-footer-nav-links">${navItems.map(([id, key]) => navLink(id, key)).join('')}</div>
        </nav>
        <section class="site-footer-contact" aria-labelledby="site-footer-contact-title">
          <h2 id="site-footer-contact-title" class="site-footer-heading" data-i18n="footerContact">ԿԱՊ</h2>
          <address class="site-footer-address">
            <a data-contact-phone><svg aria-hidden="true"><use href="#icon-phone" /></svg><span data-contact-phone-text></span></a>
            <a data-contact-email><svg aria-hidden="true"><use href="#icon-mail" /></svg><span data-contact-email-text></span></a>
          </address>
          <div class="socials site-footer-socials" aria-label="Սոցիալական հարթակներ" data-i18n-aria-label="contactSocialsLabel">
            <a aria-label="Instagram" data-social-link="instagram"><svg aria-hidden="true"><use href="#icon-instagram" /></svg></a>
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

document.body.insertAdjacentHTML('beforeend', `
  <button class="scroll-top" type="button" data-scroll-top aria-label="Վերադառնալ վերև" data-i18n-aria-label="scrollToTop">
    <svg aria-hidden="true"><use href="#icon-arrow" /></svg>
  </button>
`)
