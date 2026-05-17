import { getPackageManagerPatcher, run } from './utils.ts'
import applyPatch_ from './applyPatchCore.ts'

export default async function applyPatchMultiple(packagePatchMap: { [packageName: string]: Record<string, string> }) {
  const pacakgeManagerPatcher = getPackageManagerPatcher()

  if ('prePatch' in pacakgeManagerPatcher) {
    run(pacakgeManagerPatcher.prePatch)
  }

  for (const packageName in packagePatchMap) {
    await applyPatch_(pacakgeManagerPatcher, packageName, packagePatchMap[packageName])
  }

  if ('postPatch' in pacakgeManagerPatcher) {
    run(pacakgeManagerPatcher.postPatch)
  }
}
