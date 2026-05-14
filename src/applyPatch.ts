import { execSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { applyPatch } from 'diff'

const PACKAGE_MANAGER_MAP = {
  yarn: {
    patch: 'yarn patch',
    patchCommit: 'yarn patch-commit -s'
  },
  pnpm: {
    patch: 'pnpm patch',
    patchCommit: 'pnpm patch-commit'
  }
}

function detectPackageManager() {
  const userAgent = process.env.npm_config_user_agent!
  return userAgent.match(/^[^/]+/)![0]
}

function run(command: string): string {
  console.log(`> ${command}`)
  return execSync(command, { encoding: 'utf8', stdio: 'pipe' })
}

export default async function applyPatch_(packageName: string, patchMap: Record<string, string>) {
  const packageManager = detectPackageManager() as keyof typeof PACKAGE_MANAGER_MAP

  console.log(`🔄 Start patching "${packageName}"`)
  const patchOutput = run(`${PACKAGE_MANAGER_MAP[packageManager].patch} ${packageName}`)

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

  run(`${PACKAGE_MANAGER_MAP[packageManager].patchCommit} "${tempDir}"`)

  console.log(`📦 "${packageName}" patched`)
}
