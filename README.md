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

import "https://deno.land/x/violet/globals.d.ts";

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

### `$command`

Executes the given command by spawning a subprocess. Everything passed through
`${}` will be automatically quoted.

```ts
const fileName = "awesome";
await $`touch ${awesome}.txt`;
```

You can also pass an array of arguments.

```ts
const flags = ["--oneline", "--decorate", "--color"];
const { exitCode } = await $`git log ${flags}`;
```

### Pipelines

```ts
#!/usr/bin/env vl

import "https://deno.land/x/violet/globals.d.ts";

await $`echo "Hello, stdout!"`
  .pipe(fs.createWriteStream("/tmp/output.txt", {}));

await $`cat /tmp/output.txt`;
```

### Environment variables

```ts
#!/usr/bin/env vl

import "https://deno.land/x/violet/globals.d.ts";

Deno.env.set("FOO", "bar");

await $`echo $FOO > tmp.txt`;
await $`cat tmp.txt`;
```

### Functions

`fetch` works, since it's natively supported in deno.

```ts
const resp = await fetch("https://wttr.in");
console.log(await resp.text());
```

`ask` reads a line from stdin.

```ts
const resp = await ask("What is your name?");
console.log(resp);
```

`sleep` sleeps for specified ms.

```ts
await sleep(2000);
```

`noThrow()` Changes the behaviour of `$` to not throw an exception on non-zero
exit codes. You can still access the `exitCode` from the response.

```ts
const { exitCode } = await noThrow($`exit 1`);
console.log(exitCode);
```

`quiet()` Changes the behaviour of `$` to disable verbose output.

```ts
await quiet($`echo foobar`); // command and output will not be displayed.
```

### Install

#### Prerequisites

- deno

```sh
deno install --allow-all -f https://deno.land/x/violet@<version_number>/vl.ts
```
