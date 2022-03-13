#!/usr/bin/env vl

import '../globals.d.ts'

await Promise.all([$`sleep 1; echo 1`, $`sleep 2; echo 2`, $`sleep 3; echo 3`])

const fname = 'foo bar'
await $`mkdir /tmp/${fname}`
