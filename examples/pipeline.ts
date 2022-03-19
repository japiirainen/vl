#!/usr/bin/env vl

//
// Copyright 2022 Joona Piirainen
// MIT License
//

import "../globals.d.ts";

await Deno.mkdir("tmp");
await Deno.create("tmp/output.txt");

await $`echo "Hello, stdout!"`.pipe(
  fs.createWriteStream("./tmp/output.txt", {}),
);

await $`cat /tmp/output.txt`;

await rmrf("tmp");
