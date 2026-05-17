import fs from 'node:fs'
import { createPatch } from 'diff'

export default function createPatch_(originalFilePath: string, patchedFilePath: string, outputPatchPath: string) {
  // 1. Read the content of the two files as text strings
  const originalText = fs.readFileSync(originalFilePath, 'utf8')
  const patchedText = fs.readFileSync(patchedFilePath, 'utf8')

  // 2. Generate the diff
  let patchString = createPatch(
    '',
    originalText,
    patchedText,
    '',
    '',
    { context: 3 }  // Standard of keeping 3 lines of context around changes
  )

  // 3. Remove the header so it starts directly with @@
  patchString = patchString.slice(patchString.indexOf('@@'))

  // 4. Save the resulting string to the .patch file
  fs.writeFileSync(outputPatchPath, patchString, 'utf8')

  console.log(`💾 Patched ${outputPatchPath}`)
}
