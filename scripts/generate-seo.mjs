import { access, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { translations } from '../src/i18n.js'

const root = process.cwd()
const siteUrl = 'https://simonyanshin.am'
const locales = ['hy', 'ru', 'en']
const localeCodes = { hy: 'hy_AM', ru: 'ru_RU', en: 'en_US' }
const pages = [
  { source: 'index.html', path: '/', titleKey: 'pageTitle', metaKey: 'metaDescription', ogImage: '/projects/simonyanshin-projects-hero.jpg' },
  { source: 'about/index.html', path: '/about/', titleKey: 'aboutPageTitle', metaKey: 'aboutMetaDescription', ogImage: '/about/simonyanshin-team-hero.jpg' },
  { source: 'projects/index.html', path: '/projects/', titleKey: 'worksPageTitle', metaKey: 'worksMetaDescription', ogImage: '/projects/simonyanshin-projects-hero.jpg' },
  { source: 'equipment/index.html', path: '/equipment/', titleKey: 'equipmentPageTitle', metaKey: 'equipmentMetaDescription', ogImage: '/equipment/cat-434-432-backhoe.jpg' },
  { source: 'contact/index.html', path: '/contact/', titleKey: 'contactPageTitle', metaKey: 'contactMetaDescription', ogImage: '/contact/simonyanshin-contact-hero.jpg' },
]

const xmlEscape = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&apos;')

const urlFor = (locale, path) => `${siteUrl}${locale === 'hy' ? path : `/${locale}${path}`}`

const sourceFileFor = (locale, page) => resolve(
  root,
  locale === 'hy' ? page.source : `${locale}/${page.source}`,
)

const jsonLd = (value) => JSON.stringify(value).replaceAll('<', '\\u003c')

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const requiredTranslation = (localized, key, locale, path) => {
  const value = localized[key]
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`Missing SEO translation: ${locale}, ${path}, ${key}`)
  }
  return value
}

const verifyStandardMetadata = (html, { title, description, locale, page }) => {
  if (!html.includes(`<title>${title}</title>`)) {
    throw new Error(`Missing or incorrect title tag: ${locale}, ${page.path}`)
  }
  const descriptionPattern = new RegExp(
    `<meta\\s+[^>]*name="description"[^>]*content="${escapeRegExp(description)}"[^>]*data-i18n-content="${page.metaKey}"[^>]*>`,
    's',
  )
  if (!descriptionPattern.test(html)) {
    throw new Error(`Missing or incorrect meta description: ${locale}, ${page.path}`)
  }
}

const buildSeoBlock = (locale, page) => {
  const localized = translations[locale]
  const canonical = urlFor(locale, page.path)
  const title = requiredTranslation(localized, page.titleKey, locale, page.path)
  const description = requiredTranslation(localized, page.metaKey, locale, page.path)
  const ogImage = `${siteUrl}${page.ogImage}`
  const alternateLinks = locales
    .map((alternateLocale) => `    <link rel="alternate" hreflang="${alternateLocale}" href="${urlFor(alternateLocale, page.path)}" />`)
    .join('\n')
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${siteUrl}/#organization`,
        name: 'SimonyanShin',
        url: siteUrl,
        logo: `${siteUrl}/brand/simonyanshin-logo-navbar-small.avif`,
        email: 'simonyanshinllc@gmail.com',
        telephone: '+37493102205',
        sameAs: [
          'https://www.instagram.com/simonyanshin/',
          'https://www.linkedin.com/in/karen-simonyan-006790334',
        ],
      },
      {
        '@type': 'WebPage',
        '@id': canonical,
        url: canonical,
        name: title,
        description,
        inLanguage: locale,
        about: { '@id': `${siteUrl}/#organization` },
      },
      ...(page.path === '/'
        ? [{
            '@type': 'WebSite',
            '@id': `${siteUrl}/#website`,
            url: siteUrl,
            name: 'SimonyanShin',
            inLanguage: 'hy',
          }]
        : []),
    ],
  }

  return `    <!-- SEO:START -->
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="${canonical}" />
${alternateLinks}
    <link rel="alternate" hreflang="x-default" href="${urlFor('hy', page.path)}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="SimonyanShin" />
    <meta property="og:locale" content="${localeCodes[locale]}" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:title" content="${xmlEscape(title)}" />
    <meta property="og:description" content="${xmlEscape(description)}" />
    <meta property="og:image" content="${ogImage}" />
    <meta property="og:image:alt" content="${xmlEscape(title)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${xmlEscape(title)}" />
    <meta name="twitter:description" content="${xmlEscape(description)}" />
    <meta name="twitter:image" content="${ogImage}" />
    <meta name="twitter:image:alt" content="${xmlEscape(title)}" />
    <script type="application/ld+json">${jsonLd(schema)}</script>
    <!-- SEO:END -->`
}

const seoPattern = /    <!-- SEO:START -->.*?    <!-- SEO:END -->/s

for (const page of pages) {
  await access(resolve(root, 'public', page.ogImage.slice(1)))

  for (const locale of locales) {
    const file = sourceFileFor(locale, page)
    const html = await readFile(file, 'utf8')
    const localized = translations[locale]
    const title = requiredTranslation(localized, page.titleKey, locale, page.path)
    const description = requiredTranslation(localized, page.metaKey, locale, page.path)
    if (!seoPattern.test(html)) {
      throw new Error(`Missing SEO block in ${file}`)
    }
    verifyStandardMetadata(html, { title, description, locale, page })

    await writeFile(file, html.replace(seoPattern, buildSeoBlock(locale, page)), 'utf8')
  }
}

const sitemapEntries = pages.flatMap((page) => locales.map((locale) => {
  const alternateLinks = locales
    .map((alternateLocale) => `    <xhtml:link rel="alternate" hreflang="${alternateLocale}" href="${urlFor(alternateLocale, page.path)}" />`)
    .join('\n')

  return `  <url>
    <loc>${urlFor(locale, page.path)}</loc>
${alternateLinks}
    <xhtml:link rel="alternate" hreflang="x-default" href="${urlFor('hy', page.path)}" />
  </url>`
}))

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${sitemapEntries.join('\n')}
</urlset>
`

await writeFile(resolve(root, 'public/sitemap.xml'), sitemap, 'utf8')
