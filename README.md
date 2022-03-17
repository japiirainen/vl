# vl

Shell scripting with TypeScript. Runs on top of (Deno)[https://deno.land].

```ts
#!/usr/bin/env vl

import "../globals.d.ts";

await Promise.all([
  $`sleep 1; echo 1`,
  $`sleep 2; echo ${2}`,
  $`sleep 3; echo 3`,
]);

await fetch("https://google.com");

await $`mkdir tests`;
await $`touch tests/test.txt`;
await $`rm -rf tests`;
```

### Prerequisites

- deno

### Install

```sh
deno install --allow-read --allow-net --allow-run -f https://deno.land/x/violet@<version_number>/vl.ts
```
