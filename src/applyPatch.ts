import applyPatchCore from './applyPatchCore.ts'
import { withPatchLifecycle } from './utils.ts'

export default async function applyPatch(packageName: string, patchMap: Record<string, string>) {
  await withPatchLifecycle(async (packageManagerPatcher) => {
    await applyPatchCore(packageManagerPatcher, packageName, patchMap)
  })
}
