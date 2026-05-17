# depatcher

Programmatically create and apply `.patch` files to your project's dependencies.  
Under the hood, it leverages [`diff`](https://www.npmjs.com/package/diff) to generate diffs and package manager primitives to apply them.

## ⚙️ Installation

Install as a development dependency:

| Package Manager | Command
| - | -
| **npm** | `npm install -D depatcher`
| **yarn** | `yarn add -D depatcher`
| **pnpm** | `pnpm add -D depatcher`

## 📖 Usage

### `createPatch`

Generates a `.patch` file by comparing an original file with a modified (patched) file.

```ts
import { createPatch } from 'depatcher'

createPatch(
  './original_file.js',
  './patched_file.js',
  './file.patch'
)
```

### `applyPatch`

Applies `.patch` files to specific file paths within a target dependency.  

```ts
import { applyPatch } from 'depatcher'

// applyPatch(packageName, patchMap)
await applyPatch('packageName', {
  // 'target_file_in_dependency': 'path_to_patch_file'
  '/dist/index.js': './packageName_index.patch'
})
```

### `applyPatchMultiple`

Applies `.patch` files to multiple target dependencies efficiently.

```ts
import { applyPatchMultiple } from 'depatcher'

// applyPatchMultiple(packagePatchMap)
await applyPatchMultiple({
  packageName1: {
    '/dist/index.js': './packageName1_index.patch'
  },
  packageName2: {
    '/dist/index.js': './packageName2_index.patch'
  }
})
```

## 🔄 TODO

- [ ] `npm` patch support

## 📜 License

This project is licensed under the [MIT License](LICENSE).
