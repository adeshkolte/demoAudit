const { expect } = require("chai");
const { ethers } = require("hardhat");
const { MaxUint256 } = require("@ethersproject/constants");
const { BigNumber } = require("ethers");

const decimals = 18;
let UniswapV2Factory;
let UniswapV2Router02;
let quilltest;
let WETH9;
let USDT;
let UniswapV2Pair;
let deployer;
const zeroAddress = "0x0000000000000000000000000000000000000000";
describe("QuillTestToken", function () {
  beforeEach(async function () {
    [deployer] = await ethers.getSigners();

    const UniswapV2FactoryInstance = await ethers.getContractFactory(
      "UniswapV2Factory"
    );
    UniswapV2Factory = await UniswapV2FactoryInstance.deploy(deployer.address);

    const WETH9Instance = await ethers.getContractFactory("WETH9");
    WETH9 = await WETH9Instance.deploy();

    const UniswapV2Router02Instance = await ethers.getContractFactory(
      "UniswapV2Router02"
    );
    UniswapV2Router02 = await UniswapV2Router02Instance.deploy(
      UniswapV2Factory.address,
      WETH9.address
    );

    const QuillTokenInstance = await ethers.getContractFactory("QuillTest");
    quilltest = await QuillTokenInstance.deploy(UniswapV2Router02.address);
    const USDTInstance = await ethers.getContractFactory("USDT");
    usdtcontract = await USDTInstance.deploy();
  });

  describe("#QuillToken", () => {
    it("should check the owner", async function () {
      expect(await quilltest.owner()).to.equal(deployer.address);
      console.log(await quilltest.totalSupply());
    });
    it("should check the LiquidityFeeOnBuy ", async function () {
      expect(await quilltest.liquidityFeeOnBuy()).to.equal(1);
    });
    it("should check the LiquidityFeeOnSell ", async function () {
      expect(await quilltest.liquidityFeeOnSell()).to.equal(1);
    });
    it("should check the MarketingFeeOnBuy ", async function () {
      expect(await quilltest.marketingFeeOnBuy()).to.equal(2);
    });
    it("should check the MarketingFeeOnSell ", async function () {
      expect(await quilltest.marketingFeeOnSell()).to.equal(2);
    });
    it("should check the valid router address ", async function () {
      expect(await quilltest.uniswapV2Router()).to.equal(
        UniswapV2Router02.address
      );
    });
    it("should check the swapTokensAtamount ", async function () {
      expect(await quilltest.swapTokensAtAmount()).to.equal(2e14);
      console.log("SwapTokenAtAmount", await quilltest.swapTokensAtAmount());
    });
    it("should check the maxTransactionamoutBuy ", async function () {
      const value = 1e14;
      expect(await quilltest.maxTransactionAmountBuy()).to.equal(value);
      console.log("SwapTokenAtAmount", await quilltest.maxTransactionAmountBuy());
  });

    it("should check the swapEnable ", async function () {
      expect(await quilltest.swapEnabled()).to.equal(false);
   
    })
   

    it("Test Stake functions  ", async function () {
      const signer = await ethers.getSigners();
      await expect(
        quilltest.connect(deployer).stake(10e6, usdtcontract.address)
      );
      await ethers.provider.send("evm_increaseTime", [259201]); // increase evm time by 3 days
      console.log(
        "Not Claimed StuckToken",
        await usdtcontract.balanceOf(signer[2].address)
      );
      await expect(
        quilltest.connect(deployer).claimStuckTokens(usdtcontract.address)
      );
      console.log(
        "ClaimedStuckToken",
        await usdtcontract.balanceOf(deployer.address)
      );
      await expect(
        quilltest.connect(deployer).withdraw(usdtcontract.address, 10e6)
      );
      await expect(quilltest.claimRewards(deployer));
      console.log("Reward", await usdtcontract.balanceOf(deployer.address));
    });
  });
});

async function main() {
  try {
    await runTests();
  } catch (error) {
    console.error(error);
  }
}

function expandTo18Decimals(value) {
  return BigNumber.from(value).mul(BigNumber.from(10).pow(18));
}
