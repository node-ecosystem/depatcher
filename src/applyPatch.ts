import applyPatch_ from './applyPatchCore.ts'
import { getPackageManagerPatcher, run } from './utils.ts'

export default async function applyPatch(packageName: string, patchMap: Record<string, string>) {
  const packageManagerPatcher = getPackageManagerPatcher()

  if ('prePatch' in packageManagerPatcher) {
    run(packageManagerPatcher.prePatch)
  }

  await applyPatch_(packageManagerPatcher, packageName, patchMap)

  if ('postPatch' in packageManagerPatcher) {
    run(packageManagerPatcher.postPatch)
  }
}
