var ABI               = JSON.parse('[ { "constant": true, "inputs": [], "name": "bid", "outputs": [ { "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "text", "outputs": [ { "name": "", "type": "string" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [], "name": "acceptOwnership", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "new_text", "type": "string" } ], "name": "bid", "outputs": [ { "name": "success", "type": "bool" } ], "payable": true, "stateMutability": "payable", "type": "function" }, { "constant": true, "inputs": [], "name": "owner", "outputs": [ { "name": "", "type": "address" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "newOwner", "outputs": [ { "name": "", "type": "address" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [], "name": "goodjob", "outputs": [ { "name": "success", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "_newOwner", "type": "address" } ], "name": "transferOwnership", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "payable": true, "stateMutability": "payable", "type": "fallback" }, { "anonymous": false, "inputs": [ { "indexed": true, "name": "_from", "type": "address" }, { "indexed": true, "name": "_to", "type": "address" } ], "name": "OwnershipTransferred", "type": "event" } ]');
var CONTRACT_ADDRESS  = "0x206511bA47E35ae9E1b9d7B001B5C4fD965587F8";

var web3node          = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io/s8lyeWBXvOi6SLSPCjyZ"));

var contract          = web3node.eth.contract(ABI).at(CONTRACT_ADDRESS);

function log(type, message){
    switch (type) {
      case "ok":
        console.log("%c✔ "+message,'color: green');
        break;
      case "e":
      case "error":
        console.log("%c✘ "+message,'color: red');
        break;
      default:
        console.log(message);

    }
}

var maxBid;
function loadContractData(){

  var text  = contract.text();
  var max   = contract.bid();
  maxBid = parseFloat(max)/(10**18);

  var json  = JSON.parse(text);
  var url   = json.u;

  $("#currentBid").text(maxBid);
  setCard(url, max);

}

function setCard(url, bid_value){

    $("#topwebsite a").attr("href", url.replace(/\"/g, ""));
    $("#price_value").text(bid_value/(10**18));
    $.getJSON("http://api.linkpreview.net/?key=5aecf5655ba822e6b9f9c5cdd2f655ddd1a057b4bde82&q="+url, function(result){
        var image = result.image;
        var title = result.title;
        var descr = result.description;

        $("#website_image").attr("src", image);
        $("#website_title").text(title);
        $("#website_description").text(descr);
        $("#topwebsite").show();
        $(".footer").show();
    });

}


function previewBid(){

  var url       = $("#bid_url").val();
  var bid_value = $("#bid_value").val().replace(',', '.');

  setCard(url, parseFloat(bid_value)*(10**18));

}

function submitBid(){
    //user clicked to submit bid
    checkMetamask();
}

var selectedAccount;
var mweb3;
function checkMetamask(){

  if (typeof web3 === 'undefined') {
      log("error", "No metamask detected");
      alert("No MetaMask detected. Please make sure you have it installed and at least account setup.");
  }else{

      mweb3 = new Web3(web3.currentProvider);
      var accounts = mweb3.eth.accounts;
      if( accounts.length == 0 ){
          alert("Almost there! We were not able to see your Ethereum account, please make sure it is setup and unlocked.");
      }else if ( accounts.length == 1 ){
          selectedAccount = accounts[0];
          log("ok", "Valid Account: "+selectedAccount);
          executeBid();
      }else{
          //User has multiple accounts.
          selectAccount();
      }

  }

}

function selectAccount(){
    selectedAccount = accounts[0];
    log("ok", "Multiple accounts. Selected Account: "+selectedAccount);
    executeBid();
    // TODO: ask user to select one of the existent accounts
}

function executeBid(){
    if(!selectedAccount){
      log("error", "No account selected");
      return;
    }

    if(!mweb3){
      log("error", "No ETH browser found");
      return;
    }


    var url       = $("#bid_url").val();
    var bid_value = parseFloat($("#bid_value").val().replace(',', '.'));

    if(url.length <= 0 || !isValidURL(url)){
      alert("Invalid URL");
      return;
    }

    if( isNaN(bid_value) || bid_value <= maxBid ){
      alert("The bid value should be higher than the current one.");
      return;
    }

    var mcontract = mweb3.eth.contract(ABI).at(CONTRACT_ADDRESS);
    mcontract.bid['string']('{ "u": "'+url+'" }',
    {
  	   from: selectedAccount,
       gas: 210000,
       gasPrice: web3.toWei('3', 'gwei'),
       value: bid_value * 10 ** 18
  	}, function (error, txHash) {
       if( error ){
         log("error", "ERROR: ");
         console.log(error);
       }

       if( txHash ){
         log("ok", "RESULT:");
         console.log(txHash);
         finishedTransation(txHash);
       }
  	})

}


function finishedTransation(txHash){
  $("#createBid").slideUp(200);
  $("#finishedTransation").show();

  $("#viewTransactionLink").attr("href", "https://etherscan.io/tx/"+txHash);
}


function loadParticles(){
  particlesJS.load('particles-js', 'assets/particlesjs-config.json', function() {
    console.log('callback - particles.js config loaded');
  });
}
$(function(){
  //loadParticles();
  loadContractData();
});

var elm;
function isValidURL(u){
  if(!elm){
    elm = document.createElement('input');
    elm.setAttribute('type', 'url');
  }

  if (u.indexOf("http") < 0) {
    u = "http://" + u;
  }

  elm.value = u;
  return elm.validity.valid;
}
