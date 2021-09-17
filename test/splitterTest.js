const Factory = artifacts.require("Factory.sol");
const Splitter = artifacts.require("Splitter.sol");
const BN = web3.utils.toBN;

contract('Splitter', (accounts) => {
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

  before("Deploy new Factory and create a Splitter", async function () {
    await Factory.new({ from: alice }).then(instance => factoryInstance = instance);
    const { logs } = await factoryInstance.registerContract(bruce, payee, share);
    const splitterAddress = logs[0].args.contractAddress;
    splitterInstance = await Splitter.at(splitterAddress);
  });

  it('Should split the balance according to payee share', async () => {
    // Check initial amounts first.
    const balanceJohny = await web3.eth.getBalance(johny);
    const balanceCarol = await web3.eth.getBalance(carol);
    const balanceFrank = await web3.eth.getBalance(frank);

    // Amount to be sent.
    const amount = web3.utils.toWei('1.005', 'ether');

    // Calculate balances expected.
    const expectedBalJohny = new BN(balanceJohny).add((new BN(amount).div(new BN('100'))).mul(new BN(johnyShare)));
    const expectedBalCarol = new BN(balanceCarol).add((new BN(amount).div(new BN('100'))).mul(new BN(carolShare)));
    const expectedBalFrank = new BN(balanceFrank).add((new BN(amount).div(new BN('100'))).mul(new BN(frankShare)));

    // Send Ethers
    const tx = await splitterInstance.sendTransaction({ from: bob, value: amount });
    const { logs } = tx;
    assert.ok(Array.isArray(logs));
    assert.equal(logs.length, 2);
    
    const log = logs[0];
    assert.equal(log.event, 'ReceivedEth');
    assert.equal(log.args.fromAddress.toString(), bob);
    assert.equal(log.args.amount, amount);

    const log1 = logs[1];
    assert.equal(log1.event, 'SplittedEth');
    assert.equal(log.args.amount, amount);

    // Get balances of first and second account after the transactions.
    const balanceJohnyAfterTx = await web3.eth.getBalance(johny);
    const balanceCarolAfterTx = await web3.eth.getBalance(carol);
    const balanceFrankAfterTx = await web3.eth.getBalance(frank);

    // Check
    assert.equal(balanceJohnyAfterTx.toString(), expectedBalJohny.toString(), "Balance error in account[7]")
    assert.equal(balanceCarolAfterTx.toString(), expectedBalCarol.toString(), "Balance error in account[8]")
    assert.equal(balanceFrankAfterTx.toString(), expectedBalFrank.toString(), "Balance error in account[9]")
  });

  it('Should not pause contract by other user', async () => {
    let tx, err;
    try {
      tx = await splitterInstance.pause({ from: alice });
    } catch (ex) {
      err = ex;
    }
    // should not get a result, but an error should have been thrown
    assert.ok(err);
    assert.ok(!tx);

    // check that the error reason is what you expect
    assert.equal(err.reason, 'Not the owner');
  });

  it('Should not kill contract which is not paused', async () => {
    let tx, err;
    try {
      tx = await splitterInstance.kill({ from: bruce });
    } catch (ex) {
      err = ex;
    }
    // should not get a result, but an error should have been thrown
    assert.ok(err);
    assert.ok(!tx);

    // check that the error reason is what you expect
    assert.equal(err.reason, 'Contract not paused');
  });

  it('Should pause contract by Owner', async () => {
    const tx = await splitterInstance.pause({ from: bruce });
    const { logs } = tx;
    assert.ok(Array.isArray(logs));
    assert.equal(logs.length, 1);

    const log = logs[0];
    assert.equal(log.event, 'LogPaused');
    assert.equal(log.args.account.toString(), bruce);
  });

  it('Should kill a paused contract by Owner', async () => {
    const tx = await splitterInstance.kill({ from: bruce });
    const { logs } = tx;
    assert.ok(Array.isArray(logs));
    assert.equal(logs.length, 1);

    const log = logs[0];
    assert.equal(log.event, 'LogKilled');
    assert.equal(log.args.account.toString(), bruce);
  });

});