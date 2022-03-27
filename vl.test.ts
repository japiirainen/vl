import {assertEquals} from 'https://deno.land/std@0.129.0/testing/asserts.ts'

import './globals.d.ts'
import './globals.ts'

Deno.test('1 + 1', () => {
  assertEquals(1 + 1, 2)
})

Deno.test('echo works', async () => {
  const {stdout} = await $`echo "hello"`
  assertEquals(stdout, 'hello\n')
})

Deno.test('noThrow() does not throw', async () => {
  const {exitCode} = await noThrow($`exit 42`)
  assertEquals(exitCode, 42)
})
