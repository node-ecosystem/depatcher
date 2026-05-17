import fs from 'node:fs'
import path from 'node:path'
import { applyPatch } from 'diff'

import { type getPackageManagerPatcher, run } from './utils.ts'

export default async function applyPatchCore(packageManagerPatcher: ReturnType<typeof getPackageManagerPatcher>, packageName: string, patchMap: Record<string, string>) {
  console.log(`🔄 Start patching "${packageName}"`)

  const patchOutput = run(`${packageManagerPatcher.patch} ${packageName}`)

  const tempDir = packageManagerPatcher.getTempDir(patchOutput)

  if (!fs.existsSync(tempDir)) {
    console.error(patchOutput)
    throw new Error(`❌ Failed to get temp directory: ${patchOutput}`)
  }

  for (const originalFile in patchMap) {
    const fileToPatch = path.join(tempDir, originalFile)
    if (!fs.existsSync(fileToPatch)) {
      throw new Error(`❌ Original file not found: ${fileToPatch}`)
    }

    const patchPath = patchMap[originalFile]
    if (!fs.existsSync(patchPath)) {
      throw new Error(`❌ Patch file not found: ${patchPath}`)
    }

    const patchedFile = applyPatch(
      fs.readFileSync(fileToPatch, 'utf8'),
      fs.readFileSync(patchPath, 'utf8')
    )
    if (patchedFile) {
      fs.writeFileSync(fileToPatch, patchedFile, 'utf8')
      console.log(`💾 Patched: ${fileToPatch} with ${patchPath}`)
    } else {
      console.info(`ℹ️  Already patched: ${fileToPatch} with ${patchPath}`)
    }
  }

  run(`${packageManagerPatcher.patchCommit} "${tempDir}"`)

  console.log(`📦 Patched: "${packageName}"`)
}
