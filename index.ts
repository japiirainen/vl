//
// Copyright 2022 Joona Piirainen
// MIT License
//

import * as fs from 'https://deno.land/std@0.129.0/node/fs.ts'
import {process} from 'https://deno.land/std@0.129.0/node/process.ts'
import {readLines} from 'https://deno.land/std@0.129.0/io/buffer.ts'
import * as child_process from 'https://deno.land/std@0.129.0/node/child_process.ts'
import {ChildProcess} from 'https://deno.land/std@0.129.0/node/internal/child_process.ts'
import * as Colors from 'https://deno.land/std@0.129.0/fmt/colors.ts'
import {parse} from 'https://deno.land/std@0.119.0/flags/mod.ts'
import * as dp from 'https://deno.land/x/process@v0.3.0/mod.ts'
import {Readable, Writable} from 'https://deno.land/std@0.129.0/node/stream.ts'

export const fsInternal = fs

export const initEnv = () =>
  Object.assign(globalThis, {
    $: $Internal,
    cd: cdInternal,
    ask: askInternal,
    fs: fsInternal,
    rmrf: rmrfInternal,
    noThrow: noThrowInternal,
  })

export interface $Internal {
  // deno-lint-ignore no-explicit-any
  (pieces: TemplateStringsArray, ...args: any[]): VlPromise<ProcessOutput>

  verbose: boolean
  shell: string
  prefix: string
  quote: (input: string) => string
  spawn: typeof child_process.spawn
}

export class VlPromise<P extends ProcessOutput> extends Promise<P> {
  child?: ChildProcess = undefined
  _noThrow = false
  _quiet = false
  _resolved = false
  _inheritStdin = true
  _piped = false
  _run?: () => void = undefined
  _preRun?: () => void = undefined
  _postRun?: () => void = undefined

  constructor(
    executor: (
      resolve: (value: P | PromiseLike<P>) => void,
      reject: (reason?: P) => void
    ) => void
  ) {
    super(executor)
  }

  get stdin() {
    this._inheritStdin = false
    if (this._run) this._run()
    return this.child!.stdin as Writable
  }

  get stdout() {
    this._inheritStdin = false
    if (this._run) this._run()
    return this.child!.stdout as Readable
  }

  get stderr() {
    this._inheritStdin = false
    if (this._run) this._run()
    return this.child!.stderr as Readable
  }

  get exitCode() {
    return this.then((p) => p.exitCode).catch((p) => p.exitCode)
  }

  // deno-lint-ignore no-explicit-any
  then(onfulfilled?: (value: P) => any, onrejected?: (value: P) => any) {
    if (this._run) this._run()
    return super.then(onfulfilled, onrejected)
  }

  pipe(dest: VlPromise<ProcessOutput> | Writable): VlPromise<ProcessOutput> {
    if (typeof dest === 'string') {
      throw new Error('The pipe() method does not take strings. Forgot $?')
    }
    if (this._resolved === true) {
      throw new Error(
        "The pipe() method shouldn't be called after promise is already resolved!"
      )
    }
    this._piped = true
    if (
      dest instanceof VlPromise &&
      dest.child != null &&
      dest.child.stdin != null
    ) {
      dest._inheritStdin = false
      dest._preRun = this._run
      const p = dest.child.stdin
      dest._postRun = () => this.stdout.pipe(p)
      return dest
    } else {
      this._postRun = () => this.stdout.pipe(dest as Writable)
      return this
    }
  }
}

export class ProcessOutput extends Error {
  #code: number | null = null
  #signal = null
  #stdout = ''
  #stderr = ''
  #combined = ''

  constructor({
    code,
    stdout,
    stderr,
    combined,
    message,
  }: {
    code: number | null
    signal: Deno.Signal | null
    stdout: string
    stderr: string
    combined: string
    message: string
  }) {
    super(message)
    this.#code = code
    this.#stdout = stdout
    this.#stderr = stderr
    this.#combined = combined
  }

  toString() {
    return this.#combined
  }

  get stdout() {
    return this.#stdout
  }

  get stderr() {
    return this.#stderr
  }

  get exitCode() {
    return this.#code
  }

  get signal() {
    return this.#signal
  }
}

