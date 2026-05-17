import { describe, it, mock, afterEach } from 'node:test'
import { ok, strictEqual } from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import child_process from 'node:child_process'

import { applyPatch, createPatch } from '../src/index.ts'
import { detectPackageManager, getPackageManagerPatcher } from '../src/utils.ts'

describe('utils', () => {
  let initialUserAgent: string | undefined

  afterEach(() => {
    mock.restoreAll()
    if (initialUserAgent !== undefined) {
      process.env.npm_config_user_agent = initialUserAgent
    }
  })

  it('detectPackageManager should return yarn when user agent is yarn', () => {
    initialUserAgent = process.env.npm_config_user_agent
    process.env.npm_config_user_agent = 'yarn/1.22.21 npm/? node/v20.10.0 win32 x64'
    strictEqual(detectPackageManager(), 'yarn')
  })

  it('detectPackageManager should return pnpm when user agent is pnpm', () => {
    initialUserAgent = process.env.npm_config_user_agent
    process.env.npm_config_user_agent = 'pnpm/8.15.5 npm/? node/v20.10.0 win32 x64'
    strictEqual(detectPackageManager(), 'pnpm')
  })

  it('getPackageManagerPatcher should return correct patcher for yarn', () => {
    initialUserAgent = process.env.npm_config_user_agent
    process.env.npm_config_user_agent = 'yarn/4.14.1'
    const patcher = getPackageManagerPatcher()
    strictEqual(patcher.patch, 'yarn patch')
    strictEqual(patcher.patchCommit, 'yarn patch-commit -s')
  })
})

describe('createPatch', () => {
  it('should create a valid diff patch file', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'depatcher-test-'))
    const originalFile = path.join(tempDir, 'original.js')
    const patchedFile = path.join(tempDir, 'patched.js')
    const patchFile = path.join(tempDir, 'out.patch')

    fs.writeFileSync(originalFile, "console.log('hello world')\n", 'utf8')
    fs.writeFileSync(patchedFile, "console.log('hello world patching!')\n", 'utf8')

    createPatch(originalFile, patchedFile, patchFile)

    const patchContent = fs.readFileSync(patchFile, 'utf8')
    ok(patchContent.startsWith('@@'), 'Patch should have header removed and start with @@')
    ok(patchContent.includes("-console.log('hello world')"), 'Should contain removed line')
    ok(patchContent.includes("+console.log('hello world patching!')"), 'Should contain added line')
  })
})

describe('applyPatchCore (via applyPatch / applyPatchMultiple)', () => {
  let initialUserAgent: string | undefined

  afterEach(() => {
    mock.restoreAll()
    if (initialUserAgent !== undefined) {
      process.env.npm_config_user_agent = initialUserAgent
    }
  })

  it('applyPatch should run correct package manager commands and patch the file (yarn)', async () => {
    initialUserAgent = process.env.npm_config_user_agent
    process.env.npm_config_user_agent = 'yarn/4.14.1'

    // Mock execSync to simulate yarn commands
    const execSyncMock = mock.method(child_process, 'execSync', (command: string | Buffer) => {
      command = command.toString()
      if (command.includes('yarn patch-commit')) return ''
      if (command.includes('yarn patch ')) {
        // yarn output simulation matching exactly 49 chars prefix on line 1
        return `Step 1\n➤ YN0000: You can now edit the following folder: /fake/temp/dir\nStep 3`
      }
      return ''
    })

    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'depatcher-apply-'))
    const fileToPatchPath = path.join(tempDir, 'test-lib.js')
    const patchPath = path.join(tempDir, 'test.patch')

    fs.writeFileSync(fileToPatchPath, "const a = 1;\n", 'utf8')
    fs.writeFileSync(patchPath, "@@ -1 +1 @@\n-const a = 1;\n+const a = 2;\n", 'utf8')

    // Since our execSyncMock returns '/fake/temp/dir', we must mock fs to redirect there to tempDir
    const originalExistsSync = fs.existsSync
    const originalReadFileSync = fs.readFileSync
    const originalWriteFileSync = fs.writeFileSync

    mock.method(fs, 'existsSync', (p: fs.PathLike) => {
      const pStr = p.toString().replace(/\\/g, '/')
      if (pStr.includes('/fake/temp/dir')) return true
      return originalExistsSync(p)
    })

    mock.method(fs, 'readFileSync', (p: fs.PathOrFileDescriptor, options?: any) => {
      const pStr = p.toString().replace(/\\/g, '/')
      if (pStr.includes('/fake/temp/dir/test-lib.js')) return originalReadFileSync(fileToPatchPath, options)
      if (pStr.includes('/fake/temp/dir')) return originalReadFileSync(pStr.replace('/fake/temp/dir', tempDir.replace(/\\/g, '/')), options)
      return originalReadFileSync(p, options)
    })

    mock.method(fs, 'writeFileSync', (p: fs.PathOrFileDescriptor, data: any, options: any) => {
      const pStr = p.toString().replace(/\\/g, '/')
      if (pStr.includes('/fake/temp/dir/test-lib.js')) return originalWriteFileSync(fileToPatchPath, data, options)
      return originalWriteFileSync(p, data, options)
    })

    // Execute
    await applyPatch('test-package', {
      'test-lib.js': patchPath
    })

    // Assert
    strictEqual(execSyncMock.mock.calls.length, 3, 'Should call execSync 3 times (patch, patchCommit, postPatch)')

    const patchCallArgs = execSyncMock.mock.calls[0].arguments[0]
    ok(patchCallArgs.toString().includes('yarn patch test-package'), 'Should call yarn patch')

    const patchCommitCallArgs = execSyncMock.mock.calls[1].arguments[0]
    ok(patchCommitCallArgs.toString().includes('yarn patch-commit -s "/fake/temp/dir"'), 'Should call yarn patch-commit')

    const patchedContent = originalReadFileSync(fileToPatchPath, 'utf8')
    strictEqual(patchedContent.trim(), 'const a = 2;', 'File should have been patched correctly')
  })
})

