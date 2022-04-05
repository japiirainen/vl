//
// Copyright 2022 Joona Piirainen
// MIT License
//

import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.129.0/testing/asserts.ts";

import "./globals.d.ts";
import "./globals.ts";

Deno.test("[] can be passed to $", async () => {
  const flags = ["--oneline", "--decorate", "--color"];
  const { exitCode } = await $`git log ${flags}`;
  assertEquals(exitCode, 0);
});

Deno.test("Env vars work", async () => {
  Deno.env.set("FOO", "foo");
  const foo = await $`echo $FOO`;
  assertEquals(foo.stdout, "foo\n");
});

Deno.test("Env vars is safe to pass", async () => {
  Deno.env.set("FOO", "hi; exit 1");
  await $`echo $FOO`;
});

Deno.test("echo works", async () => {
  const { stdout } = await $`echo "hello"`;
  assertEquals(stdout, "hello\n");
});

Deno.test("noThrow() does not throw", async () => {
  const { exitCode } = await noThrow($`exit 42`);
  assertEquals(exitCode, 42);
});

Deno.test("Arguments are quoted", async () => {
  const bar = 'bar"";baz!$#^$\'&*~*%)({}||\\/';
  assertEquals((await $`echo ${bar}`).stdout.trim(), bar);
});

Deno.test("undefined and empty string correctly quoted", async () => {
  assertEquals((await $`echo ${undefined}`).stdout.trim(), "undefined");
  assertEquals((await $`echo ${""}`).stdout.trim(), "");
});

Deno.test("Can create a dir with a space in the name", async () => {
  const name = "foo bar";
  try {
    await $`mkdir /tmp/${name}`;
  } finally {
    await Deno.remove("/tmp/" + name);
  }
});

Deno.test(".kill() works", async () => {
  const p = noThrow($`sleep 9999`);
  setTimeout(() => {
    p.kill();
  }, 100);
  await p;
});

Deno.test("exiting non 0 works", async () => {
  try {
    await $`exit 1`;
  } catch (e) {
    assertEquals(e.exitCode, 1);
  }
});

Deno.test("quiet() works", async () => {
  const p = quiet($`echo "hello"`);
  assertEquals(p._quiet, true);
  await p;
});

Deno.test("retry works", async () => {
  let exitCode = 0;
  const now = Date.now();
  try {
    await retry(5, 50)`exit 123`;
  } catch (p) {
    exitCode = p.exitCode;
  }
  assertEquals(exitCode, 123);
  assert(Date.now() >= now + 50 * (5 - 1));
});
