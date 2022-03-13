export const initEnv = () =>
  Object.assign(globalThis, {
    $,
  })

export interface $ {
  // deno-lint-ignore no-explicit-any
  (pieces: TemplateStringsArray, ...args: any[]): Promise<void>

  verbose: boolean
  shell: string
  prefix: string
  quote: (input: string) => string
  spawn: () => void
}

// @ts-ignore
export const $: $ = async (args) => console.log(args)
