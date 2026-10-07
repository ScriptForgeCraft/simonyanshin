import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import { extname, join, relative, resolve, sep } from 'node:path'
import {
  extractLocaleSection,
  findPrimaryDescription,
  isAsciiSafeName,
  locales,
  parseLocaleContent,
  supportedImageExtensions,
  titleOverrideForDescription,
} from './portfolio-utils.mjs'

const root = process.cwd()
const portfolioRoot = resolve(root, 'public/portfolio')
const outputFile = resolve(root, 'src/projects-data.generated.js')
const pageOutputDirectory = resolve(root, 'src/projects-data-pages')
const projectsPerPage = 18

const groupDefinitions = [
  { directory: 'projects', group: 'projects' },
  { directory: 'historical-machinery', group: 'machinery' },
]

const readProjectMetadata = async (folderPath) => {
  try {
    const raw = await readFile(join(folderPath, 'project.json'), 'utf8')
    return JSON.parse(raw)
  } catch (error) {
    if (error.code === 'ENOENT') return null
    throw new Error(`Invalid project.json in ${folderPath}: ${error.message}`)
  }
}

const projects = []
let fallbackIndex = 0

for (const groupDefinition of groupDefinitions) {
  const groupPath = join(portfolioRoot, groupDefinition.directory)
  let folders = []

  try {
    folders = (await readdir(groupPath, { withFileTypes: true }))
      .filter((entry) => entry.isDirectory())
      .sort((a, b) => a.name.localeCompare(b.name, 'en'))
  } catch (error) {
    if (error.code === 'ENOENT') continue
    throw error
  }

  for (const folder of folders) {
    fallbackIndex += 1

    if (!isAsciiSafeName(folder.name)) {
      throw new Error(
        `Unsafe portfolio directory "${folder.name}". Use only ASCII letters, numbers, dots, dashes and underscores.`,
      )
    }

    const folderPath = join(groupPath, folder.name)
    const files = (await readdir(folderPath, { withFileTypes: true })).filter((entry) => entry.isFile())

    for (const file of files) {
      if (!isAsciiSafeName(file.name)) {
        throw new Error(
          `Unsafe portfolio filename "${file.name}" in ${folder.name}. Keep technical filenames ASCII-only.`,
        )
      }
    }

    const descriptionFile = findPrimaryDescription(files)
    if (!descriptionFile) continue

    const metadata = await readProjectMetadata(folderPath)
    if (metadata?.group && metadata.group !== groupDefinition.group) {
      throw new Error(
        `Group mismatch in ${join(groupDefinition.directory, folder.name, 'project.json')}: `
        + `expected "${groupDefinition.group}", got "${metadata.group}".`,
      )
    }

    const source = await readFile(join(folderPath, descriptionFile.name), 'utf8')
    const content = Object.fromEntries(
      locales.map((locale) => {
        const explicitTitle = metadata?.titles?.[locale]
          ?? titleOverrideForDescription(descriptionFile.name, locale)

        const parsed = parseLocaleContent(
          extractLocaleSection(source, locale),
          explicitTitle ?? folder.name,
          explicitTitle,
        )

        return [locale, parsed]
      }),
    )

    const sourcePath = relative(portfolioRoot, folderPath).split(sep).join('/')
    const availableImages = files
      .filter((file) => supportedImageExtensions.has(extname(file.name).toLowerCase()))
      .map((file) => file.name)
      .sort((a, b) => a.localeCompare(b, 'en', { numeric: true }))

    const configuredImages = metadata?.images
    const images = configuredImages == null
      ? availableImages
      : configuredImages.map((image, index) => {
        if (typeof image === 'string') {
          if (!availableImages.includes(image)) {
            throw new Error(`Unknown image "${image}" in ${sourcePath}/project.json.`)
          }
          return image
        }

        if (
          !image
          || typeof image !== 'object'
          || typeof image.thumbnail !== 'string'
          || typeof image.full !== 'string'
        ) {
          throw new Error(
            `Invalid images[${index}] in ${sourcePath}/project.json. Use a filename or { thumbnail, full }.`,
          )
        }

        for (const filename of [image.thumbnail, image.full]) {
          if (!availableImages.includes(filename)) {
            throw new Error(`Unknown image "${filename}" in ${sourcePath}/project.json.`)
          }
        }

        return { thumbnail: image.thumbnail, full: image.full }
      })

    const order = Number.isFinite(Number(metadata?.order)) ? Number(metadata.order) : 900 + fallbackIndex
    const id = metadata?.id ?? `${groupDefinition.group}-${folder.name}`
    const kind = groupDefinition.group === 'machinery'
      ? 'machinery'
      : (metadata?.kind ?? 'project')

    if (!isAsciiSafeName(id)) {
      throw new Error(`Unsafe project id "${id}" in ${sourcePath}/project.json.`)
    }

    if (!['project', 'service', 'machinery'].includes(kind)) {
      throw new Error(`Invalid portfolio kind "${kind}" in ${sourcePath}/project.json.`)
    }

    projects.push({
      id,
      group: groupDefinition.group,
      kind,
      order,
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
// Service entries are also real completed works. Keep them in the dedicated
// services section, while including them in the main portfolio collection too.
const portfolioProjects = projects
const serviceProjects = projects.filter((project) => project.kind === 'service')
const projectDataPages = Array.from(
  { length: Math.ceil(portfolioProjects.length / projectsPerPage) },
  (_, index) => portfolioProjects.slice(index * projectsPerPage, (index + 1) * projectsPerPage),
)
const dataPageByProjectId = new Map(
  projectDataPages.flatMap((page, pageIndex) => page.map((project) => [project.id, pageIndex + 1])),
)

const createPageDefinitions = (filter) => {
  const filteredProjects = portfolioProjects.filter((project) => (
    filter === 'all'
      || (filter === 'projects' && ['project', 'service'].includes(project.kind))
      || (filter === 'machinery' && project.kind === 'machinery')
  ))

  return Array.from(
    { length: Math.ceil(filteredProjects.length / projectsPerPage) },
    (_, index) => {
      const page = filteredProjects.slice(index * projectsPerPage, (index + 1) * projectsPerPage)
      return {
        ids: page.map((project) => project.id),
        sourcePages: [...new Set(page.map((project) => dataPageByProjectId.get(project.id)))],
      }
    },
  )
}

const projectPages = {
  all: createPageDefinitions('all'),
  projects: createPageDefinitions('projects'),
  machinery: createPageDefinitions('machinery'),
}

const projectCounts = {
  all: portfolioProjects.length,
  projects: portfolioProjects.filter((project) => ['project', 'service'].includes(project.kind)).length,
  machinery: portfolioProjects.filter((project) => project.kind === 'machinery').length,
}

await mkdir(pageOutputDirectory, { recursive: true })
await Promise.all(projectDataPages.map((page, index) => writeFile(
  resolve(pageOutputDirectory, `page-${index + 1}.generated.js`),
  `${banner}export const projects = ${JSON.stringify(page, null, 2)}\n`,
  'utf8',
)))

const pageLoaders = projectDataPages
  .map((_, index) => `  () => import('./projects-data-pages/page-${index + 1}.generated.js'),`)
  .join('\n')

const manifest = `${banner}
export const projectsPerPage = ${projectsPerPage}
export const projectCounts = ${JSON.stringify(projectCounts, null, 2)}
export const projectPages = ${JSON.stringify(projectPages, null, 2)}
export const serviceProjects = ${JSON.stringify(serviceProjects, null, 2)}

const projectDataPageLoaders = [
${pageLoaders}
]

export const loadProjectDataPage = (page) => {
  const loader = projectDataPageLoaders[page - 1]
  return loader ? loader() : Promise.resolve({ projects: [] })
}
`

await writeFile(outputFile, manifest, 'utf8')

const photoCount = projects.reduce((sum, project) => sum + project.images.length, 0)
console.log(
  `Generated ${projects.length} portfolio entries / ${photoCount} images / ${projectDataPages.length} project data pages`,
)
