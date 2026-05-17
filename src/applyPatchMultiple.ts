import applyPatch_ from './applyPatchCore.ts'
import { withPatchLifecycle } from './utils.ts'

export default async function applyPatchMultiple(packagePatchMap: { [packageName: string]: Record<string, string> }) {
  await withPatchLifecycle(async (packageManagerPatcher) => {
    await Promise.all(
      Object.keys(packagePatchMap).map((packageName) =>
        applyPatch_(packageManagerPatcher, packageName, packagePatchMap[packageName])
      )
    )
  })
}
