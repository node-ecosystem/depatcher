import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { applyPatch } from 'diff'

import { type getPackageManagerPatcher, run } from './utils.ts'

export default async function applyPatch_(pacakgeManagerPatcher: ReturnType<typeof getPackageManagerPatcher>, packageName: string, patchMap: Record<string, string>) {
  console.log(`🔄 Start patching "${packageName}"`)

  const patchOutput = run(`${pacakgeManagerPatcher.patch} ${packageName}`)

  const tempDir = pacakgeManagerPatcher.getTempDir(patchOutput)

  if (!existsSync(tempDir)) {
    console.error(patchOutput)
    throw new Error(`❌ Failed to get temp directory: ${patchOutput}`)
  }

  for (const [originalFile, patchPath] of Object.entries(patchMap)) {
    const fileToPatch = join(tempDir, originalFile)
    const patchedFile = applyPatch(
      readFileSync(fileToPatch, 'utf8').toString(),
      readFileSync(patchPath, 'utf8').toString()
    )
    if (!patchedFile) {
      throw new Error(`❌ Patch failed: ${fileToPatch} with ${patchPath}`)
    }
    writeFileSync(fileToPatch, patchedFile, 'utf8')

    console.log(`💾 Patched: ${fileToPatch} with ${patchPath}`)
  }

  run(`${pacakgeManagerPatcher.patchCommit} "${tempDir}"`)

  console.log(`📦 Patched: "${packageName}"`)
}
