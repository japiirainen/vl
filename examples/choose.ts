#!/usr/bin/env vl

//
// Copyright 2022 Joona Piirainen
// MIT License
//

import "../globals.d.ts";

const age = await choose(
  "How old are you?",
  Array.from({ length: 120 }).map((_, i) => `${i}`),
);

await $`echo You are ${age} years old!`;
