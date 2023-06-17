//
// Copyright 2022 Joona Piirainen
// MIT License
//

//
// standard library
//
export * as Colors from "https://deno.land/std@0.192.0/fmt/colors.ts";
export * as path from "https://deno.land/std@0.192.0/path/mod.ts";
export { readLines } from "https://deno.land/std@0.192.0/io/read_lines.ts";
export { parse } from "https://deno.land/std@0.192.0/flags/mod.ts";

//
// deno/node
//
export { process } from "https://deno.land/std@0.177.0/node/process.ts";
export * as os from "https://deno.land/std@0.177.0/node/os.ts";
export * as fs from "https://deno.land/std@0.177.0/fs/mod.ts";
export * as url from "https://deno.land/std@0.177.0/node/url.ts";
export * as nodeFs from "https://deno.land/std@0.177.0/node/fs.ts";
export * as RL from "https://deno.land/std@0.177.0/node/readline.ts";
export { inspect } from "https://deno.land/std@0.177.0/node/util.ts";
export * as child_process from "https://deno.land/std@0.177.0/node/child_process.ts";
export { ChildProcess } from "https://deno.land/std@0.177.0/node/internal/child_process.ts";
export {
  Readable,
  Writable,
} from "https://deno.land/std@0.177.0/node/stream.ts";

//
// external packages
//
export * as input from "https://deno.land/x/input@2.0.3/index.ts";

//
// internal
//
export { psTree } from "./proc.ts";
