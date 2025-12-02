import { asValue, AwilixContainer, createContainer } from "awilix";
import ContainerRegistry from "../../src/container-registry.js";
import { GameCron } from "../../src/crons/game-cron.js";
import { ProcessBetQueue } from "../../src/crons/process-bet-queue.js";
import {
  InGameConsumer,
  RoundConsumer,
  RoundResultConsumer,
  SettleGameRoundConsumer,
} from "../../src/event-consumers/index.js";
import { BetLogs, Bets, Rounds, TempBets } from "../../src/models/index.js";

// Mock sc-game-base
jest.mock("sc-game-base", () => {
  return {
    Table: {
      Crons: {
        TableGameConfigBot: class MockTableGameConfigBot {
          reset = jest.fn();
        },
      },
      TableContainerRegistry: class MockTableContainerRegistry {
        container: AwilixContainer;

        constructor() {
          this.container = createContainer();
        }

        registerModels(): void {
          // Base implementation
        }

        registerConsumers(): void {
          // Base implementation
        }

        registerCrons(): void {
          // Base implementation
        }

        registerPublishers(): void {
          // Base implementation
        }
      },
    },
  };
});

// Mock models
jest.mock("../../src/models/index.js", () => ({
  Rounds: jest.fn(),
  Bets: jest.fn(),
  BetLogs: jest.fn(),
  TempBets: jest.fn(),
}));

// Mock event consumers
jest.mock("../../src/event-consumers/index.js", () => ({
  InGameConsumer: jest.fn(),
  RoundConsumer: jest.fn(),
  RoundResultConsumer: jest.fn(),
  SettleGameRoundConsumer: jest.fn(),
  PlaceBetConsumer: jest.fn(),
}));

// Mock event publishers
jest.mock("../../src/event-publishers/index.js", () => ({
  RunningRoundInfoPublisher: jest.fn(),
}));

// Mock crons
jest.mock("../../src/crons/game-cron.js", () => ({
  GameCron: jest.fn(),
}));

jest.mock("../../src/crons/process-bet-queue.js", () => ({
  ProcessBetQueue: jest.fn(),
}));

