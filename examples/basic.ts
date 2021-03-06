#!/usr/bin/env vl

//
// Copyright 2022 Joona Piirainen
// MIT License
//

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

await $`rm -rf tests`;
