import { getPackageManagerPatcher, run } from './utils.ts'
import applyPatch_ from './applyPatchCore.ts'

export default async function applyPatchMultiple(packagePatchMap: { [packageName: string]: Record<string, string> }) {
  const pacakgeManagerPatcher = getPackageManagerPatcher()

  if ('prePatch' in pacakgeManagerPatcher) {
    run(pacakgeManagerPatcher.prePatch)
  }

  const applyPatches = []
  for (const packageName in packagePatchMap) {
    applyPatches.push(applyPatch_(pacakgeManagerPatcher, packageName, packagePatchMap[packageName]))
  }

  await Promise.all(applyPatches)

  if ('postPatch' in pacakgeManagerPatcher) {
    run(pacakgeManagerPatcher.postPatch)
  }
}