describe("ContainerRegistry", () => {
  describe("Class definition", () => {
    test("should be defined", () => {
      // Arrange & Act & Assert
      expect(ContainerRegistry).toBeDefined();
    });

    test("should extend from TableContainerRegistry base class", () => {
      // Arrange
      const registry = new ContainerRegistry();

      // Act & Assert
      expect(registry).toBeInstanceOf(ContainerRegistry);
      expect(registry.container).toBeDefined();
      expect(registry.registerModels).toBeDefined();
      expect(registry.registerConsumers).toBeDefined();
      expect(registry.registerCrons).toBeDefined();
    });

    test("should have required methods", () => {
      // Arrange & Act
      const hasRequiredMethods =
        ContainerRegistry.prototype.registerModels !== undefined &&
        ContainerRegistry.prototype.registerConsumers !== undefined &&
        ContainerRegistry.prototype.registerCrons !== undefined;

      // Assert
      expect(hasRequiredMethods).toBe(true);
      expect(ContainerRegistry.prototype.registerModels).toBeDefined();
      expect(ContainerRegistry.prototype.registerConsumers).toBeDefined();
      expect(ContainerRegistry.prototype.registerCrons).toBeDefined();
    });
  });

  describe("Constructor", () => {
    test("should initialize with container instance", () => {
      // Arrange & Act
      const registry = new ContainerRegistry();

      // Assert
      expect(registry.container).toBeDefined();
      expect(registry.container.register).toBeDefined();
      expect(registry.container.resolve).toBeDefined();
    });

    test("should call parent constructor", () => {
      // Arrange & Act
      const registry = new ContainerRegistry();

      // Assert
      expect(registry.container).toBeInstanceOf(Object);
    });
  });

  describe("registerModels", () => {
    test("should call parent registerModels", () => {
      // Arrange
      const registry = new ContainerRegistry();
      const superRegisterModels = jest.spyOn(
        Object.getPrototypeOf(ContainerRegistry.prototype),
        "registerModels",
      );

      // Act
      registry.registerModels();

      // Assert
      expect(superRegisterModels).toHaveBeenCalledTimes(1);

      superRegisterModels.mockRestore();
    });

    test("should register roundsRepository with Rounds model", () => {
      // Arrange
      const registry = new ContainerRegistry();

      // Act
      registry.registerModels();

      // Assert
      const roundsRepository = registry.container.resolve("roundsRepository");
      expect(roundsRepository).toBe(Rounds);
    });

    test("should register betsRepository with Bets model", () => {
      // Arrange
      const registry = new ContainerRegistry();

      // Act
      registry.registerModels();

      // Assert
      const betsRepository = registry.container.resolve("betsRepository");
      expect(betsRepository).toBe(Bets);
    });

    test("should register betLogsRepository with BetLogs model", () => {
      // Arrange
      const registry = new ContainerRegistry();

      // Act
      registry.registerModels();

      // Assert
      const betLogsRepository = registry.container.resolve("betLogsRepository");
      expect(betLogsRepository).toBe(BetLogs);
    });

    test("should register tempBetsRepository with TempBets model", () => {
      // Arrange
      const registry = new ContainerRegistry();

      // Act
      registry.registerModels();

      // Assert
      const tempBetsRepository =
        registry.container.resolve("tempBetsRepository");
      expect(tempBetsRepository).toBe(TempBets);
    });

    test("should register all four model repositories", () => {
      // Arrange
      const registry = new ContainerRegistry();

      // Act
      registry.registerModels();

      // Assert
      expect(registry.container.hasRegistration("roundsRepository")).toBe(true);
      expect(registry.container.hasRegistration("betsRepository")).toBe(true);
      expect(registry.container.hasRegistration("betLogsRepository")).toBe(
        true,
      );
      expect(registry.container.hasRegistration("tempBetsRepository")).toBe(
        true,
      );
    });

    test("should use asValue for model registrations", () => {
      // Arrange
      const registry = new ContainerRegistry();
      const registerSpy = jest.spyOn(registry.container, "register");

      // Act
      registry.registerModels();

      // Assert
      expect(registerSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          roundsRepository: expect.anything(),
          betsRepository: expect.anything(),
          betLogsRepository: expect.anything(),
          tempBetsRepository: expect.anything(),
        }),
      );

      registerSpy.mockRestore();
    });
  });

  describe("registerConsumers", () => {
    test("should call parent registerConsumers", () => {
      // Arrange
      const registry = new ContainerRegistry();
      const superRegisterConsumers = jest.spyOn(
        Object.getPrototypeOf(ContainerRegistry.prototype),
        "registerConsumers",
      );

      // Act
      registry.registerConsumers();

      // Assert
      expect(superRegisterConsumers).toHaveBeenCalledTimes(1);

      superRegisterConsumers.mockRestore();
    });

    test("should register inGameConsumer with InGameConsumer class", () => {
      // Arrange
      const registry = new ContainerRegistry();

      // Act
      registry.registerConsumers();

      // Assert
      expect(registry.container.hasRegistration("inGameConsumer")).toBe(true);
    });

    test("should register roundConsumer with RoundConsumer class", () => {
      // Arrange
      const registry = new ContainerRegistry();

      // Act
      registry.registerConsumers();

      // Assert
      expect(registry.container.hasRegistration("roundConsumer")).toBe(true);
    });

    test("should register roundResultConsumer with RoundResultConsumer class", () => {
      // Arrange
      const registry = new ContainerRegistry();

      // Act
      registry.registerConsumers();

      // Assert
      expect(registry.container.hasRegistration("roundResultConsumer")).toBe(
        true,
      );
    });

    test("should register settleGameRoundConsumer with SettleGameRoundConsumer class", () => {
      // Arrange
      const registry = new ContainerRegistry();

      // Act
      registry.registerConsumers();

      // Assert
      expect(
        registry.container.hasRegistration("settleGameRoundConsumer"),
      ).toBe(true);
    });

    test("should register all four consumers", () => {
      // Arrange
      const registry = new ContainerRegistry();

      // Act
      registry.registerConsumers();

      // Assert
      expect(registry.container.hasRegistration("inGameConsumer")).toBe(true);
      expect(registry.container.hasRegistration("roundConsumer")).toBe(true);
      expect(registry.container.hasRegistration("roundResultConsumer")).toBe(
        true,
      );
      expect(
        registry.container.hasRegistration("settleGameRoundConsumer"),
      ).toBe(true);
    });

    test("should use asClass for consumer registrations", () => {
      // Arrange
      const registry = new ContainerRegistry();
      const registerSpy = jest.spyOn(registry.container, "register");

      // Act
      registry.registerConsumers();

      // Assert
      expect(registerSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          inGameConsumer: expect.anything(),
          roundConsumer: expect.anything(),
          roundResultConsumer: expect.anything(),
          settleGameRoundConsumer: expect.anything(),
        }),
      );

      registerSpy.mockRestore();
    });

    test("should register consumers as singletons", () => {
      // Arrange
      const registry = new ContainerRegistry();

      // Mock the consumer constructors to track instantiation
      const inGameConsumerMock = jest.fn();
      const roundConsumerMock = jest.fn();
      const roundResultConsumerMock = jest.fn();
      const settleGameRoundConsumerMock = jest.fn();

      (InGameConsumer as jest.Mock).mockImplementation(inGameConsumerMock);
      (RoundConsumer as jest.Mock).mockImplementation(roundConsumerMock);
      (RoundResultConsumer as jest.Mock).mockImplementation(
        roundResultConsumerMock,
      );
      (SettleGameRoundConsumer as jest.Mock).mockImplementation(
        settleGameRoundConsumerMock,
      );

      // Act
      registry.registerConsumers();

      // Resolve twice to verify singleton behavior
      const consumer1 = registry.container.resolve("inGameConsumer");
      const consumer2 = registry.container.resolve("inGameConsumer");

      // Assert
      expect(consumer1).toBe(consumer2);
    });
  });

  describe("registerCrons", () => {
    test("should call parent registerCrons", () => {
      // Arrange
      const registry = new ContainerRegistry();
      const superRegisterCrons = jest.spyOn(
        Object.getPrototypeOf(ContainerRegistry.prototype),
        "registerCrons",
      );

      // Act
      registry.registerCrons();

      // Assert
      expect(superRegisterCrons).toHaveBeenCalledTimes(1);

      superRegisterCrons.mockRestore();
    });

    test("should register gameCron with GameCron class", () => {
      // Arrange
      const registry = new ContainerRegistry();

      // Act
      registry.registerCrons();

      // Assert
      expect(registry.container.hasRegistration("gameCron")).toBe(true);
    });

    test("should register processBetQueue with ProcessBetQueue class", () => {
      // Arrange
      const registry = new ContainerRegistry();

      // Act
      registry.registerCrons();

      // Assert
      expect(registry.container.hasRegistration("processBetQueue")).toBe(true);
    });

    test("should register both cron jobs", () => {
      // Arrange
      const registry = new ContainerRegistry();

      // Act
      registry.registerCrons();

      // Assert
      expect(registry.container.hasRegistration("gameCron")).toBe(true);
      expect(registry.container.hasRegistration("processBetQueue")).toBe(true);
    });

    test("should use asClass for cron registrations", () => {
      // Arrange
      const registry = new ContainerRegistry();
      const registerSpy = jest.spyOn(registry.container, "register");

      // Act
      registry.registerCrons();

      // Assert
      expect(registerSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          gameCron: expect.anything(),
          processBetQueue: expect.anything(),
        }),
      );

      registerSpy.mockRestore();
    });

    test("should register crons as singletons", () => {
      // Arrange
      const registry = new ContainerRegistry();

      // Mock the cron constructors to track instantiation
      const gameCronMock = jest.fn();
      const processBetQueueMock = jest.fn();

      (GameCron as jest.Mock).mockImplementation(gameCronMock);
      (ProcessBetQueue as jest.Mock).mockImplementation(processBetQueueMock);

      // Act
      registry.registerCrons();

      // Resolve twice to verify singleton behavior
      const cron1 = registry.container.resolve("gameCron");
      const cron2 = registry.container.resolve("gameCron");

      // Assert
      expect(cron1).toBe(cron2);
    });
  });

  describe("registerPublishers", () => {
    test("should call parent registerPublishers", () => {
      // Arrange
      const registry = new ContainerRegistry();
      const superRegisterPublishers = jest.spyOn(
        Object.getPrototypeOf(ContainerRegistry.prototype),
        "registerPublishers",
      );

      // Act
      registry.registerPublishers();

      // Assert
      expect(superRegisterPublishers).toHaveBeenCalledTimes(1);

      superRegisterPublishers.mockRestore();
    });

    test("should register runningRoundInfoPublisher with RunningRoundInfoPublisher class", () => {
      // Arrange
      const registry = new ContainerRegistry();

      // Act
      registry.registerPublishers();

      // Assert
      expect(
        registry.container.hasRegistration("runningRoundInfoPublisher"),
      ).toBe(true);
    });
  });

  describe("Integration scenarios", () => {
    test("should register all dependencies in correct order", () => {
      // Arrange
      const registry = new ContainerRegistry();

      // Act
      registry.registerModels();
      registry.registerConsumers();
      registry.registerCrons();

      // Assert - All should be registered
      expect(registry.container.hasRegistration("roundsRepository")).toBe(true);
      expect(registry.container.hasRegistration("betsRepository")).toBe(true);
      expect(registry.container.hasRegistration("betLogsRepository")).toBe(
        true,
      );
      expect(registry.container.hasRegistration("tempBetsRepository")).toBe(
        true,
      );
      expect(registry.container.hasRegistration("inGameConsumer")).toBe(true);
      expect(registry.container.hasRegistration("roundConsumer")).toBe(true);
      expect(registry.container.hasRegistration("roundResultConsumer")).toBe(
        true,
      );
      expect(
        registry.container.hasRegistration("settleGameRoundConsumer"),
      ).toBe(true);
      expect(registry.container.hasRegistration("gameCron")).toBe(true);
      expect(registry.container.hasRegistration("processBetQueue")).toBe(true);
    });

    test("should allow resolving models after registration", () => {
      // Arrange
      const registry = new ContainerRegistry();

      // Act
      registry.registerModels();

      // Assert - Should not throw errors
      expect(() =>
        registry.container.resolve("roundsRepository"),
      ).not.toThrow();
      expect(() => registry.container.resolve("betsRepository")).not.toThrow();
      expect(() =>
        registry.container.resolve("betLogsRepository"),
      ).not.toThrow();
      expect(() =>
        registry.container.resolve("tempBetsRepository"),
      ).not.toThrow();
    });

    test("should allow resolving consumers after registration", () => {
      // Arrange
      const registry = new ContainerRegistry();

      // Act
      registry.registerConsumers();

      // Assert - Should not throw errors
      expect(() => registry.container.resolve("inGameConsumer")).not.toThrow();
      expect(() => registry.container.resolve("roundConsumer")).not.toThrow();
      expect(() =>
        registry.container.resolve("roundResultConsumer"),
      ).not.toThrow();
      expect(() =>
        registry.container.resolve("settleGameRoundConsumer"),
      ).not.toThrow();
    });

    test("should allow resolving crons after registration", () => {
      // Arrange
      const registry = new ContainerRegistry();

      // Act
      registry.registerCrons();

      // Assert - Should not throw errors
      expect(() => registry.container.resolve("gameCron")).not.toThrow();
      expect(() => registry.container.resolve("processBetQueue")).not.toThrow();
    });

    test("should support multiple registry instances independently", () => {
      // Arrange
      const registry1 = new ContainerRegistry();
      const registry2 = new ContainerRegistry();

      // Act
      registry1.registerModels();
      registry2.registerConsumers();

      // Assert - Each registry should have independent registrations
      expect(registry1.container.hasRegistration("roundsRepository")).toBe(
        true,
      );
      expect(registry1.container.hasRegistration("inGameConsumer")).toBe(false);
      expect(registry2.container.hasRegistration("roundsRepository")).toBe(
        false,
      );
      expect(registry2.container.hasRegistration("inGameConsumer")).toBe(true);
    });
  });

  describe("Edge cases", () => {
    test("should not throw when calling registerModels multiple times", () => {
      // Arrange
      const registry = new ContainerRegistry();

      // Act & Assert
      expect(() => {
        registry.registerModels();
        registry.registerModels();
      }).not.toThrow();
    });

    test("should not throw when calling registerConsumers multiple times", () => {
      // Arrange
      const registry = new ContainerRegistry();

      // Act & Assert
      expect(() => {
        registry.registerConsumers();
        registry.registerConsumers();
      }).not.toThrow();
    });

    test("should not throw when calling registerCrons multiple times", () => {
      // Arrange
      const registry = new ContainerRegistry();

      // Act & Assert
      expect(() => {
        registry.registerCrons();
        registry.registerCrons();
      }).not.toThrow();
    });

    test("should handle registration methods being called in any order", () => {
      // Arrange
      const registry = new ContainerRegistry();

      // Act & Assert - Should not throw regardless of order
      expect(() => {
        registry.registerCrons();
        registry.registerModels();
        registry.registerConsumers();
      }).not.toThrow();

      expect(registry.container.hasRegistration("gameCron")).toBe(true);
      expect(registry.container.hasRegistration("roundsRepository")).toBe(true);
      expect(registry.container.hasRegistration("inGameConsumer")).toBe(true);
    });

    test("should maintain singleton behavior after multiple registrations", () => {
      // Arrange
      const registry = new ContainerRegistry();
      const gameCronMock = jest.fn();
      (GameCron as jest.Mock).mockImplementation(gameCronMock);

      // Act
      registry.registerCrons();
      registry.registerCrons(); // Register again

      const instance1 = registry.container.resolve("gameCron");
      const instance2 = registry.container.resolve("gameCron");

      // Assert - Should still be singleton
      expect(instance1).toBe(instance2);
    });
  });

  describe("Registration verification", () => {
    test("should verify all model registrations exist", () => {
      // Arrange
      const registry = new ContainerRegistry();
      const expectedModels = [
        "roundsRepository",
        "betsRepository",
        "betLogsRepository",
        "tempBetsRepository",
      ];

      // Act
      registry.registerModels();

      // Assert
      expectedModels.forEach((modelName) => {
        expect(registry.container.hasRegistration(modelName)).toBe(true);
      });
    });

    test("should verify all consumer registrations exist", () => {
      // Arrange
      const registry = new ContainerRegistry();
      const expectedConsumers = [
        "inGameConsumer",
        "roundConsumer",
        "roundResultConsumer",
        "settleGameRoundConsumer",
      ];

      // Act
      registry.registerConsumers();

      // Assert
      expectedConsumers.forEach((consumerName) => {
        expect(registry.container.hasRegistration(consumerName)).toBe(true);
      });
    });

    test("should verify all cron registrations exist", () => {
      // Arrange
      const registry = new ContainerRegistry();
      const expectedCrons = ["gameCron", "processBetQueue"];

      // Act
      registry.registerCrons();

      // Assert
      expectedCrons.forEach((cronName) => {
        expect(registry.container.hasRegistration(cronName)).toBe(true);
      });
    });

    test("should verify total number of registrations after full setup", () => {
      // Arrange
      const registry = new ContainerRegistry();

      // Act
      registry.registerModels();
      registry.registerConsumers();
      registry.registerCrons();

      // Assert - Should have 10 custom registrations (4 models + 4 consumers + 2 crons)
      const modelCount = 4;
      const consumerCount = 4;
      const cronCount = 2;
      const totalExpected = modelCount + consumerCount + cronCount;

      const registeredNames = [
        "roundsRepository",
        "betsRepository",
        "betLogsRepository",
        "tempBetsRepository",
        "inGameConsumer",
        "roundConsumer",
        "roundResultConsumer",
        "settleGameRoundConsumer",
        "gameCron",
        "processBetQueue",
      ];

      registeredNames.forEach((name) => {
        expect(registry.container.hasRegistration(name)).toBe(true);
      });

      expect(registeredNames.length).toBe(totalExpected);
    });
  });

  describe("Container behavior", () => {
    test("should return same container instance across method calls", () => {
      // Arrange
      const registry = new ContainerRegistry();

      // Act
      const containerBefore = registry.container;
      registry.registerModels();
      const containerAfter = registry.container;

      // Assert
      expect(containerBefore).toBe(containerAfter);
    });

    test("should allow accessing container directly", () => {
      // Arrange
      const registry = new ContainerRegistry();

      // Act & Assert
      expect(registry.container).toBeDefined();
      expect(typeof registry.container.register).toBe("function");
      expect(typeof registry.container.resolve).toBe("function");
    });

    test("should support manual registration in addition to default registrations", () => {
      // Arrange
      const registry = new ContainerRegistry();
      const customService = { name: "CustomService" };

      // Act
      registry.registerModels();
      registry.container.register({
        customService: asValue(customService),
      });

      // Assert
      expect(registry.container.hasRegistration("roundsRepository")).toBe(true);
      expect(registry.container.hasRegistration("customService")).toBe(true);
      expect(registry.container.resolve("customService")).toBe(customService);
    });
  });
});
