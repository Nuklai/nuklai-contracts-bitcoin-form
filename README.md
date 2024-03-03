# Nuklai Bitcoin Price Research Dataset Smart Contracts

This repository contains the smart contracts for the Bitcoin Price Research Dataset

Serves as a helper to fetch the Bitcoin price only once at a specific timestamp. This functionality is crucial for determining the winner of the Bitcoin Price Research Dataset, where the user closest to the price wins the prize. Fetches and stores the latest price of a specified coin pair, in this case BTC/USD pair using [Chainlink Data Feeds](https://docs.chain.link/data-feeds#price-feeds).

In addition, the contract ensures that the fetch operation can only be executed once to prevent duplicate price fetching and it's triggered by using a time-based upkeep contract from [Chainlink Automation](https://automation.chain.link/).

---

#### _Developers are required to have some familiarity with:_

- [Solidity](https://solidity.readthedocs.io/en/latest/)
- [yarn](https://yarnpkg.com/getting-started)
- [TypeScript](https://www.typescriptlang.org/)
- [ethers.js](https://docs.ethers.org/v6/)
- [hardhat](https://hardhat.org/)

---

## Table of Contents

<details>
<summary><strong>Expand</strong></summary>

- [Install](#install)
- [Usage](#usage)
- [Contributing](#contributing)
- [Contracts Description](#contracts-description)

</details>

## Install

To install all the dependencies of this repo, execute the following command:

```bash
yarn
```

or

```bash
yarn install
```

## Usage

### 1. Build contracts

To compile contracts, export ABIs, and generate TypeScript interfaces, execute the following command:

```bash
yarn build
```

### 2. Reset Environment

To remove cached and temporary files, execute the following command:

```bash
yarn clean
```

### 3. Tests

To run all unit tests, execute the following command:

```bash
yarn test
```

### 4. Coverage

To generate a coverage report, execute the following command:

```bash
yarn coverage
```

### 5. Contracts Size

To generate a contracts size report, execute the following command:

```bash
yarn contract-size
```

### 6. Linting

To run linting on all configured source files (`*.sol`, `*.ts`, `*.js`, `*.json`), execute the following command:

```bash
yarn lint
```

## Contracts Description

|       Smart Contract        |                                                                Description                                                                |
| :-------------------------: | :---------------------------------------------------------------------------------------------------------------------------------------: |
| **`CoinPriceOneTimeFetch`** | Generic contract that fetches and store the latest price of a specified coin pair using Chainlink Data Feeds and can be fetched only once |
