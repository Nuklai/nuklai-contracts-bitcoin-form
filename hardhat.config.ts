import 'dotenv/config';
import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-ethers';
import '@nomicfoundation/hardhat-chai-matchers';
import '@nomicfoundation/hardhat-toolbox';
import '@typechain/hardhat';
import 'solidity-coverage';
import 'hardhat-deploy';
import 'hardhat-deploy-ethers';
import 'hardhat-contract-sizer';
import { network } from './utils';

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.18',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    fuji: {
      url: network.getNodeUrl('fuji'),
      accounts: network.getAccounts('fuji'),
      verify: {
        etherscan: {
          apiKey: process.env.ETHERSCAN_API_KEY_FUJI,
        },
      },
    },
    snowtrace: {
      url: network.getNodeUrl('avalanche'),
      accounts: network.getAccounts('avalanche'),
    },
  },
  etherscan: {
    apiKey: {
      snowtrace: 'snowtrace', // apiKey is not required, just set a placeholder
    },
    customChains: [
      {
        network: 'snowtrace',
        chainId: 43114,
        urls: {
          apiURL: 'https://api.routescan.io/v2/network/mainnet/evm/43114/etherscan',
          browserURL: 'https://avalanche.routescan.io',
        },
      },
    ],
  },
  namedAccounts: {
    admin: 0,
    user: 1,
  },
};

export default config;
