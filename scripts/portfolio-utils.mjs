import { extname } from 'node:path'

export const locales = ['hy', 'ru', 'en']
export const supportedImageExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif'])

const legacyTitleOverrides = {
  taniq: {
    hy: 'Տանիքների և պատուհանների փոխարինում',
    ru: 'Замена кровель и окон',
    en: 'Roof and Window Replacement',
  },
}

const stripBold = (value) => value.replace(/^\*\*(.*?)\*\*$/s, '$1').trim()
const isBoldLine = (value) => /^\*\*.*\*\*$/.test(value.trim())

export const extractLocaleSection = (source, languageCode) => {
  const marker = languageCode.toUpperCase()
  const expression = new RegExp(
    `={4,}\\s*${marker}\\s*={4,}\\s*([\\s\\S]*?)(?=\\n={4,}\\s*(?:HY|RU|EN)\\s*={4,}|$)`,
    'i',
  )

  return source.match(expression)?.[1]?.trim() ?? ''
}

export const titleOverrideForDescription = (descriptionFileName, locale) => {
  const stem = descriptionFileName.replace(/\.txt$/i, '').toLowerCase()
  return legacyTitleOverrides[stem]?.[locale] ?? null
}

export const parseLocaleContent = (raw, fallbackTitle, titleOverride = null) => {
  const paragraphs = raw
    .split(/\r?\n\s*\r?\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)

  if (!paragraphs.length) {
    return { title: titleOverride ?? fallbackTitle, blocks: [] }
  }

  if (paragraphs.length === 1 && !isBoldLine(paragraphs[0])) {
    return {
      title: titleOverride ?? fallbackTitle,
      blocks: [{ body: paragraphs[0].replace(/\*\*/g, '').trim() }],
    }
  }

  let title = titleOverride ?? fallbackTitle
  let index = 0
  const first = paragraphs[0]

  if (isBoldLine(first)) {
    title = titleOverride ?? stripBold(first)
    index = 1
  } else if (!first.includes('\n')) {
    title = titleOverride ?? stripBold(first)
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

export const findPrimaryDescription = (files) => {
  const txtFiles = files.filter((file) => extname(file.name).toLowerCase() === '.txt')
  const preferred = txtFiles.find((file) => file.name.toLowerCase() === 'description.txt')
    ?? txtFiles.find((file) => file.name.toLowerCase() !== 'veranrwgwum.txt')
    ?? txtFiles[0]

  return preferred ?? null
}

export const orderFromDescription = (descriptionFileName, fallbackIndex) => {
  const stem = descriptionFileName.replace(/\.txt$/i, '')
  const number = Number.parseInt(stem, 10)
  return Number.isFinite(number) && String(number) === stem ? number : 700 + fallbackIndex
}

export const slugifyEnglish = (value) => value
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  || 'project'

export const isAsciiSafeName = (value) => /^[a-z0-9][a-z0-9._-]*$/i.test(value)
