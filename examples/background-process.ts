#!/usr/bin/env vl

// This example is adapted from 'https://github.com/google/zx/blob/main/examples/background-process.mjs'
//
// Copyright 2022 Joona Piirainen
// MIT License
//

// import 'https://deno.land/x/violet@0.0.1/globals.d.ts'
import "../globals.d.ts";

const serve = $`npx serve`;

for await (const chunk of serve.stdout) {
  if (chunk.includes("Accepting connections")) break;
}

await $`curl http://localhost:5000`;

serve.kill("SIGINT");
