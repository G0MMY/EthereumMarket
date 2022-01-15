const { assert } = require("chai");
const { ethers } = require("hardhat");

describe("Users", function () {
  it("Should create new users", async function () {
    const Users = await ethers.getContractFactory("Users");
    const users = await Users.deploy();
    await users.deployed();

    const [_, address1, address2] = await ethers.getSigners()

    await users.createUser("maxim");
    await users.connect(address1).createUser("magalie")
    await users.connect(address2).createUser("marc")

    const usersArray = await users.getUsernames([_.address, address1.address, address2.address]);
    
    assert.equal(usersArray[0], "maxim")
    assert.equal(usersArray[1], "magalie")
    assert.equal(usersArray[2], "marc")
  })

  it("Should check if an address is logged in has user", async function() {
    const Users = await ethers.getContractFactory("Users");
    const users = await Users.deploy();
    await users.deployed();

    const [_, address1] = await ethers.getSigners()

    await users.createUser("maxim");
    const user1 = await users.isUser();
    const user2 = await users.connect(address1).isUser();

    assert.equal(user1, true)
    assert.equal(user2, false)
  })

  it("should delete one user", async function () {
    const Users = await ethers.getContractFactory("Users");
    const users = await Users.deploy();
    await users.deployed();

    const [_, address1, address2] = await ethers.getSigners()

    await users.createUser("maxim");
    await users.connect(address1).createUser("magalie")
    await users.connect(address2).createUser("marc")

    let usersArray = await users.getUsernames([_.address, address1.address, address2.address]);
    assert.equal(usersArray.length, 3)

    await users.connect(address1).deleteUser();

    usersArray = await users.getUsernames([_.address, address2.address]);

    assert.equal(usersArray.length, 2)
  })

  it("should deposit money in account", async function() {
    const Users = await ethers.getContractFactory("Users");
    const users = await Users.deploy();
    await users.deployed();

    const [_, address1] = await ethers.getSigners()

    await users.createUser("maxim");
    await users.connect(address1).createUser("magalie")
    await users.connect(address1).mint({value: 10})

    let balance = await users.connect(address1).getBalance(address1.address)
    
    assert.equal(balance, 10)

    await users.connect(address1).mint({value: 10})
    balance = await users.connect(address1).getBalance(address1.address)

    assert.equal(balance, 20)

    await users.mint({value: 10})
    balance = await users.getBalance(_.address)

    assert.equal(balance, 10)
  })

  it("Should transfer back money from balance to account", async function() {
    const Users = await ethers.getContractFactory("Users");
    const users = await Users.deploy();
    await users.deployed();

    const [_, address1] = await ethers.getSigners()

    await users.createUser("maxim");
    await users.connect(address1).createUser("magalie")
    await users.connect(address1).mint({value: ethers.utils.parseEther("100.0")})

    assert.equal(await users.connect(address1).getBalance(address1.address), 100000000000000000000)

    const oldBalance = await address1.getBalance()

    await users.connect(address1).burn(ethers.utils.parseEther("50.0"))

    assert.equal(await users.connect(address1).getBalance(address1.address), 50000000000000000000)
    assert.isAbove(await address1.getBalance(), oldBalance)
  })
})