export const $Internal: $Internal = (pieces, ...args) => {
  const {verbose, shell, prefix, spawn} = $Internal

  const cmd = args
    .map((p) =>
      Array.isArray(p)
        ? // deno-lint-ignore no-explicit-any
          p.map((a: any) => $Internal.quote(substitute(a))).join(' ')
        : $Internal.quote(substitute(p))
    )
    .reduce((acc, x) => `${acc}${x}`, pieces[0])

  // deno-lint-ignore no-explicit-any
  let resolve: any, reject: any
  const promise = new VlPromise((...args) => ([resolve, reject] = args))

  promise._run = () => {
    // _run called from two places: then() and setTimeout()
    if (promise.child) return
    if (promise._preRun) promise._preRun()
    if (verbose && !promise._quiet) {
      printCommand(cmd)
    }

    const child = spawn(prefix + cmd, {
      cwd: process.cwd(),
      shell: typeof shell === 'string' ? shell : true,
      stdio: [promise._inheritStdin ? 'inherit' : 'pipe', 'pipe', 'pipe'],
      windowsHide: true,
    })

    child.on('close', (code, signal) => {
      const __from = new Error().stack?.split(/^\s*at\s/m)[2].trim()
      let message = `${stderr || '\n'}    at ${__from}`
      message += `\n    exit code: ${code}${
        exitCodeInfo(code) ? ' (' + exitCodeInfo(code) + ')' : ''
      }`
      if (signal !== null) {
        message += `\n    signal: ${signal}`
      }
      const output = new ProcessOutput({
        code,
        signal,
        stdout,
        stderr,
        combined,
        message,
      })
      ;(code === 0 || promise._noThrow ? resolve : reject)(output)
      promise._resolved = true
    })

    let stdout = '',
      stderr = '',
      combined = ''
    // deno-lint-ignore no-explicit-any
    const onStdout = (data: any) => {
      if (verbose && !promise._quiet) process.stdout.write(data)
      stdout += data
      combined += data
    }
    // deno-lint-ignore no-explicit-any
    const onStderr = (data: any) => {
      if (verbose && !promise._quiet) process.stderr.write(data)
      stderr += data
      combined += data
    }
    if (!promise._piped) child.stdout?.on('data', onStdout) // If process is piped, don't collect or print output.
    child.stderr?.on('data', onStderr) // Stderr should be printed regardless of piping.
    promise.child = child
    if (promise._postRun) promise._postRun() // In case $1.pipe($2), after both subprocesses are running, we can pipe $1.stdout to $2.stdin.
  }

  // Make sure all sub-processes are started, if not explicitly by await or then().
  setTimeout(promise._run, 0)
  return promise
}

const flags = parse(Deno.args, {
  boolean: ['quiet'],
  string: ['shell', 'prefix'],
  default: {quiet: false, shell: 'bash', prefix: 'set -euo pipefail;'},
})

$Internal.verbose = !flags['quiet']
$Internal.shell = flags['shell']
$Internal.prefix = flags['prefix']
$Internal.spawn = child_process.spawn

const substitute = <T>(arg: T) => `${arg}`

const quote = (arg: string) => {
  if (/^[a-z0-9/_.-]+$/i.test(arg) || arg === '') return arg
  return (
    `$'` +
    arg
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/\f/g, '\\f')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t')
      .replace(/\v/g, '\\v')
      .replace(/\0/g, '\\0') +
    `'`
  )
}

$Internal.quote = quote

const exitCodeInfo = (exitCode: number) =>
  ({
    2: 'Misuse of shell builtins',
    126: 'Invoked command cannot execute',
    127: 'Command not found',
    128: 'Invalid exit argument',
    129: 'Hangup',
    130: 'Interrupt',
    131: 'Quit and dump core',
    132: 'Illegal instruction',
    133: 'Trace/breakpoint trap',
    134: 'Process aborted',
    135: 'Bus error: "access to undefined portion of memory object"',
    136: 'Floating point exception: "erroneous arithmetic operation"',
    137: 'Kill (terminate immediately)',
    138: 'User-defined 1',
    139: 'Segmentation violation',
    140: 'User-defined 2',
    141: 'Write to pipe with no one reading',
    142: 'Signal raised by alarm',
    143: 'Termination (request to terminate)',
    145: 'Child process terminated, stopped (or continued*)',
    146: 'Continue if stopped',
    147: 'Stop executing temporarily',
    148: 'Terminal stop signal',
    149: 'Background process attempting to read from tty ("in")',
    150: 'Background process attempting to write to tty ("out")',
    151: 'Urgent data available on socket',
    152: 'CPU time limit exceeded',
    153: 'File size limit exceeded',
    154: 'Signal raised by timer counting virtual time: "virtual timer expired"',
    155: 'Profiling timer expired',
    157: 'Pollable event',
    159: 'Bad syscall',
  }[exitCode])

const printCommand = (cmd: string) =>
  /\n/.test(cmd)
    ? console.log(
        cmd
          .split('/n')
          .map((line, i) => (i === 0 ? '$' : '>' + ' ' + colorize(line)))
          .join('\n')
      )
    : console.log('$', colorize(cmd))

const colorize = (cmd: string) =>
  cmd.replace(/^[\w_.-]+(\s|$)/, Colors.brightGreen)

// utilities

export const cdInternal = (path: string) => {
  if ($Internal.verbose) console.log('$', colorize(`cd ${path}`))
  Deno.chdir(path)
}

export const askInternal = async (question: string) => {
  console.log(question)
  for await (const line of readLines(Deno.stdin)) {
    return line
  }
  return ''
}

export const rmrfInternal = async (path: string) =>
  await Deno.remove(path, {recursive: true})

export const noThrowInternal = (p: VlPromise<ProcessOutput>) => {
  p._noThrow = true
  return p
}
