import { execSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { applyPatch } from 'diff'

const PACKAGE_MANAGER_MAP = {
  yarn: {
    patch: 'yarn patch',
    patchCommit: 'yarn patch-commit -s',
    tempDir: (tempDir: string) => tempDir.split('\n')[1].slice(49)
  },
  pnpm: {
    prePatch: `node -e "fs.rmSync('node_modules/.pnpm_patches',{recursive:true,force:true})"`,
    patch: 'pnpm patch',
    patchCommit: 'pnpm patch-commit',
    tempDir: (tempDir: string) => tempDir.split('\n')[2].trim()
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
  const pacakgeManagerPatcher = PACKAGE_MANAGER_MAP[packageManager]

  console.log(`🔄 Start patching "${packageName}"`)

  if ('prePatch' in pacakgeManagerPatcher) {
    run(pacakgeManagerPatcher.prePatch)
  }

  const patchOutput = run(`${pacakgeManagerPatcher.patch} ${packageName}`)

  const tempDir = pacakgeManagerPatcher.tempDir(patchOutput)

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

  run(`${pacakgeManagerPatcher.patchCommit} "${tempDir}"`)

  console.log(`📦 "${packageName}" patched`)
}
