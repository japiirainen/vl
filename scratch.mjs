#!/usr/bin/env vl

const token = await ask("Do you have GitHub token in env? ");
const fooOrBar = await choose("foo or bar? ", ["foo", "bar"]);
console.log(fooOrBar, token);