describe("Market", function() {
  it("Should create posts", async function() {
    const EthMarket = await ethers.getContractFactory("EthMarket");
    const ethMarket = await EthMarket.deploy();
    await ethMarket.deployed();

    const [_, address1] = await ethers.getSigners()

    await ethMarket.createUser("maxim");
    await ethMarket.connect(address1).createUser("magalie")
    await ethMarket.createPost("test", "test description", "Tech", "imageUrl", Date.now() + 60, 100)
    await ethMarket.connect(address1).createPost("test2", "test2 description", "Sport", "imageUrl", Date.now() + 60, 1000)

    let postArray = await ethMarket.getPosts()
    postArray = await Promise.all(postArray.map(async i => {
      let post = {
        id: i.id.toString(),
        name: i.name.toString(),
        description: i.description.toString(),
        category: i.category.toString(),
        imageUrl: i.imageUrl.toString(),
        owner: i.owner,
        startDate: i.startDate.toString(),
        endDate: i.endDate.toString(),
        price: i.price.toString(),
        sold: i.sold
      }
      return post
    }))

    assert.equal(postArray[0].id, "1")
    assert.equal(postArray[0].name, "test")
    assert.equal(postArray[0].description, "test description")
    assert.equal(postArray[0].category, "Tech")
    assert.equal(postArray[0].imageUrl, "imageUrl")
    assert.equal(postArray[0].owner, _.address)
    assert.isAbove(parseInt(postArray[0].endDate), parseInt(postArray[0].startDate))
    assert.equal(postArray[0].price, 100)
    assert.equal(postArray[0].sold, false)

    assert.equal(postArray[1].id, "2")
    assert.equal(postArray[1].name, "test2")
    assert.equal(postArray[1].description, "test2 description")
    assert.equal(postArray[1].category, "Sport")
    assert.equal(postArray[1].imageUrl, "imageUrl")
    assert.equal(postArray[1].owner, address1.address)
    assert.isAbove(parseInt(postArray[1].endDate), parseInt(postArray[1].startDate))
    assert.equal(postArray[1].price, 1000)
    assert.equal(postArray[1].sold, false)
  })

  it("Should bid on posts", async function() {
    const EthMarket = await ethers.getContractFactory("EthMarket");
    const ethMarket = await EthMarket.deploy();
    await ethMarket.deployed();

    const [_, address1, address2] = await ethers.getSigners()

    await ethMarket.createUser("maxim");
    await ethMarket.connect(address1).createUser("magalie")
    await ethMarket.connect(address2).createUser("marc")
    await ethMarket.createPost("test", "test description", "Other", "imageUrl", Date.now() + 60, 100)
    await ethMarket.connect(address1).mint({value: 110})
    await ethMarket.connect(address1).bid(1, 110)
    await ethMarket.connect(address2).mint({value: 200})
    await ethMarket.connect(address2).bid(1, 180)
    await ethMarket.connect(address2).bid(1, 190)

    let userBids = await ethMarket.connect(address2).getUserBids();
    userBids = await Promise.all(userBids.map(async i => {
      let bid = {
        id: i.id.toString(),
        postId: i.postId.toString(),
        from: i.from,
        amount: i.amount.toString(),
      }
      return bid
    }))

    assert.equal(userBids[0].id, "2")
    assert.equal(userBids[0].postId, "1")
    assert.equal(userBids[0].from, address2.address)
    assert.equal(userBids[0].amount, "180")

    assert.equal(userBids[1].id, "3")
    assert.equal(userBids[1].postId, "1")
    assert.equal(userBids[1].from, address2.address)
    assert.equal(userBids[1].amount, "190")
    
    let bidsArray = await ethMarket.getBids(1)
    bidsArray = await Promise.all(bidsArray.map(async i => {
      let bid = {
        id: i.id.toString(),
        postId: i.postId.toString(),
        from: i.from,
        amount: i.amount.toString(),
        time: i.time.toString()
      }
      return bid
    }))

    assert.equal(await ethMarket.connect(address1).getBalance(address1.address), 110)
    assert.equal(await ethMarket.connect(address2).getBalance(address2.address), 10)

    assert.equal(bidsArray[0].id, "1")
    assert.equal(bidsArray[0].postId, "1")
    assert.equal(bidsArray[0].from, address1.address)
    assert.equal(bidsArray[0].amount, "110")

    assert.equal(bidsArray[1].id, "2")
    assert.equal(bidsArray[1].postId, "1")
    assert.equal(bidsArray[1].from, address2.address)
    assert.equal(bidsArray[1].amount, "180")
  })

  it("Should sell a post", async function() {
    const EthMarket = await ethers.getContractFactory("EthMarket");
    const ethMarket = await EthMarket.deploy();
    await ethMarket.deployed();

    const [_, address1] = await ethers.getSigners()

    await ethMarket.createUser("maxim");
    await ethMarket.connect(address1).createUser("magalie")
    await ethMarket.createPost("test", "test description", "Cars", "imageUrl", (Math.floor(Date.now()/1000)) + 38, 100)
    await ethMarket.connect(address1).mint({value: 1110})
    await ethMarket.connect(address1).bid(1, 120)
    await ethMarket.sell(1)

    let post = await ethMarket.getPost(1)

    assert.equal(post.sold, true)
    assert.equal(await ethMarket.getBalance(_.address), 120)
  })

  it("Should add a category", async function() {
    const EthMarket = await ethers.getContractFactory("EthMarket");
    const ethMarket = await EthMarket.deploy();
    await ethMarket.deployed();

    const [_, address1] = await ethers.getSigners()

    await ethMarket.createUser("maxim")
    const categories = await ethMarket.getCategories()
    await ethMarket.addCategory("House")
    const categories2 = await ethMarket.getCategories()

    assert.isAbove(categories2.length, categories.length)
    assert.equal(categories[categories.length-1], categories2[categories2.length-2])
  })

  it("Should get the posts of a user", async function() {
    const EthMarket = await ethers.getContractFactory("EthMarket");
    const ethMarket = await EthMarket.deploy();
    await ethMarket.deployed();

    const [_, address1] = await ethers.getSigners()

    await ethMarket.createUser("maxim");
    await ethMarket.connect(address1).createUser("magalie")
    await ethMarket.createPost("test", "test description", "Tech", "imageUrl", Date.now() + 60, 100)
    await ethMarket.createPost("test2", "test2 description", "Tech", "imageUrl", Date.now() + 60, 100)
    await ethMarket.connect(address1).createPost("test3", "test3 description", "Sport", "imageUrl", Date.now() + 60, 1000)

    let postArray = await ethMarket.getUserPosts()
    postArray = await Promise.all(postArray.map(async i => {
      let post = {
        id: i.id.toString(),
        name: i.name.toString(),
        owner: i.owner,
      }
      return post
    }))

    assert.equal(postArray.length, 2)
    
    assert.equal(postArray[0].id, "1")
    assert.equal(postArray[0].name, "test")
    assert.equal(postArray[0].owner, _.address)

    assert.equal(postArray[1].id, "2")
    assert.equal(postArray[1].name, "test2")
    assert.equal(postArray[1].owner, _.address)
  })
})


