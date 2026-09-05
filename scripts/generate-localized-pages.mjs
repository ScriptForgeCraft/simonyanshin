import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const root = process.cwd()
const template = await readFile(resolve(root, 'index.html'), 'utf8')

for (const locale of ['ru', 'en']) {
  const directory = resolve(root, locale)
  const localizedPage = template.replace('<html lang="hy">', `<html lang="${locale}">`)

  await mkdir(directory, { recursive: true })
  await writeFile(resolve(directory, 'index.html'), localizedPage)
}
