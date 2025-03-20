const { expect } = require("chai");
const { ethers } = require("hardhat");

/**
 * @title Storage Contract Tests
 * @dev This file contains tests for the Storage contract
 */
describe("Storage", function () {
  let Storage;
  let storage;

  /**
   * @dev Deploys the Storage contract before each test
   */
  beforeEach(async function () {
    Storage = await ethers.getContractFactory("Storage");
    storage = await Storage.deploy();
  });

  /**
   * @notice Tests if a value can be stored
   * @dev This test stores the value 42 and retrieves it to check if it was stored correctly
   */
  it("Should store a value", async function () {
    await storage.store(42);
    const storedValue = await storage.retrieve();
    expect(storedValue).to.equal(42);
  });

  /**
   * @notice Tests if the stored value can be updated
   * @dev This test stores the value 42, updates it to 100, and retrieves it to check if it was updated correctly
   */
  it("Should update the stored value", async function () {
    await storage.store(42);
    await storage.store(100);
    const storedValue = await storage.retrieve();
    expect(storedValue).to.equal(100);
  });

  /**
   * @notice Tests if the initial value can be retrieved
   * @dev This test retrieves the initial value stored in the contract, which is assumed to be 0
   */
  it("Should retrieve the initial value", async function () {
    const storedValue = await storage.retrieve();
    expect(storedValue).to.equal(0); // Assuming the initial value is 0
  });

  /**
   * @notice Tests if multiple values can be stored and retrieved
   * @dev This test stores and retrieves multiple values (1, 2, 3) to check if they are stored and retrieved correctly
   */
  it("Should store and retrieve multiple values", async function () {
    await storage.store(1);
    let storedValue = await storage.retrieve();
    expect(storedValue).to.equal(1);

    await storage.store(2);
    storedValue = await storage.retrieve();
    expect(storedValue).to.equal(2);

    await storage.store(3);
    storedValue = await storage.retrieve();
    expect(storedValue).to.equal(3);
  });
});