const { spawn } = require("child_process");

const isWindows = process.platform === "win32";
const npxCommand = isWindows ? "npx.cmd" : "npx";

const startSetupDataProcess = (onSetupDataDone) => {
  const setupDataProcess = spawn(
    npxCommand,
    ["tsx", "./tests/integration-test/_stubs/test-data-setup.ts"],
    {
      shell: isWindows,
    },
  );

  setupDataProcess.stdout.on("data", (data) => {
    console.log(`stdout: ${data}`);
  });

  setupDataProcess.stderr.on("data", (data) => {
    console.log(`stderr: ${data}`);
  });

  setupDataProcess.on("close", (code) => {
    onSetupDataDone && onSetupDataDone();
    console.log(`child process exited with code ${code}`);
  });

  return setupDataProcess;
};

const startServiceProcess = (onServiceStarted) => {
  const serviceProcess = spawn(
    npxCommand,
    ["tsx", "./tests/integration-test/game-service-setup/game-service-app.ts"],
    {
      shell: isWindows,
    },
  );

  serviceProcess.stdout.on("data", (data) => {
    console.log(`stdout: ${data}`);

    if (data && data.includes("Express server started and running on")) {
      onServiceStarted && onServiceStarted();
    }
  });

  serviceProcess.stderr.on("data", (data) => {
    console.log(`stderr: ${data}`);
  });

  return serviceProcess;
};

module.exports = async () => {
  return new Promise((resolve) => {
    // Seed minimal round data for history tests, then start the game service
    startSetupDataProcess(() => {
      globalThis.processStartService = startServiceProcess(() => {
        console.log("Start service job done!");
        resolve(0);
      });
    });
  });
};
