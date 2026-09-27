import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { translations } from '../src/i18n.js'

const root = process.cwd()
const pages = [
  {
    template: 'index.html',
    output: (locale) => `${locale}/index.html`,
    titleKey: 'pageTitle',
    metaKey: 'metaDescription',
  },
  {
    template: 'projects/index.html',
    output: (locale) => `${locale}/projects/index.html`,
    titleKey: 'worksPageTitle',
    metaKey: 'worksMetaDescription',
  },
]

for (const page of pages) {
  const template = await readFile(resolve(root, page.template), 'utf8')

  for (const locale of ['ru', 'en']) {
    const outputFile = resolve(root, page.output(locale))
    const directory = resolve(outputFile, '..')
    const translated = translations[locale]
    const localizedPage = template
      .replace('<html lang="hy">', `<html lang="${locale}">`)
      .replace(/<title>.*?<\/title>/s, `<title>${translated[page.titleKey]}</title>`)
      .replace(
        new RegExp(`content="[^"]*"\\s+data-i18n-content="${page.metaKey}"`, 's'),
        `content="${translated[page.metaKey]}" data-i18n-content="${page.metaKey}"`,
      )

    await mkdir(directory, { recursive: true })
    await writeFile(outputFile, localizedPage)
  }
}
