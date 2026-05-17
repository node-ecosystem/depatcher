# depatcher

Dependencies patcher ~ programmatically apply `.patch` files to your dependencies.
Under the hood, it uses [diff](https://www.npmjs.com/package/diff).

## ⚙️ Installation

Install as development dependency:

| Package Manager | Command
| - | -
| **npm** | `npm install -D depatcher`
| **yarn** | `yarn add -D depatcher`
| **pnpm** | `pnpm add -D depatcher`

## 📖 Usage

### `applyPatch`

Apply `.patch` files to specific files within a target dependency.

```ts
import { applyPatch } from 'depatcher'

// applyPatch(packageName, patchMap)
await applyPatch('packageName', {
  // 'target_file_in_dependency': 'path_to_patch_file'
  '/dist/index.js': './packageName_index.patch'
})
```

### `createPatch`

Create a `.patch` file using the diff of an original file and a patched file.

```ts
import { createPatch } from 'depatcher'

createPatch(
  './original_file.js',
  './patched_file.js',
  './file.patch'
)
```

## 🔄 TODO

- `npm` patch support

## 📜 License

This project is licensed under the [MIT License](LICENSE).
