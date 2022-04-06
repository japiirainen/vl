//
// Copyright 2022 Joona Piirainen
// MIT License
//

import {
  $Internal,
  askInternal,
  cdInternal,
  chooseInternal,
  ColorsInternal,
  fsInternal,
  noThrowInternal,
  osInternal,
  ProcessOutput as ProcessOutputInternal,
  quietInternal,
  retryInternal,
  rmrfInternal,
  sleepInternal,
  startSpinnerInternal,
} from "./index.ts";

declare global {
  const ProcessOutput: ProcessOutputInternal;
  const $: $Internal;
  const cd: typeof cdInternal;
  const ask: typeof askInternal;
  const choose: typeof chooseInternal;
  const fs: typeof fsInternal;
  const os: typeof osInternal;
  const rmrf: typeof rmrfInternal;
  const noThrow: typeof noThrowInternal;
  const Colors: typeof ColorsInternal;
  const sleep: typeof sleepInternal;
  const quiet: typeof quietInternal;
  const retry: typeof retryInternal;
  const startSpinner: typeof startSpinnerInternal;
}
