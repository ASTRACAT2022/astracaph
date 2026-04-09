import { spawn } from "node:child_process";
import { mkdir, rm } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();
const nextDir = path.join(projectRoot, ".next");

async function bootstrap() {
  // Clearing stale build artifacts is enough to avoid most dev runtime issues here.
  // Mirroring chunk files into .next/server was corrupting the webpack module graph.
  await rm(nextDir, { recursive: true, force: true });
  await mkdir(nextDir, { recursive: true });

  const child = spawn(
    process.execPath,
    [path.join(projectRoot, "node_modules", "next", "dist", "bin", "next"), "dev"],
    {
      cwd: projectRoot,
      stdio: "inherit",
      env: process.env,
    },
  );

  const stop = () => {
    if (!child.killed) {
      child.kill("SIGINT");
    }
  };

  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);

  child.on("exit", (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }

    process.exit(code ?? 0);
  });
}

void bootstrap();
