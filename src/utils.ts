import child_process from 'node:child_process'

const PACKAGE_MANAGER_MAP = {
  yarn: {
    patch: 'yarn patch',
    patchCommit: 'yarn patch-commit -s',
    postPatch: 'yarn',
    getTempDir: (tempDir: string) => tempDir.split('\n')[1].slice(49)
  },
  pnpm: {
    prePatch: `node -e "fs.rmSync('node_modules/.pnpm_patches',{recursive:true,force:true})"`,
    patch: 'pnpm patch',
    patchCommit: 'pnpm patch-commit',
    getTempDir: (tempDir: string) => tempDir.split('\n')[2].trim()
  }
}

export const detectPackageManager = () => {
  const userAgent = process.env.npm_config_user_agent!
  return userAgent.match(/^[^/]+/)![0]
}

export const run = (command: string): string => {
  console.log(`> ${command}`)
  return child_process.execSync(command, { encoding: 'utf8', stdio: 'pipe' })
}

export const getPackageManagerPatcher = () => {
  return PACKAGE_MANAGER_MAP[detectPackageManager() as keyof typeof PACKAGE_MANAGER_MAP]
}

export const withPatchLifecycle = async (action: (packageManagerPatcher: ReturnType<typeof getPackageManagerPatcher>) => Promise<void>) => {
  const packageManagerPatcher = getPackageManagerPatcher()

  if ('prePatch' in packageManagerPatcher) {
    run(packageManagerPatcher.prePatch)
  }

  await action(packageManagerPatcher)

  if ('postPatch' in packageManagerPatcher) {
    run(packageManagerPatcher.postPatch)
  }
}
