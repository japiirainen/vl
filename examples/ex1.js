#!/usr/bin/env vl

await Promise.all([$`sleep 1; echo 1`, $`sleep 2; echo 2`, $`sleep 3; echo 3`])

await fetch('https://google.com')

const name = 'foo bar'
await $`mkdir /tmp/${name}`
