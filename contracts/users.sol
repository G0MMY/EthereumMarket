pragma solidity ^0.8.4;

contract Users {
    address owner;

    struct singleBid {
        uint256 id;
        uint256 postId;
    }
    struct singleUser {
        address addr;
        string name;
        uint256 balance;
        uint256[] posts;
        singleBid[] bids;
        bool active;
    }

    modifier userDoesntExists(){
        require(users[msg.sender].active == false, "already a user with this address");
        _;
    }
    modifier userExists(){
        require(users[msg.sender].active == true, "user dosen't exist");
        _;
    }
    modifier isOwner(){
        require(msg.sender == owner, "You are not the owner");
        _;
    }

    event UserCreated(string name, address addr);
    event UserDeleted(address addr);
    event Deposit(address addr, uint256 amount);
    event Burn(address addr, uint256 amount);

    mapping(address => singleUser) internal users;
    address[] usersAddress;
    uint256 nbrUsers;

    constructor(){
        owner = msg.sender;
        nbrUsers = 0;
    }

    function getBalance(address who) public view returns(uint256) {
        require(users[who].active, "user dosen't exist");
        require(who == msg.sender, "you can't look at the balance of someone else");

        return users[who].balance;
    }

    function isUser() public view returns(bool) {
        if (users[msg.sender].active){
            return true;
        }
        return false;
    }

    function getUsername(address who) public view returns(string memory) {
        require(users[who].active, "No user with this address");

        return users[who].name;
    }

    function getUsernames(address[] memory who) public view returns(string[] memory) {
        string[] memory result = new string[](who.length);
        for (uint i=0;i<who.length;i++){
            require(users[who[i]].active, "No user with this address");
            result[i] = users[who[i]].name;
        }
        return result;
    }

    function createUser(string memory name) public userDoesntExists() {
        singleUser storage user = users[msg.sender];

        user.active = true;
        user.addr = msg.sender;
        user.balance = 0;
        user.name = name;

        usersAddress.push(msg.sender);
        nbrUsers += 1;

        emit UserCreated(name, msg.sender);
    }

    function deleteUser() public userExists() {
        if (users[msg.sender].balance > 0){
            (bool sent, bytes memory data) = msg.sender.call{value: users[msg.sender].balance}("");
            require(sent, "failed to send ether");
        }

        singleUser storage user = users[msg.sender];

        user.active = false;
        user.addr = address(0x0);
        user.balance = 0;
        user.name = "";

        uint256 i = 0;
        while (usersAddress[i] != msg.sender){
            i += 1;
        }
        delete usersAddress[i];
        nbrUsers -= 1;

        emit UserDeleted(msg.sender);
    }

    function linkPost(uint256 id) internal userExists(){
        users[msg.sender].posts.push(id);
    }

    function linkBid(uint256 id, uint256 postId) internal userExists(){
        users[msg.sender].bids.push(singleBid(id, postId));
    }

    function mint() public payable userExists() {
        require(msg.value > 0, "You need to send ether");

        users[msg.sender].balance += msg.value;

        emit Deposit(msg.sender, msg.value);
    }

    function burn(uint256 amount) public userExists() {
        require(amount > 0, "You need to specify an amount greater then 0");
        require(users[msg.sender].balance >= amount, "You don't have enough money");

        (bool sent, bytes memory data) = msg.sender.call{value: amount}("");
        require(sent, "failed to send ether");

        users[msg.sender].balance -= amount;

        emit Burn(msg.sender, amount);
    }

    function getContractBalance() public view isOwner() returns(uint256) {
        return address(this).balance;
    }

}