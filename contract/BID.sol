pragma solidity ^0.4.18;


// ----------------------------------------------------------------------------
// Owned contract
// ----------------------------------------------------------------------------
contract Owned {
    address public owner;
    address public newOwner;

    event OwnershipTransferred(address indexed _from, address indexed _to);

    constructor() public {
        owner = msg.sender;
    }

    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }

    function transferOwnership(address _newOwner) public onlyOwner {
        newOwner = _newOwner;
    }
    function acceptOwnership() public {
        require(msg.sender == newOwner);
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
        newOwner = address(0);
    }
}


contract BID is Owned {

    uint    public bid      = 0;
    string  public text     = "";

    function bid(string new_text) public payable returns (bool success) {

        require( msg.value > bid );
        require( bytes(new_text).length <= 90 );

        bid  = msg.value;
        text = new_text;

        return true;
    }

    function goodjob() public onlyOwner returns (bool success) {
        owner.transfer(address(this).balance);
        return true;
    }

    function () public payable { }

}
