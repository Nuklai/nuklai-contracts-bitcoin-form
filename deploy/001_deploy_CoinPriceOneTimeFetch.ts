import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, ethers } = hre;
  const { deploy } = deployments;

  const { admin } = await getNamedAccounts();

  const coinPriceDataFeed = await ethers.getContract('MockV3Aggregator');
  const coinPriceDataFeedAddress = await coinPriceDataFeed.getAddress();

  const deployedPriceFetch = await deploy('CoinPriceOneTimeFetch', {
    from: admin,
    args: [coinPriceDataFeedAddress],
  });

  console.log('CoinPriceOneTimeFetch deployed successfully at', deployedPriceFetch.address);

  if (process.env.TEST !== 'true') await hre.run('etherscan-verify');
};

export default func;
func.tags = ['CoinPriceOneTimeFetch'];
