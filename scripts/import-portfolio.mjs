import { copyFile, mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises'
import { extname, join, relative, resolve, sep } from 'node:path'
import {
  extractLocaleSection,
  findPrimaryDescription,
  locales,
  orderFromDescription,
  parseLocaleContent,
  slugifyEnglish,
  supportedImageExtensions,
  titleOverrideForDescription,
} from './portfolio-utils.mjs'

const sourceArgument = process.argv[2]

if (!sourceArgument) {
  console.error('Usage: npm run import:portfolio -- "../path/to/SIMONYANSHIN_REORGANIZED"')
  process.exit(1)
}

const root = process.cwd()
const sourceRoot = resolve(root, sourceArgument)
const destinationRoot = resolve(root, 'public/portfolio')
const allowedTechnicalExtensions = new Set([...supportedImageExtensions, '.txt', '.json'])

const normalizedSource = sourceRoot === destinationRoot
  || sourceRoot.startsWith(`${destinationRoot}${sep}`)

if (normalizedSource) {
  console.error('Import source must be outside public/portfolio because the destination is recreated during import.')
  process.exit(1)
}

try {
  const sourceInfo = await stat(sourceRoot)
  if (!sourceInfo.isDirectory()) throw new Error('Source is not a directory')
} catch (error) {
  console.error(`Portfolio source not found: ${sourceRoot}`)
  console.error(error.message)
  process.exit(1)
}

const detectGroup = (name) => {
  const lower = name.toLowerCase()
  if (lower === 'projects' || /^01(?:_|-|$)/.test(lower) || lower.includes('_projects_')) {
    return { group: 'projects', directory: 'projects' }
  }

  if (
    lower === 'historical-machinery'
    || /^02(?:_|-|$)/.test(lower)
    || lower.includes('historical_machinery')
  ) {
    return { group: 'machinery', directory: 'historical-machinery' }
  }

  return null
}

const readMetadataIfPresent = async (folderPath) => {
  try {
    return JSON.parse(await readFile(join(folderPath, 'project.json'), 'utf8'))
  } catch (error) {
    if (error.code === 'ENOENT') return null
    throw new Error(`Invalid project.json in ${folderPath}: ${error.message}`)
  }
}

const groups = (await readdir(sourceRoot, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .map((entry) => ({ entry, definition: detectGroup(entry.name) }))
  .filter(({ definition }) => definition)

if (!groups.length) {
  console.error('No portfolio groups found. Expected folders such as 01_* / 02_* or projects / historical-machinery.')
  process.exit(1)
}

const preparedProjects = []
let fallbackIndex = 0

for (const { entry: groupEntry, definition } of groups) {
  const sourceGroupPath = join(sourceRoot, groupEntry.name)
  const projectFolders = (await readdir(sourceGroupPath, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .sort((a, b) => a.name.localeCompare(b.name))

  for (const projectFolder of projectFolders) {
    fallbackIndex += 1
    const sourceProjectPath = join(sourceGroupPath, projectFolder.name)
    const files = (await readdir(sourceProjectPath, { withFileTypes: true })).filter((entry) => entry.isFile())
    const descriptionFile = findPrimaryDescription(files)

    if (!descriptionFile) {
      console.warn(`Skipped ${relative(sourceRoot, sourceProjectPath)}: no TXT description found.`)
      continue
    }

    const source = await readFile(join(sourceProjectPath, descriptionFile.name), 'utf8')
    const sourceMetadata = await readMetadataIfPresent(sourceProjectPath)

    const content = Object.fromEntries(
      locales.map((locale) => {
        const explicitTitle = sourceMetadata?.titles?.[locale]
          ?? titleOverrideForDescription(descriptionFile.name, locale)

        return [
          locale,
          parseLocaleContent(
            extractLocaleSection(source, locale),
            explicitTitle ?? projectFolder.name,
            explicitTitle,
          ),
        ]
      }),
    )

    const englishTitle = content.en.title || content.hy.title || projectFolder.name
    preparedProjects.push({
      definition,
      sourceProjectPath,
      files,
      descriptionFile,
      source,
      content,
      sourceMetadata,
      baseSlug: slugifyEnglish(englishTitle),
      order: Number.isFinite(Number(sourceMetadata?.order))
        ? Number(sourceMetadata.order)
        : orderFromDescription(descriptionFile.name, fallbackIndex),
    })
  }
}

await rm(destinationRoot, { recursive: true, force: true })
await mkdir(destinationRoot, { recursive: true })

const usedSlugs = new Map()
let copiedFiles = 0
let copiedBytes = 0
let skippedFiles = 0

for (const project of preparedProjects) {
  const slugKey = `${project.definition.directory}/${project.baseSlug}`
  const duplicateIndex = (usedSlugs.get(slugKey) ?? 0) + 1
  usedSlugs.set(slugKey, duplicateIndex)
  const slug = duplicateIndex === 1 ? project.baseSlug : `${project.baseSlug}-${duplicateIndex}`

  const destinationProjectPath = join(destinationRoot, project.definition.directory, slug)
  await mkdir(destinationProjectPath, { recursive: true })

  await writeFile(join(destinationProjectPath, 'description.txt'), project.source, 'utf8')
  copiedFiles += 1
  copiedBytes += Buffer.byteLength(project.source)

  const metadata = {
    id: `${project.definition.group}-${slug}`,
    group: project.definition.group,
    order: project.order,
    titles: Object.fromEntries(locales.map((locale) => [locale, project.content[locale].title])),
  }

  const metadataSource = `${JSON.stringify(metadata, null, 2)}\n`
  await writeFile(join(destinationProjectPath, 'project.json'), metadataSource, 'utf8')
  copiedFiles += 1
  copiedBytes += Buffer.byteLength(metadataSource)

  const images = project.files
    .filter((file) => supportedImageExtensions.has(extname(file.name).toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))

  for (let index = 0; index < images.length; index += 1) {
    const image = images[index]
    const extension = extname(image.name).toLowerCase()
    const destinationName = `image-${String(index + 1).padStart(3, '0')}${extension}`
    const sourcePath = join(project.sourceProjectPath, image.name)
    const destinationPath = join(destinationProjectPath, destinationName)

    await copyFile(sourcePath, destinationPath)
    const fileInfo = await stat(sourcePath)
    copiedBytes += fileInfo.size
    copiedFiles += 1
  }

  skippedFiles += project.files.filter((file) => {
    const extension = extname(file.name).toLowerCase()
    return file.isFile() && !allowedTechnicalExtensions.has(extension)
  }).length
}

const sizeMb = (copiedBytes / 1024 / 1024).toFixed(1)
console.log(`Portfolio imported: ${preparedProjects.length} projects, ${copiedFiles} files, ${sizeMb} MB -> public/portfolio`)
console.log('Technical folders and filenames were normalized to ASCII-safe English slugs.')
console.log(`Skipped unsupported files: ${skippedFiles} (for example HEIC/MOV)`)
