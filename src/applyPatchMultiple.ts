import applyPatch_ from './applyPatchCore.ts'
import { getPackageManagerPatcher, run } from './utils.ts'

export default async function applyPatchMultiple(packagePatchMap: { [packageName: string]: Record<string, string> }) {
  const packageManagerPatcher = getPackageManagerPatcher()

  if ('prePatch' in packageManagerPatcher) {
    run(packageManagerPatcher.prePatch)
  }

  const applyPatches = Object.keys(packagePatchMap).map((packageName) =>
    applyPatch_(packageManagerPatcher, packageName, packagePatchMap[packageName])
  )

  await Promise.all(applyPatches)

  if ('postPatch' in packageManagerPatcher) {
    run(packageManagerPatcher.postPatch)
  }
}
