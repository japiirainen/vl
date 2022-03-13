import * as p from 'https://deno.land/std@0.129.0/node/process.ts'
import * as Colors from 'https://deno.land/std/fmt/colors.ts'

const main = async () => {
  try {
    if (Deno.args[0] === '--version') {
      printVersionInfo()
      return (p.process.exitCode = 0)
    }
    const fArg = Deno.args.find((a) => !a.startsWith('--'))
    const file = await Deno.readTextFile('test.ts')
    console.log(file)
    if (fArg === '-' || fArg == null) {
      printUsage()
      return (p.process.exitCode = 2)
    }
  } catch (e) {
    console.error(e)
  }
}

const printVersionInfo = () =>
  console.log(`
  Version info:
    Violet version:     1.0
    Deno version:       ${Deno.version.deno}
    V8 version:         ${Deno.version.v8}
    TypeScript version: ${Deno.version.typescript}`)

const printUsage = () =>
  console.log(`
  ${Colors.bgBrightMagenta(Colors.black(' Violet '))}

  Usage:
    vl [options] <script>

  Options:
    --quiet         : don't echo commands
  `)

await main()
