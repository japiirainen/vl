#!/usr/bin/env vl

//
// Copyright 2022 Joona Piirainen
// MIT License
//

import "../globals.d.ts";

const name = await ask("What is your name?");

await $`echo Hello, ${name}!`;
