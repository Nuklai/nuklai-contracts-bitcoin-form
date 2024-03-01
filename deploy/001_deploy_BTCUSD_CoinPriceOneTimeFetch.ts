import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { BTC_USD_DATA_FEED_CONTRACT } from '../utils/constants';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, getChainId } = hre;
  const { deploy } = deployments;

  const { admin } = await getNamedAccounts();

  const chainId = await getChainId();

  const btcPriceDataFeed = BTC_USD_DATA_FEED_CONTRACT[chainId];

  const deployedPriceFetch = await deploy('CoinPriceOneTimeFetch', {
    from: admin,
    args: [btcPriceDataFeed],
  });

  console.log(
    'BTC/USD CoinPriceOneTimeFetch implementation deployed successfully at',
    deployedPriceFetch.address
  );

  if (process.env.TEST !== 'true') await hre.run('etherscan-verify');
};

export default func;
func.tags = ['BTCUSD_CoinPriceOneTimeFetch'];
