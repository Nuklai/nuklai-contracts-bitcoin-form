// SPDX-License-Identifier: MIT
pragma solidity =0.8.18;

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Context} from "@openzeppelin/contracts/utils/Context.sol";

/**
 * @title CoinPriceOneTimeFetch contract
 * @author Nuklai
 * @notice This contract fetches the coin pair price from Chainlink Data Feeds contracts once at timestamp.
 * It is used along Chainlink Automation using a time-based upkeep contract that will fetch the price at timestamp.
 */
contract CoinPriceOneTimeFetch is Context, Ownable {
  error NOT_FORWARDER(address forwarder, address sender);
  error COIN_PRICE_ALREADY_FETCHED(string coinPair, int256 lastestCoinPrice);

  event LatestCoinPrice(string indexed coinPair, int256 indexed price);

  AggregatorV3Interface public coinPriceDataFeed;
  address public forwarderAddress;
  int256 public coinPrice;
  bool public fetched;

  modifier onlyForwarder() {
    if (_msgSender() != forwarderAddress) revert NOT_FORWARDER(forwarderAddress, _msgSender());
    _;
  }

  constructor(address coinPriceDataFeed_) {
    coinPriceDataFeed = AggregatorV3Interface(coinPriceDataFeed_);
  }

  /**
   * @notice Fetches the lastest coin price from the Chailink data feed.
   * @dev This function is callable only once at timestamp.
   * Only callable by the forwarder address of the upkeep contract deployed on Chalink Automation.
   * Emits a {LatestCoinPrice} event.
   */
  function fetchCoinPrice() external onlyForwarder {
    if (fetched) revert COIN_PRICE_ALREADY_FETCHED(_getCoinPair(), coinPrice);
    fetched = true;
    coinPrice = _getChainlinkDataFeedLatestAnswer();
    emit LatestCoinPrice(_getCoinPair(), coinPrice);
  }

  /**
   * @notice Sets the forwarder address that will execute fetchCoinPrice().
   * @dev The forwarder needs to be set just only after the deployment of the upkeep contract.
   * Only callable by the owner of the contract.
   * @param forwarderAddress_ The address of the forwarder from the upkeep contract.
   */
  function setForwarderAddress(address forwarderAddress_) external onlyOwner {
    forwarderAddress = forwarderAddress_;
  }

  /**
   * @notice Retrieves decimals of the data feed coin pair.
   * @return uint8 The decimals of the coin pair data feed.
   */
  function decimals() external view returns (uint8) {
    return coinPriceDataFeed.decimals();
  }

  /**
   * @notice Retrieves the data feed coin pair.
   * @return string The data feed coin pair, e.g. BTC/USD.
   */
  function coinPair() external view returns (string memory) {
    return _getCoinPair();
  }

  /**
   * @notice Internal function that retrieves the data feed coin pair.
   * @return string The data feed coin pair, e.g. BTC/USD.
   */
  function _getCoinPair() internal view returns (string memory) {
    return coinPriceDataFeed.description();
  }

  /**
   * @notice Internal function that retrieves the coin price from the data feed.
   * @return answer The price of the coin pair.
   */
  function _getChainlinkDataFeedLatestAnswer() internal view returns (int256 answer) {
    (, answer, , , ) = coinPriceDataFeed.latestRoundData();
  }
}
