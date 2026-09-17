import { removeBackground } from '@imgly/background-removal-node'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const inputPath = path.resolve('app/assets/images/portfolio-image.png')
const outputPath = path.resolve('app/assets/images/portfolio-image-cutout.png')

const inputBuffer = await readFile(inputPath)
const blob = await removeBackground(new Blob([inputBuffer], { type: 'image/png' }))
const buffer = Buffer.from(await blob.arrayBuffer())

await writeFile(outputPath, buffer)
console.log(`Wrote ${outputPath}`)
