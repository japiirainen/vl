//
// Copyright 2022 Joona Piirainen
// MIT License
//

import { $Internal, askInternal, cdInternal } from "./index.ts";

declare global {
  const $: $Internal;
  const cd: typeof cdInternal;
  const ask: typeof askInternal;
}
