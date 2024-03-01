// SPDX-License-Identifier: MIT
pragma solidity =0.8.18;

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Context} from "@openzeppelin/contracts/utils/Context.sol";

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

  function decimals() external view returns (uint8) {
    return coinPriceDataFeed.decimals();
  }

  function coinPair() external view returns (string memory) {
    return _getCoinPair();
  }

  function fetchBtcPrice() external onlyForwarder {
    if (fetched) revert COIN_PRICE_ALREADY_FETCHED(_getCoinPair(), coinPrice);

    fetched = true;
    coinPrice = _getChainlinkDataFeedLatestAnswer();

    emit LatestCoinPrice(_getCoinPair(), coinPrice);
  }

  function setForwarderAddress(address forwarderAddress_) external onlyOwner {
    forwarderAddress = forwarderAddress_;
  }

  function _getCoinPair() internal view returns (string memory) {
    return coinPriceDataFeed.description();
  }

  function _getChainlinkDataFeedLatestAnswer() internal view returns (int256 answer) {
    (, answer, , , ) = coinPriceDataFeed.latestRoundData();
  }
}
