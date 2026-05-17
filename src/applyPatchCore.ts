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

  for (const originalFile in patchMap) {
    const fileToPatch = join(tempDir, originalFile)
    if (!existsSync(fileToPatch)) {
      throw new Error(`❌ Original file not found: ${fileToPatch}`)
    }

    const patchPath = patchMap[originalFile]
    if (!existsSync(patchPath)) {
      throw new Error(`❌ Patch file not found: ${patchPath}`)
    }

    const patchedFile = applyPatch(
      readFileSync(fileToPatch, 'utf8').toString(),
      readFileSync(patchPath, 'utf8').toString()
    )
    if (patchedFile) {
      writeFileSync(fileToPatch, patchedFile, 'utf8')
      console.log(`💾 Patched: ${fileToPatch} with ${patchPath}`)
    } else {
      console.info(`ℹ️  Already patched: ${fileToPatch} with ${patchPath}`)
    }
  }

  run(`${pacakgeManagerPatcher.patchCommit} "${tempDir}"`)

  console.log(`📦 Patched: "${packageName}"`)
}
