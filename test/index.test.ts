import { describe, it } from 'node:test'
import assert from 'node:assert'

import { createPatch, applyPatch } from '../src/index.ts'

describe('depatcher', () => {
  it('should export createPatch and applyPatch functions', () => {
    assert.strictEqual(typeof createPatch, 'function')
    assert.strictEqual(typeof applyPatch, 'function')
  })
})
