import { execSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { applyPatch } from 'diff'

function run(command: string): string {
  console.log(`> ${command}`)
  return execSync(command, { encoding: 'utf8', stdio: 'pipe' })
}

export default async function applyPatch_(packageName: string, patchMap: Record<string, string>) {
  console.log(`🔄 Start patching "${packageName}"`)
  const patchOutput = run(`yarn patch ${packageName}`)

  const tempDir = patchOutput.split('\n')[1].slice(49)

  for (const [originalFile, patchPath] of Object.entries(patchMap)) {
    const fileToPatch = join(tempDir, originalFile)
    const patchedFile = applyPatch(
      readFileSync(fileToPatch, 'utf8').toString(),
      readFileSync(patchPath, 'utf8').toString()
    )
    if (!patchedFile) {
      throw new Error('❌ Patch failed. No changes were made')
    }
    writeFileSync(fileToPatch, patchedFile, 'utf8')

    console.log(`💾 Patched ${fileToPatch} with ${patchPath}`)
  }

  run(`yarn patch-commit -s ${tempDir}`)

  console.log(`📦 "${packageName}" patched`)
}
