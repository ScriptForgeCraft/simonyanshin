import { copyFile, mkdir, readdir, rm, stat } from 'node:fs/promises'
import { extname, join, resolve } from 'node:path'

const sourceArgument = process.argv[2]

if (!sourceArgument) {
  console.error('Usage: npm run import:portfolio -- "../path/to/SIMONYANSHIN_REORGANIZED"')
  process.exit(1)
}

const sourceRoot = resolve(process.cwd(), sourceArgument)
const destinationRoot = resolve(process.cwd(), 'public/portfolio')
const allowedExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.txt'])

try {
  const sourceInfo = await stat(sourceRoot)
  if (!sourceInfo.isDirectory()) throw new Error('Source is not a directory')
} catch (error) {
  console.error(`Portfolio source not found: ${sourceRoot}`)
  console.error(error.message)
  process.exit(1)
}

let copiedFiles = 0
let skippedFiles = 0
let copiedBytes = 0

const copyDirectory = async (sourceDirectory, destinationDirectory) => {
  await mkdir(destinationDirectory, { recursive: true })
  const entries = await readdir(sourceDirectory, { withFileTypes: true })

  for (const entry of entries) {
    const sourcePath = join(sourceDirectory, entry.name)
    const destinationPath = join(destinationDirectory, entry.name)

    if (entry.isDirectory()) {
      await copyDirectory(sourcePath, destinationPath)
      continue
    }

    if (!entry.isFile()) continue

    const extension = extname(entry.name).toLowerCase()
    if (!allowedExtensions.has(extension)) {
      skippedFiles += 1
      continue
    }

    await copyFile(sourcePath, destinationPath)
    const fileInfo = await stat(sourcePath)
    copiedBytes += fileInfo.size
    copiedFiles += 1
  }
}

await rm(destinationRoot, { recursive: true, force: true })
await copyDirectory(sourceRoot, destinationRoot)

const sizeMb = (copiedBytes / 1024 / 1024).toFixed(1)
console.log(`Portfolio imported: ${copiedFiles} files, ${sizeMb} MB -> public/portfolio`)
console.log(`Skipped unsupported files: ${skippedFiles} (for example HEIC/MOV)`)
