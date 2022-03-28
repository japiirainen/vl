const { build, run, readAll } = Deno;

export interface Process {
  command: string; // Command to run this process
  ppid: number; // The parent process ID of the process
  pid: number; // Process ID
  stat: string; // Process status
  children?: Process[];
}

export interface KillOptions {
  force?: boolean;
  ignoreCase?: boolean;
  tree?: boolean;
}

/**
 * Get the single process information.
 * Requires `--allow-run` flag
 * @param pid
 */
export async function get(pid: number): Promise<Process | void> {
  return (await getAll()).find((v) => v.pid === pid);
}

/**
 * Get process list
 * Requires `--allow-run` flag
 */
export async function getAll(): Promise<Process[]> {
  const commands = build.os == "windows"
    ? ["wmic.exe", "PROCESS", "GET", "Name,ProcessId,ParentProcessId,Status"]
    : ["ps", "-A", "-o", "comm,ppid,pid,stat"];

  const ps = run({
    cmd: commands,
    stdout: "piped",
  });

  const output = new TextDecoder().decode(await readAll(ps.stdout!));

  const { success, code } = await ps.status();

  ps.stdout?.close();

  ps.close();

  if (!success || code !== 0) {
    throw new Error("Fail to get process.");
  }

  const lines = output.split("\n").filter((v: string): string => v.trim());
  lines.shift();

  const processList: Process[] = lines.map((line: string): Process => {
    const columns = line.trim().split(/\s+/);
    return {
      command: columns[0],
      ppid: +columns[1],
      pid: +columns[2],
      stat: columns[3],
    };
  });

  return processList;
}

/**
 * Get process tree
 * Requires `--allow-run` flag
 */
export async function psTree(pid: number): Promise<Process[]> {
  const items = await getAll();
  const nest = (items: Process[], pid: number): Process[] => {
    return items
      .filter((item) => item.ppid === pid)
      .map((item) => {
        const children = nest(items, item.pid);
        if (!children.length) {
          return item;
        } else {
          return { ...item, children };
        }
      }) as Process[];
  };

  return nest(items, pid);
}

function getKillCommand(
  pidOrName: number | string,
  options: KillOptions = {},
): string[] {
  const killByName = typeof pidOrName === "string";
  if (build.os === "windows") {
    const commands = ["taskkill"];

    if (options.force) {
      commands.push("/f");
    }

    if (options.tree) {
      commands.push("/t");
    }

    commands.push(killByName ? "/im" : "/pid", pidOrName + "");

    return commands;
  } else if (build.os === "linux") {
    const commands = [killByName ? "killall" : "kill"];

    if (options.force) {
      commands.push("-9");
    }

    if (killByName && options.ignoreCase) {
      commands.push("-I");
    }

    commands.push(pidOrName + "");

    return commands;
  } else {
    const commands = [killByName ? "pkill" : "kill"];

    if (options.force) {
      commands.push("-9");
    }

    if (killByName && options.ignoreCase) {
      commands.push("-i");
    }

    commands.push(pidOrName + "");

    return commands;
  }
}

/**
 * kill process
 * Requires `--allow-run` flag
 * @param pidOrName pid or process name
 * @param options
 */
export async function kill(
  pidOrName: number | string,
  options: KillOptions = {},
): Promise<void> {
  const commands = getKillCommand(pidOrName, options);

  const ps = run({
    cmd: commands,
    stderr: "piped",
  });

  const { success, code } = await ps.status();

  ps.stderr?.close();

  ps.close();

  if (!success || code !== 0) {
    const msg = new TextDecoder().decode(await readAll(ps.stderr!));
    throw new Error(msg || "exit with code: " + code);
  }
}
