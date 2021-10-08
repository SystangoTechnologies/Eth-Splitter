# Splitter Project
Amount splitter application for ethereum

## What

Contains of a factory contract which acts as a parent to all the child contracts generated.
These child contracts contains a set of ethereum adresses stored in the contract with respective shares in the contract.
Other ethereum accounts can send ethers to this child contract and the received ethers will get splitted to the stored addresses in the respective share that they hold in the contract.

## Installation

Install [ganache](https://github.com/trufflesuite/ganache) running on 127.0.0.1:7545 
or [geth](https://geth.ethereum.org/) to have blockchain access.

Install [MetaMask](https://metamask.io)

Clone or download the repo and use npm to install the required dependencies (truffle and lite-server).

```bash
npm install
```

## Compile and migrate the contracts

```bash
truffle compile
truffle migrate
```

## Test

```bash
npm run test
```
or

```bash
truffle test --show-events
```

## Contributing
Pull requests are welcome. Be free to discuss what you would like to change.

## License
[Apache-2.0](https://choosealicense.com/licenses/apache-2.0/)
