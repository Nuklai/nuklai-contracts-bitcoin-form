import { CoinPriceOneTimeFetch, MockV3Aggregator } from '@typechained';
import { expect } from 'chai';
import { ZeroAddress } from 'ethers';
import { deployments, ethers } from 'hardhat';

async function _updateAnswer(v3Aggregator: MockV3Aggregator, newAnswer: bigint) {
  const { chainlink } = await ethers.getNamedSigners();
  await v3Aggregator.connect(chainlink).updateAnswer(newAnswer);
}

async function setup() {
  await deployments.fixture(['MockV3Aggregator', 'CoinPriceOneTimeFetch']);

  const { admin, forwarder } = await ethers.getNamedSigners();

  const _LATEST_COIN_PRICE = 5323612345678n;

  const contracts = {
    _v3Aggregator: (await ethers.getContract('MockV3Aggregator')) as MockV3Aggregator,
    _coinPriceOneTimeFetch: (await ethers.getContract(
      'CoinPriceOneTimeFetch'
    )) as CoinPriceOneTimeFetch,
  };

  await _updateAnswer(contracts._v3Aggregator, _LATEST_COIN_PRICE);

  await contracts._coinPriceOneTimeFetch.connect(admin).setForwarderAddress(forwarder.address);

  return { contracts, _LATEST_COIN_PRICE };
}

