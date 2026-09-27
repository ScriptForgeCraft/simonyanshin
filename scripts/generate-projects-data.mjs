import { readdir, readFile, writeFile } from 'node:fs/promises'
import { extname, join, relative, resolve, sep } from 'node:path'

const root = process.cwd()
const portfolioRoot = resolve(root, 'public/portfolio')
const outputFile = resolve(root, 'src/projects-data.generated.js')
const supportedImageExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif'])
const locales = ['hy', 'ru', 'en']

const singleParagraphTitles = {
  'տանիք': {
    hy: 'Տանիքների և պատուհանների փոխարինում',
    ru: 'Замена кровель и окон',
    en: 'Roof and Window Replacement',
  },
}

const stripBold = (value) => value.replace(/^\*\*(.*?)\*\*$/s, '$1').trim()
const isBoldLine = (value) => /^\*\*.*\*\*$/.test(value.trim())

const extractLocaleSection = (source, languageCode) => {
  const marker = languageCode.toUpperCase()
  const expression = new RegExp(
    `={4,}\\s*${marker}\\s*={4,}\\s*([\\s\\S]*?)(?=\\n={4,}\\s*(?:HY|RU|EN)\\s*={4,}|$)`,
    'i',
  )
  return source.match(expression)?.[1]?.trim() ?? ''
}

const parseLocaleContent = (raw, folderName, locale) => {
  const paragraphs = raw
    .split(/\r?\n\s*\r?\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)

  if (!paragraphs.length) {
    return { title: folderName, blocks: [] }
  }

  const titleOverride = singleParagraphTitles[folderName]?.[locale]

  if (paragraphs.length === 1 && !isBoldLine(paragraphs[0])) {
    return {
      title: titleOverride ?? folderName,
      blocks: [{ body: paragraphs[0].replace(/\*\*/g, '').trim() }],
    }
  }

  let title = folderName
  let index = 0
  const first = paragraphs[0]

  if (isBoldLine(first)) {
    title = stripBold(first)
    index = 1
  } else if (!first.includes('\n')) {
    title = stripBold(first)
    index = 1
  }

  const blocks = []
  let current = null

  for (; index < paragraphs.length; index += 1) {
    const paragraph = paragraphs[index]
    const lines = paragraph.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)

    if (lines.length && isBoldLine(lines[0])) {
      if (current) blocks.push(current)
      current = {
        title: stripBold(lines[0]),
        body: lines.slice(1).join(' ').replace(/\*\*/g, '').trim(),
      }
      continue
    }

    const cleanBody = paragraph.replace(/\*\*/g, '').replace(/\r?\n/g, ' ').trim()
    if (!cleanBody) continue

    if (current && !current.body) {
      current.body = cleanBody
    } else {
      if (current) blocks.push(current)
      current = { body: cleanBody }
    }
  }

  if (current) blocks.push(current)

  return { title, blocks }
}

const findPrimaryDescription = (files) => {
  const txtFiles = files.filter((file) => extname(file.name).toLowerCase() === '.txt')
  const preferred = txtFiles.find((file) => file.name.toLowerCase() === 'description.txt')
    ?? txtFiles.find((file) => file.name.toLowerCase() !== 'veranrwgwum.txt')
    ?? txtFiles[0]

  return preferred ?? null
}

const orderFromDescription = (descriptionFile, fallbackIndex) => {
  if (!descriptionFile) return 900 + fallbackIndex
  const stem = descriptionFile.name.replace(/\.txt$/i, '')
  const number = Number.parseInt(stem, 10)
  return Number.isFinite(number) && String(number) === stem ? number : 700 + fallbackIndex
}

const groupDefinitions = [
  {
    directory: '01_Նախագծեր_Projects_Проекты',
    group: 'projects',
  },
  {
    directory: '02_Պատմական_մեխանիզմներ_Historical_Machinery_Старинные_механизмы',
    group: 'machinery',
  },
]

const projects = []
let fallbackIndex = 0

for (const groupDefinition of groupDefinitions) {
  const groupPath = join(portfolioRoot, groupDefinition.directory)
  let folders = []

  try {
    folders = (await readdir(groupPath, { withFileTypes: true }))
      .filter((entry) => entry.isDirectory())
      .sort((a, b) => a.name.localeCompare(b.name, 'hy'))
  } catch {
    continue
  }

  for (const folder of folders) {
    fallbackIndex += 1
    const folderPath = join(groupPath, folder.name)
    const files = (await readdir(folderPath, { withFileTypes: true })).filter((entry) => entry.isFile())
    const descriptionFile = findPrimaryDescription(files)
    if (!descriptionFile) continue

    const source = await readFile(join(folderPath, descriptionFile.name), 'utf8')
    const content = Object.fromEntries(
      locales.map((locale) => [
        locale,
        parseLocaleContent(extractLocaleSection(source, locale), folder.name, locale),
      ]),
    )

    const images = files
      .filter((file) => supportedImageExtensions.has(extname(file.name).toLowerCase()))
      .map((file) => file.name)
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))

    const sourcePath = relative(portfolioRoot, folderPath).split(sep).join('/')
    const idBase = descriptionFile.name.replace(/\.txt$/i, '').toLowerCase().replace(/[^a-z0-9]+/g, '-')
    const id = `${groupDefinition.group}-${idBase || fallbackIndex}-${fallbackIndex}`

    projects.push({
      id,
      group: groupDefinition.group,
      order: orderFromDescription(descriptionFile, fallbackIndex),
      sourcePath,
      images,
      content,
    })
  }
}

projects.sort((a, b) => {
  if (a.group !== b.group) return a.group === 'projects' ? -1 : 1
  return a.order - b.order
})

const banner = '// This file is generated by scripts/generate-projects-data.mjs. Do not edit manually.\n'
await writeFile(outputFile, `${banner}export const projects = ${JSON.stringify(projects, null, 2)}\n`, 'utf8')

console.log(`Generated ${projects.length} portfolio entries -> ${relative(root, outputFile)}`)
