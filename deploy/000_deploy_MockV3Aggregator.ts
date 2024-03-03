import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { TEST_DATA_FEED_DECIMALS, TEST_DATA_FEED_INITIAL_ANSWER } from '../utils/constants';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const { chainlink } = await getNamedAccounts();

  const deployedV3Aggregator = await deploy('MockV3Aggregator', {
    from: chainlink,
    args: [TEST_DATA_FEED_DECIMALS, TEST_DATA_FEED_INITIAL_ANSWER],
  });

  console.log('MockV3Aggregator deployed successfully at', deployedV3Aggregator.address);

  if (process.env.TEST !== 'true') await hre.run('etherscan-verify');
};

export default func;
func.tags = ['MockV3Aggregator'];
