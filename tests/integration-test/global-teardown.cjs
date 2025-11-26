const isWindows = process.platform === "win32";

module.exports = async function () {
    return new Promise((resolve) => {
        if (!globalThis.processStartService) {
            resolve();
            return;
        }

        const proc = globalThis.processStartService;

        // Check if already exited
        if (proc.killed || proc.exitCode !== null) {
            resolve();
            return;
        }

        // Close all streams
        if (proc.stdin && !proc.stdin.destroyed) {
            proc.stdin.pause();
            proc.stdin.destroy();
        }
        if (proc.stdout && !proc.stdout.destroyed) {
            proc.stdout.destroy();
        }
        if (proc.stderr && !proc.stderr.destroyed) {
            proc.stderr.destroy();
        }

        let resolved = false;
        let forceKillTimeout;

        const onExit = () => {
            if (forceKillTimeout) {
                clearTimeout(forceKillTimeout);
            }
            if (!resolved) {
                resolved = true;
                resolve();
            }
        };

        // Set up exit handlers
        proc.once('exit', onExit);
        proc.once('close', onExit);

        // Try graceful shutdown first
        try {
            if (isWindows) {
                // On Windows, use taskkill for more reliable termination
                proc.kill();
            } else {
                proc.kill('SIGTERM');
            }
        } catch (error) {
            // Process might already be dead
            onExit();
            return;
        }

        // Force kill after 2 seconds if still running
        forceKillTimeout = setTimeout(() => {
            if (!resolved) {
                try {
                    if (!proc.killed && proc.exitCode === null) {
                        if (isWindows) {
                            proc.kill();
                        } else {
                            proc.kill('SIGKILL');
                        }
                    }
                } catch (error) {
                    // Ignore errors
                }
                onExit();
            }
        }, 2000);
    });
}
