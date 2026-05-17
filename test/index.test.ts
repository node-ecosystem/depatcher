import { describe, it } from 'node:test'
import assert from 'node:assert'

import { applyPatch, applyPatchMultiple, createPatch } from '../src/index.ts'

describe('depatcher', () => {
  it('should export createPatch and applyPatch functions', () => {
    assert.strictEqual(typeof applyPatch, 'function')
    assert.strictEqual(typeof applyPatchMultiple, 'function')
    assert.strictEqual(typeof createPatch, 'function')
  })
})
