//
// Copyright 2022 Joona Piirainen
// MIT License
//

import {
  $Internal,
  askInternal,
  cdInternal,
  ColorsInternal,
  fsInternal,
  noThrowInternal,
  osInternal,
  rmrfInternal,
} from "./index.ts";

declare global {
  const $: $Internal;
  const cd: typeof cdInternal;
  const ask: typeof askInternal;
  const fs: typeof fsInternal;
  const os: typeof osInternal;
  const rmrf: typeof rmrfInternal;
  const noThrow: typeof noThrowInternal;
  const Colors: typeof ColorsInternal;
}
