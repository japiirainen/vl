# vl

Shell scripting with TypeScript. Runs on top of [Deno](https://deno.land).

`vl` started as a port of [`zx`](https://github.com/google/zx) to deno. The main
motivation for this package was the lack of typescript support in `zx`. That's
where I got the idea to use `deno`, since it supports TypeScript natively.

Bash is great, but when it comes to writing scripts, it has it's limitations and
people tend to go for more expressive programming languages.
JavaScript/TypeScript is a great choice, since they are approachable by a huge
number of developers. The `vl` package provides provides wrappers around
`child_process`, and a number of other things for all your shell scripting
needs. Since `vl` uses `deno`, it has access to both the rich standard library
of [deno](https://github.com/denoland/deno_std), and the battle tested standard
libraries of [node](https://nodejs.dev) through it's
[node compatibility](https://github.com/denoland/deno_std/tree/main/node).

```ts
#!/usr/bin/env vl

import "../globals.d.ts";

const { create, mkdir } = Deno;

await Promise.all([
  $`sleep 1; echo 1`,
  $`sleep 2; echo ${2}`,
  $`sleep 3; echo 3`,
]);

await fetch("https://google.com");

await mkdir("tests");
await create("tests/test.txt");

cd("tests");
await $`ls`;
cd("..");

// clean up
await $`rm -rf tests`;
```

### Pipelines

```ts
await $`echo "Hello, stdout!"`
  .pipe(fs.createWriteStream("/tmp/output.txt", {}));

await $`cat /tmp/output.txt`;
```

### Install

#### Prerequisites

- deno

```sh
deno install --allow-all -f https://deno.land/x/violet@<version_number>/vl.ts
```
