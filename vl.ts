#!/usr/bin/env deno run --allow-read

//
// Copyright 2022 Joona Piirainen
// MIT License
//

import { process } from "https://deno.land/std@0.129.0/node/process.ts";
import * as path from "https://deno.land/std@0.129.0/path/mod.ts";
import * as fs from "https://deno.land/std@0.129.0/fs/mod.ts";
import * as url from "https://deno.land/std@0.129.0/node/url.ts";
import * as Colors from "https://deno.land/std/fmt/colors.ts";

import "./globals.ts";
import "./globals.d.ts";

const main = async () => {
  try {
    if (["--version", "-v"].includes(Deno.args[0])) {
      printVersionInfo();
      return (process.exitCode = 0);
    }
    const fArg = Deno.args.find((a) => !a.startsWith("--"));
    // no <script> argument provided
    if (fArg === "-" || fArg == null) {
      printUsage();
      return (process.exitCode = 2);
    }
    await runScript(fArg);
  } catch (e) {
    console.error(e);
  }
};

const writeAndImport = async (
  source: string,
  filePath: string,
  origin = filePath,
) => {
  await Deno.writeTextFile(filePath, source);
  const wait = runScript(filePath, origin);
  await Deno.remove(filePath);
  await wait;
};

const runScript = async (filePath: string, origin = filePath) => {
  const ext = path.extname(filePath);
  if (ext == "") {
    const tempFileName = fs.existsSync(filePath)
      ? `${path.basename(filePath)}-${Math.random().toString(36).substr(2)}.mjs`
      : `${path.basename(filePath)}.mjs`;
    return await writeAndImport(
      await Deno.readTextFile(filePath),
      path.join(path.dirname(filePath), tempFileName),
      origin,
    );
  }
  const __fileName = path.resolve(origin);
  const __dirName = path.dirname(__fileName);
  Object.assign(globalThis, { __fileName, __dirName });
  await import(url.pathToFileURL(filePath).toString());
};

const printVersionInfo = () =>
  console.log(`
  Version info:
    Violet version:     1.0
    Deno version:       ${Deno.version.deno}
    V8 version:         ${Deno.version.v8}
    TypeScript version: ${Deno.version.typescript}
    `);

const printUsage = () =>
  console.log(`
  ${Colors.bgBrightMagenta(Colors.black(" Violet "))}

  Usage:
    vl [options] <script>

  Options:
    --quiet            : don't echo commands
    --shell=<path>     : custom shell binary
    --prefix=<command> : prefix all commands
    --version, -v      : print version info
  `);

await main();
