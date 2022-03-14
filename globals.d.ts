// deno-lint-ignore-file ban-ts-comment
//
// Copyright 2022 Joona Piirainen
// MIT License
//

import { $Internal, cdInternal } from "./index.ts";

declare global {
  //@ts-ignore
  const $: $Internal;
  //@ts-ignore
  const cd: typeof cdInternal;
}
