# vl (violet)

![deno CI](https://github.com/japiirainen/vl/actions/workflows/deno.yml/badge.svg)

Shell scripting with TypeScript. Runs on top of [Deno](https://deno.land).

`vl` started as a port of [`zx`](https://github.com/google/zx) to deno. The main
motivation for this tool was the lack of native typescript support in `zx`.
That's where I got the idea to use `deno` as the runtime, since it supports
TypeScript natively.

## Table of contents

- [vl (violet)](#vl-violet)
  - [Table of contents](#table-of-contents)
  - [Motivation](#motivation)
    - [Example Program](#example-program)
  - [Usage](#usage)
    - [`$command`](#command)
    - [Pipelines](#pipelines)
    - [Environment variables](#environment-variables)
    - [Functions](#functions)
    - [Configuration](#configuration)
  - [Install](#install)
    - [Prerequisites](#prerequisites)
  - [Credits](#credits)

## Motivation

Bash is great, but when it comes to writing scripts, it has it's limitations and
people tend to go for more expressive programming languages.
JavaScript/TypeScript is a great choice, since they are approachable by a huge
number of developers. The `vl` package provides provides wrappers around
`child_process`, and a number of other things for all your shell scripting
needs. Since `vl` uses `deno`, it has access to both the rich standard library
of [deno](https://github.com/denoland/deno_std), and the battle tested standard
libraries of [node](https://nodejs.dev) through it's
[node compatibility](https://github.com/denoland/deno_std/tree/main/node).

### Example Program

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

## Usage

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

await $`echo "Hello, stdout!"`.pipe(
  fs.createWriteStream("/tmp/output.txt", {}),
);

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

`choose` prompts the user to choose from the provided options.

```ts
const resp = await choose("Would you like a foo or a bar?", ["foo", "bar"]);
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

usage:

```ts
await quiet($`echo foobar`); // command and output will not be displayed.
```

`os` package.

usage:

```ts
await $`echo ${os.homedir()}`;
```

`retry()`

Retries a command as many times as specified. Returns the first successful
attempt, or will throw after specified attempts count.

usage:

```ts
await retry(5)`curl localhost`;

// or with a specified delay (500ms)
await retry(5, 500)`curl localhost`;
```

`startSpinner()`

Displays a spinner as an loading indicator. Useful with long running processes.

usage:

```ts
const { stopSpinner } = startSpinner();
await sleep(5000);
stopSpinner();
```

### Configuration

`$.shell`

Which shell is used. Default is bash.

```ts
$.shell = "/usr/bin/zsh";
```

CLI argument `--shell=/usr/bin/zsh` can be used to achieve the same result.

`$.verbose` can be used to specify verbosity.

Default is `true`.

CLI argument `--quiet` sets verbosity to `false`.

## Install

### Prerequisites

You need to have `deno` installed. You can find installation instructions at
[deno.land](https://deno.land/).

```sh
deno install --allow-all -f https://deno.land/x/violet@<version_number>/vl.ts
```

### Execution

There are two modes of execution, either using the shebang of `#!/usr/bin/env vl` or using a verbose deno command.

#### Shebang Mode

```ts
#!/usr/bin/env vl

import "https://deno.land/x/violet/globals.d.ts";

await $`echo 1`
```

#### Deno basic mode

```ts
#!/usr/bin/env -S deno run --allow-all

import "https://deno.land/x/violet/globals.d.ts";
// Import the global functions into namespace, required in this method
import "https://deno.land/x/violet@0.1.0/globals.ts";

await $`echo 1`
```


## Credits

The project wouldn't have been possible without these resources, so I'm forever
grateful for the existence of these!

- [zx](https://github.com/google/zx)
