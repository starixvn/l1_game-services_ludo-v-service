import { spawn } from "child_process";

export const startSetupDataProcess = (
  processId,
  overrideGameConfigs,
  onSetupDataDone,
) => {
  const setupDataProcess = spawn("npx", [
    "tsx",
    "./tests/integration-test/_stubs/test-data-setup.ts",
    "-pid",
    `${processId}`,
    `${JSON.stringify(overrideGameConfigs)}`,
  ]);

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

export const startServiceProcess = (
  processId,
  overrideAppConfigs,
  onServiceStarted,
) => {
  const serviceProcess = spawn("npx", [
    "tsx",
    "./tests/integration-test/_stubs/game-service-app.ts",
    "-pid",
    `${processId}`,
    `${JSON.stringify(overrideAppConfigs)}`,
  ]);

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

export const startService = (
  processId,
  overrideGameConfigs = {},
  overrideAppConfigs = {},
) => {
  let processStartService;
  const JEST_ASSERT_WAITING_RESPONSE_TIMEOUT = 50000;
  beforeAll((done) => {
    startSetupDataProcess(processId, overrideGameConfigs, () => {
      console.log("done setup db");
      processStartService = startServiceProcess(
        processId,
        overrideAppConfigs,
        () => {
          console.log("start tests");
          done();
        },
      );
    });
  }, JEST_ASSERT_WAITING_RESPONSE_TIMEOUT);

  afterAll(() => {
    processStartService.stdin.pause();
    processStartService.kill();
  });
};