export default async function suite(): Promise<void> {
  let snapshot: string;
  let v3Aggregator: MockV3Aggregator;
  let coinPriceOneTimeFetch: CoinPriceOneTimeFetch;
  let latestCoinPrice: bigint;

  describe('CoinPriceOneTimeFetch', async () => {
    before(async () => {
      const { contracts, _LATEST_COIN_PRICE } = await setup();

      v3Aggregator = contracts._v3Aggregator;
      coinPriceOneTimeFetch = contracts._coinPriceOneTimeFetch;
      latestCoinPrice = _LATEST_COIN_PRICE;
    });

    beforeEach(async () => {
      snapshot = await ethers.provider.send('evm_snapshot', []);
    });

    afterEach(async () => {
      await ethers.provider.send('evm_revert', [snapshot]);
    });

    it('should have set a V3Aggregator', async () => {
      expect(await coinPriceOneTimeFetch.coinPriceDataFeed()).to.equal(
        await v3Aggregator.getAddress()
      );
    });

    it('should have the same coin pair from V3Aggregator', async () => {
      expect(await coinPriceOneTimeFetch.coinPair()).to.equal(await v3Aggregator.description());
    });

    it('should have the same decimals from V3Aggregator', async () => {
      expect(await coinPriceOneTimeFetch.decimals()).to.equal(await v3Aggregator.decimals());
    });

    it('should have an owner', async () => {
      const { admin } = await ethers.getNamedSigners();
      expect(await coinPriceOneTimeFetch.owner()).to.equal(admin.address);
    });

    it('should admin set forwarder address', async () => {
      const { admin, forwarderSecond } = await ethers.getNamedSigners();
      await coinPriceOneTimeFetch.connect(admin).setForwarderAddress(forwarderSecond.address);
      expect(await coinPriceOneTimeFetch.forwarderAddress(), forwarderSecond.address);
    });

    it('should revert if user tries to set forwarder address', async () => {
      const { user, forwarderSecond } = await ethers.getNamedSigners();
      await expect(
        coinPriceOneTimeFetch.connect(user).setForwarderAddress(forwarderSecond.address)
      ).to.be.revertedWith('Ownable: caller is not the owner');
    });

    it('should admin be able to renounce to ownership', async () => {
      const { admin } = await ethers.getNamedSigners();
      await expect(coinPriceOneTimeFetch.connect(admin).renounceOwnership())
        .to.emit(coinPriceOneTimeFetch, 'OwnershipTransferred')
        .withArgs(admin.address, ZeroAddress);

      expect(await coinPriceOneTimeFetch.owner()).to.equal(ZeroAddress);
    });

    it('should revert admin set new forwarder address if renounce to ownership', async () => {
      const { admin, forwarderSecond } = await ethers.getNamedSigners();
      await expect(coinPriceOneTimeFetch.connect(admin).renounceOwnership())
        .to.emit(coinPriceOneTimeFetch, 'OwnershipTransferred')
        .withArgs(admin.address, ZeroAddress);

      expect(await coinPriceOneTimeFetch.owner()).to.equal(ZeroAddress);

      await expect(
        coinPriceOneTimeFetch.connect(admin).setForwarderAddress(forwarderSecond.address)
      ).to.be.revertedWith('Ownable: caller is not the owner');
    });

    it('should forwarder fetch coin price', async () => {
      const { forwarder } = await ethers.getNamedSigners();

      expect(await coinPriceOneTimeFetch.coinPrice()).to.equal(0n);

      await expect(coinPriceOneTimeFetch.connect(forwarder).fetchCoinPrice())
        .to.emit(coinPriceOneTimeFetch, 'LatestCoinPrice')
        .withArgs('v0.8/tests/MockV3Aggregator.sol', latestCoinPrice);

      expect(await coinPriceOneTimeFetch.coinPrice()).to.equal(latestCoinPrice);
    });

    it('should revert if forwarder tries to fetch coin price twice', async () => {
      const { forwarder } = await ethers.getNamedSigners();

      expect(await coinPriceOneTimeFetch.coinPrice()).to.equal(0n);

      await expect(coinPriceOneTimeFetch.connect(forwarder).fetchCoinPrice())
        .to.emit(coinPriceOneTimeFetch, 'LatestCoinPrice')
        .withArgs('v0.8/tests/MockV3Aggregator.sol', latestCoinPrice);

      expect(await coinPriceOneTimeFetch.coinPrice()).to.equal(latestCoinPrice);

      await expect(coinPriceOneTimeFetch.connect(forwarder).fetchCoinPrice())
        .to.be.revertedWithCustomError(coinPriceOneTimeFetch, 'COIN_PRICE_ALREADY_FETCHED')
        .withArgs('v0.8/tests/MockV3Aggregator.sol', latestCoinPrice);
    });

    it('should revert if user tries to fetch coin price', async () => {
      const { user, forwarder } = await ethers.getNamedSigners();
      await expect(coinPriceOneTimeFetch.connect(user).fetchCoinPrice())
        .to.be.revertedWithCustomError(coinPriceOneTimeFetch, 'NOT_FORWARDER')
        .withArgs(forwarder.address, user.address);
    });

    it('should retrieve coin price', async () => {
      const { forwarder } = await ethers.getNamedSigners();
      await expect(coinPriceOneTimeFetch.connect(forwarder).fetchCoinPrice())
        .to.emit(coinPriceOneTimeFetch, 'LatestCoinPrice')
        .withArgs('v0.8/tests/MockV3Aggregator.sol', latestCoinPrice);

      expect(await coinPriceOneTimeFetch.coinPrice()).to.equal(latestCoinPrice);
    });

    it('should coin price be 0 if not fetched', async () => {
      expect(await coinPriceOneTimeFetch.coinPrice()).to.equal(0n);
    });

    it('should fetched() be false if coin price has not been fetched', async () => {
      expect(await coinPriceOneTimeFetch.fetched()).to.equal(false);
    });

    it('should fetched() be true after fetching coin price', async () => {
      const { forwarder } = await ethers.getNamedSigners();
      await expect(coinPriceOneTimeFetch.connect(forwarder).fetchCoinPrice())
        .to.emit(coinPriceOneTimeFetch, 'LatestCoinPrice')
        .withArgs('v0.8/tests/MockV3Aggregator.sol', latestCoinPrice);
      expect(await coinPriceOneTimeFetch.fetched()).to.equal(true);
    });
  });
}
