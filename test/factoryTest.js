const Factory = artifacts.require("Factory.sol");
const Splitter = artifacts.require("Splitter.sol");
const BN = web3.utils.toBN;

contract('Factory', (accounts) => {
  let factoryInstance, splitterInstance;
  let alice = accounts[0];
  let bob = accounts[1];
  let bruce = accounts[2];
  let johny = accounts[7];
  let carol = accounts[8];
  let frank = accounts[9];
  let johnyShare = 10;
  let carolShare = 30;
  let frankShare = 60;
  let payee = [johny, carol, frank];
  let share = [johnyShare, carolShare, frankShare];

  before("Deploy new Factory", async function () {
    await Factory.new({ from: alice }).then(instance => factoryInstance = instance);
  });

  it('Should create a new Splitter', async () => {
    const { logs } = await factoryInstance.registerContract(bruce, payee, share);
    const splitterAddress = logs[0].args.contractAddress;
    splitterInstance = await Splitter.at(splitterAddress);
    assert.ok(splitterInstance);
  });

  it('Should change ownership of Splitter', async () => {
    const newOwner = await splitterInstance.owner();
    assert.equal(newOwner, bruce);
  });

});