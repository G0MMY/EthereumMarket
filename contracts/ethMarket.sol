pragma solidity ^0.8.4;

import './users.sol';

contract EthMarket is Users {

    struct Post {
        uint256 id;
        string name;
        string description;
        string category;
        string imageUrl;
        address owner;
        uint256 startDate;
        uint256 endDate;
        uint256 price;
        bool sold;
    }
    struct Bid {
        uint256 id;
        uint256 postId;
        address from;
        uint256 amount;
        uint256 time;
    }

    string[] categories = ["Sport", "Tech", "Cars", "Clothes", "Furnishing", "Other"];
    mapping(uint256 => Post) public posts;
    mapping(uint256 => Bid[]) public bids;

    uint256 nbrPosts;
    uint256 nbrBids;

    modifier createVerifier(string memory name, string memory desc, string memory image, uint256 endDate, uint256 price) {
        require(!compareStrings(name, ""), "name can't be empty");
        require(!compareStrings(desc, ""), "description can't be empty");
        require(!compareStrings(image, ""), "image url can't be empty");
        require(endDate > block.timestamp, "post has to be posted longer");
        require(price > 0, "the post price can't be free");
        _;
    }
    modifier activePost(uint256 id) {
        require(id <= nbrPosts, "invalid id");
        require(!posts[id].sold, "post already sold");
        _;
    }
    modifier inactivePost(uint256 id) {
        require(posts[id].endDate <= block.timestamp, "post still ative");
        _;
    }
    modifier hasBids(uint256 id) {
        require(bids[id].length > 0, "no one wants to buy yor product");
        _;
    }

    event CreatePost(uint256 id, string name, string desc, string category, string image, address owner, uint256 price);
    event CreateBid(address from, uint256 id, uint256 postId, uint256 amount);
    event Sold(uint256 postId, address to, address from, uint256 amount);
    event AddCategory(string category);

    constructor() {
        nbrBids = 0;
        nbrPosts = 0;
    }

    function getCategories() public view returns(string[] memory) {
        return categories;
    }

    function addCategory(string memory category) public {
        require(!checkCategory(category), "category already exists");
        require(msg.sender == Users.owner, "only the admin can call this function");

        categories.push(category);

        emit AddCategory(category);
    }

    function checkCategory(string memory category) internal view returns(bool){
        bool check = false;
        for (uint256 i=0;i<categories.length;i++){
            if (compareStrings(categories[i], category)){
                check = true;
            }
        }
        return check;
    }

    function createPost(string memory name, string memory desc, string memory category, string memory image, uint256 endDate, uint256 price) public createVerifier(name, desc, image, endDate, price) {
        require(checkCategory(category), "invalid category");
        checkCategory(category);
        nbrPosts += 1;
        posts[nbrPosts] = Post(nbrPosts, name, desc, category, image, msg.sender, block.timestamp, endDate, price, false);
        Users.linkPost(nbrPosts);

        emit CreatePost(nbrPosts, name, desc, category, image, msg.sender, price);
    }

    function getPosts() public view returns(Post[] memory) {
        Post[] memory result = new Post[](nbrPosts);
        for (uint i=0;i<nbrPosts;i++){
            if (!posts[i+1].sold && posts[i+1].endDate > block.timestamp){
                result[i] = posts[i+1];
            }
        }
        return result;
    }

    function getUserPosts() public view returns(Post[] memory) {
        require(Users.isUser(), "You are not a user");

        uint256 nbrUserPosts = Users.users[msg.sender].posts.length;
        Post[] memory result = new Post[](nbrUserPosts);
        for (uint i=0;i<nbrUserPosts;i++){
            result[i] = posts[Users.users[msg.sender].posts[i]];
        }
        return result;
    }

    function getPost(uint256 id) public view returns(Post memory){
        require(id <= nbrPosts, "id ins't good");

        return posts[id];
    }

    function getBids(uint256 postId) public view returns(Bid[] memory) {
        require(postId <= nbrPosts, "id ins't good");

        return bids[postId];
    }

    function getUserBids() public view returns(Bid[] memory) {
        require(Users.isUser(), "You are not a user");

        uint256 nbrUserBids = Users.users[msg.sender].bids.length;
        Bid[] memory result = new Bid[](nbrUserBids);
        for (uint i=0;i<nbrUserBids;i++){
            uint256 postId = Users.users[msg.sender].bids[i].postId;
            uint256 index = 0;
            for (uint j=0;j<bids[postId].length;j++){
                if (Users.users[msg.sender].bids[i].id == bids[postId][j].id){
                    index = j;
                }
            }
            result[i] = bids[postId][index];
        }
        return result;
    }

    function bid(uint256 postId, uint256 amount) public {
        require(msg.sender != posts[postId].owner, "You can't bid on your post");
   
        uint256 len = bids[postId].length;
        if (len > 0){
            if (bids[postId][len - 1].from == msg.sender){
                require(bids[postId][len - 1].amount + Users.getBalance(msg.sender) >= bids[postId][len - 1].amount, "overflow");
            } 
            else {
                require(Users.getBalance(msg.sender) >= amount, "You don't have enough funds");
            }
            require(bids[postId][len -1].amount < amount, "You have to bid higher");
            Users.users[bids[postId][len -1].from].balance += bids[postId][len -1].amount;
        }

        nbrBids += 1;
        bids[postId].push(Bid(nbrBids, postId, msg.sender, amount, block.timestamp));
        Users.users[msg.sender].balance -= amount;
        Users.linkBid(nbrBids, postId);

        emit CreateBid(msg.sender, nbrBids, postId, amount);
    }

    function sell(uint256 postId) public inactivePost(postId) activePost(postId) hasBids(postId) {
        Users.users[posts[postId].owner].balance += bids[postId][bids[postId].length - 1].amount;
        posts[postId].sold = true;

        emit Sold(postId, posts[postId].owner, bids[postId][bids[postId].length - 1].from, bids[postId][bids[postId].length - 1].amount);
    }

    function compareStrings(string memory a, string memory b) private pure returns (bool) {
        return (keccak256(abi.encodePacked((a))) == keccak256(abi.encodePacked((b))));
    }

}