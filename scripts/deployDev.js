// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  const EthMarket = await hre.ethers.getContractFactory("EthMarket");
  const ethMarket = await EthMarket.deploy();
  await ethMarket.deployed();

  const [_, address1, address2] = await ethers.getSigners()

  await ethMarket.createUser("maxim");
    await ethMarket.connect(address1).createUser("magalie")
    await ethMarket.connect(address2).createUser("marc")
    await ethMarket.createPost("Atomic Backland touring ski", "test description", "Sport", "/photoTest.png", Date.now() + 60, 100)
    await ethMarket.connect(address2).createPost("Lenovo thinkpad laptop", "test description", "Tech", "/photoTest.png", Date.now() + 50, 10)
    await ethMarket.createPost("gaming desktop", "test description", "Tech", "/photoTest.png", Date.now() + 40, 180)
    await ethMarket.connect(address2).createPost("Toyota corolla 2008", "test description", "Cars", "/photoTest.png", Date.now() + 5, 1000)
    await ethMarket.createPost("boat", "test description", "Other", "/photoTest.png", Date.now() + 90, 67)
    await ethMarket.connect(address1).mint({value: 110})
    await ethMarket.connect(address1).bid(1, 110)
    await ethMarket.connect(address2).mint({value: 1200})
    await ethMarket.connect(address2).bid(1, 180)
    await ethMarket.connect(address2).bid(1, 210)
    await ethMarket.connect(address2).bid(1, 700)
    await ethMarket.connect(address2).bid(1, 800)
    await ethMarket.connect(address2).bid(1, 1050)

  console.log("ethMarket deployed to:", ethMarket.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
