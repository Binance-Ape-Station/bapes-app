import axios from 'axios';
import { BigNumber, utils } from 'ethers';
import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import AstroMoImg from 'src/assets/images/astro-mo.png';
import AstroRmImg from 'src/assets/images/astro-rm.png';
import MoonImg from 'src/assets/images/moon.png';
import PlanetBg from 'src/assets/images/planet.png';
import StarGif from 'src/assets/images/star.gif';
import WinnerSvg from 'src/assets/images/winner.svg';
import MoonSound from 'src/assets/sounds/moon.mp3';
import { AVERAGE_BLOCK_TIME_IN_SECS, BAPES_API_LOGS_ENDPOINT, BAPES_API_SUMMARY_ENDPOINT, BAPES_PROPULSOR, BAPES_TOKEN, BAPES_TOKEN_DECIMALS, BAPES_TOKEN_TOTAL_SUPPLY, DEXT_LINK, PCS_BUY_LINK, PKP_BUY_LINK, PROPULSION_DEMO_LINK, TELEGRAM_LINK } from 'src/constants';
import { useActiveWeb3React } from 'src/hooks';
import { usePropulsorContract, useTokenContract } from 'src/hooks/useContract';
import { getEtherscanLink, shortenAddress } from 'src/utils';
import { useSound } from 'use-sound';

const MoonSoundWrapper = () => {
  const [play, { stop }] = useSound(MoonSound, { volume: 0.6, interrupt: true });

  const soundEnabled = useSelector(state => state.app.soundEnabled);
  useEffect(() => {
    if (!soundEnabled) stop();
  }, [soundEnabled]);

  return <img src={AstroRmImg} onClick={() => soundEnabled && play()} style={{ cursor: 'pointer' }} />;
};

const Home = (props) => {
  /************* anchors **************/

  useLayoutEffect(() => {
    const currentLocation = window.location.href;
    const hasAnchor = currentLocation.includes('/#');
    if (hasAnchor) {
      const anchorId = `${currentLocation.substring(currentLocation.indexOf('#') + 1)}`;
      const anchorEl = document.getElementById(anchorId);
      if (anchorEl) anchorEl.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const { account, chainId, library } = useActiveWeb3React();

  const tokenContractAddr = BAPES_TOKEN[chainId];
  const tokenContract = useTokenContract(tokenContractAddr);

  const propulsorContractAddr = BAPES_PROPULSOR[chainId];
  const propulsorContract = usePropulsorContract(propulsorContractAddr);

  /************* stats **************/

  const [price, setPrice] = useState(0);
  const [hodlers, setHodlers] = useState(0);
  const [marketCap, setMarketCap] = useState(0);
  const [burned, setBurned] = useState(0);

  const refreshStats = async () => {
    const totalSupply = await tokenContract.totalSupply();
    const totalSupplyFormat = parseFloat(utils.formatUnits(totalSupply, 18));

    const { data } = await axios.get(BAPES_API_SUMMARY_ENDPOINT);
    if (data && data.result) {
      const price = data.bscscan.price;
      setPrice(price);

      setHodlers(data.bscscan.addresses);
      setMarketCap(price * totalSupplyFormat);
      setBurned(BAPES_TOKEN_TOTAL_SUPPLY - totalSupplyFormat);
    }
  };

  /************* propulsions **************/

  const [minStakingToBePropelled, setMinStakingToBePropelled] = useState(0);
  const [lastPropulsionBlock, setLastPropulsionBlock] = useState(0);
  const [blocksBetweenPropulsion, setBlocksBetweenPropulsion] = useState(0);
  const [remainingSecondsForPropulsion, setRemainingSecondsForPropulsion] = useState(-1);
  const [fuelToWin, setFuelToWin] = useState(0);

  const refreshFuelToWin = ({ preventReset } = { preventReset: false }) => {
    propulsorContract.getFuelToWin().then(fuelToWin => {
      const fuelToWinFormat = parseFloat(utils.formatUnits(fuelToWin, 18));
      if (preventReset && fuelToWinFormat < fuelToWin) return;

      setFuelToWin(fuelToWinFormat);
    });
  };

  const refreshPropulsionsInfos = async () => {
    propulsorContract.getMinStakingToBePropelled().then(minStakingToBePropelled => {
      const minStakingToBePropelledFormat = parseFloat(utils.formatUnits(minStakingToBePropelled, 18));
      setMinStakingToBePropelled(minStakingToBePropelledFormat);
    });

    propulsorContract.getBlocksBetweenPropulsion().then(blocksBetweenPropulsion => {
      const blocksBetweenPropulsionNumber = blocksBetweenPropulsion.toNumber();
      setBlocksBetweenPropulsion(blocksBetweenPropulsionNumber);
    });

    const lastPropulsionBlock = await propulsorContract.getBlockLastPropulsion();
    const lastPropulsionBlockNumber = lastPropulsionBlock.toNumber();
    setLastPropulsionBlock(lastPropulsionBlockNumber);
  };

  const onPropulsionStart = () => {
    setRemainingSecondsForPropulsion(0);
  };

  const onPropulsionEnd = async () => {
    refreshFuelToWin();
    refreshHistory();

    await refreshPropulsionsInfos();
    refreshTimer();
  };

  useEffect(() => {
    window.addEventListener('StakerPropelledStart', onPropulsionStart);
    window.addEventListener('StakerPropelledEnd', onPropulsionEnd);
    return () => {
      window.removeEventListener('StakerPropelledEnd', onPropulsionEnd);
      window.removeEventListener('StakerPropelledStart', onPropulsionStart);
    };
  }, []);

  /************* timer **************/

  const [remainingDays, setRemainingDays] = useState('00');
  const [remainingHours, setRemainingHours] = useState('00');
  const [remainingMinutes, setRemainingMinutes] = useState('00');
  const [remainingSeconds, setRemainingSeconds] = useState('00');
  const [remainingMillis, setRemainingMillis] = useState('0');

  const isReady = useMemo(() => remainingHours == '00' && remainingHours == '00' && remainingMinutes == '00' && remainingSeconds == '00' && remainingMillis == '00', [
    remainingDays,
    remainingHours,
    remainingMinutes,
    remainingSeconds,
    remainingMillis,
  ]);

  useEffect(() => {
    const nextPropulsion = new Date().getTime() + remainingSecondsForPropulsion * 1000;
    const ms = 10,
      s = 1000,
      m = s * 60,
      h = m * 60,
      d = h * 24;

    const timerInterval = setInterval(() => {
      const now = new Date().getTime();
      const remainingMs = nextPropulsion - now;

      let 
        days = 0,
        hours = 0,
        minutes = 0,
        seconds = 0,
        millis = 0;
      if (remainingMs >= 0) {
        days = Math.floor(remainingMs / d);
        hours = Math.floor((remainingMs % d) / h);
        minutes = Math.floor((remainingMs % h) / m);
        seconds = Math.floor((remainingMs % m) / s);
        millis = Math.floor((remainingMs % s) / ms);
      }

      setRemainingDays(days.toString().padStart(2, '0'));
      setRemainingHours(hours.toString().padStart(2, '0'));
      setRemainingMinutes(minutes.toString().padStart(2, '0'));
      setRemainingSeconds(seconds.toString().padStart(2, '0'));
      setRemainingMillis(millis.toString().padStart(2, '0'));
    }, 0);

    return () => clearInterval(timerInterval);
  }, [remainingSecondsForPropulsion]);

  async function refreshTimer() {
    const currentBlock = await library.getBlockNumber();
    const elapsedBlockSinceLastPropulsion = currentBlock - lastPropulsionBlock;

    let remainingBlocksForPropulsion = blocksBetweenPropulsion - elapsedBlockSinceLastPropulsion;
    if (remainingBlocksForPropulsion < 0) remainingBlocksForPropulsion = 0;

    setRemainingSecondsForPropulsion(remainingBlocksForPropulsion * AVERAGE_BLOCK_TIME_IN_SECS);
  }

  useEffect(() => {
    if (lastPropulsionBlock == 0 || blocksBetweenPropulsion == 0) return;
    // refreshTimer();

    const refreshInterval = setInterval(() => {
      // refreshTimer();
    }, 9500);

    return () => clearInterval(refreshInterval);
  }, [lastPropulsionBlock, blocksBetweenPropulsion]);

  /************* history **************/

  const [history, setHistory] = useState([]);

  const refreshHistory = async () => {
    try {
      /*
      const stakerPropelledTopic = propulsorContract.filters.StakerPropelled().topics[0];

      const contractLogs = await library.getLogs({
        address: propulsorContract.address,
        fromBlock: library.getBlockNumber().then(b => b - 4990),
        toBlock: 'latest',
        topics: [[stakerPropelledTopic]],
      });

      const lastPropulsions = await Promise.all(
        contractLogs
          .reverse()
          .slice(0, 3)
          .map(async x => {
            const parsedLog = propulsorContract.interface.parseLog(x);
            const fuelEarnedFormat = parseFloat(utils.formatUnits(parsedLog.args.fuelEarned, 18)).toFixed(BAPES_TOKEN_DECIMALS);

            const block = await library.getBlock(x.blockHash);
            const date = Intl.DateTimeFormat('en-US', { month: 'long', day: '2-digit', hour: 'numeric', minute: 'numeric', hourCycle: 'h24' }).format(new Date(block.timestamp * 1000));

            return {
              name: parsedLog.name,
              transactionHash: x.transactionHash,
              date,
              astronaut: parsedLog.args.staker,
              reward: fuelEarnedFormat,
            };
          })
      );
      */

      let lastPropulsions = [];

      const fromBlock = library.getBlockNumber().then(b => b - 4990);
      const propulsorContractAddr = propulsorContract.address;

      const { data } = await axios.get(BAPES_API_LOGS_ENDPOINT.replace('{fromBlock}', fromBlock).replace('{contractAddr}', propulsorContractAddr));
      if (data && data.result) {
        lastPropulsions = await Promise.all(
          data.result
            .reverse()
            .slice(0, 6)
            .map(async x => {
              const parsedLog = propulsorContract.interface.parseLog(x);
              const fuelEarnedFormat = parseFloat(utils.formatUnits(parsedLog.args.fuelEarned, 18)).toFixed(BAPES_TOKEN_DECIMALS);

              const timestampBN = BigNumber.from(x.timeStamp);
              const date = Intl.DateTimeFormat('en-US', { month: 'long', day: '2-digit', hour: 'numeric', minute: 'numeric', hourCycle: 'h24' }).format(
                new Date(timestampBN.toNumber() * 1000)
              );

              return {
                name: parsedLog.name,
                transactionHash: x.transactionHash,
                date,
                astronaut: parsedLog.args.staker,
                reward: fuelEarnedFormat,
              };
            })
        );
      }

      setHistory(lastPropulsions);
    } catch (err) {
      console.error(err);
    }
  };

  /************* init **************/

  const { onLoadingFinished } = props;

  useEffect(() => {
    refreshStats();
    refreshFuelToWin();
    refreshPropulsionsInfos();
    refreshHistory();

    onLoadingFinished();

    const refreshInterval = setInterval(() => {
      refreshStats();
      refreshFuelToWin({ preventReset: true });
    }, 15000);

    return () => clearInterval(refreshInterval);
  }, [account, chainId]);

  useEffect(() => {
    const now = new Date();
    const launch = new Date(1651345200000);
    const secondsUntilLaunchDate = (launch.getTime() - now.getTime()) / 1000;

    setRemainingSecondsForPropulsion(secondsUntilLaunchDate);
  }, []);

  return (
    <main>
      <div id="hero">
        <div className="ct">
          <div className="sub">Welcome to</div>
          <h1>
            <strong>Binance Ape Station</strong> <small>Your space journey begins here</small>
          </h1>

          <div className="tx">
            <p>Binance Ape Station (BAPES) is a deflationary utility token, governed by simple yet powerful BNB smart contracts that give power back to the holders.</p>
            <p style={{ marginTop: 10 }}>
              Fees are generated from each BAPES trade or transfer. Part of these fees are burned and the rest is pooled into the Propulsor.
              <br />
              Every 12 hours, the Propulsor starts up then propels randomly a BAPES holder into space.{' '}
              <span style={{ color: '#f4cf63' }}>This lucky apestronaut receives all of the fees that was pooled during the previous period!</span>
            </p>
          </div>

          <a href={PCS_BUY_LINK} target="_blank" className="btn">
            Buy BAPES 🍌
          </a>

          <Link id="propulsator-link" to="/propulsor" className="btn-propulsor go">
            Propulsor 🐵
          </Link>
        </div>
        <div className="ixi">
          <img src={PlanetBg} />
        </div>
      </div>
      <div id="nb">
        <div className="ct">
          <ul>
            <li>
              <div className="bck b-y">
                <i className="fal fa-wallet"></i>
              </div>
              <div>
                <div className="sub">BAPES Price</div>
                <strong className="c-y">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price)}</strong>
              </div>
            </li>
            {/*
            <li>
              <div className="bck b-r">
                <i className="fal fa-money-bill-wave"></i>
              </div>
              <div>
                <div className="sub">Number of hodlers</div>
                <strong className="c-r">{hodlers}</strong>
              </div>
            </li>
            */}
            <li>
              <div className="bck b-p">
                <i className="fal fa-store"></i>
              </div>
              <div>
                <div className="sub">BAPES Market Cap</div>
                <strong className="c-p">{marketCap && new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(marketCap)}</strong>
              </div>
            </li>
            <li>
              <div className="bck b-b">
                <i className="fal fa-fire"></i>
              </div>
              <div>
                <div className="sub">Total BAPES Burned</div>
                <strong className="c-b">{burned.toFixed(BAPES_TOKEN_DECIMALS)}</strong>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <div id="propulsion">
        <div className="ct">
          <div className="sub">Next propulsion in</div>
          <time id="timer">
            {remainingSecondsForPropulsion < 0 && <span>Calculation...</span>}
            {remainingSecondsForPropulsion >= 0 && isReady && <span>READY 🚀</span>}
            {remainingSecondsForPropulsion >= 0 && !isReady && (
              <>
                <span id="hours">{remainingDays}</span>:<span id="hours">{remainingHours}</span>:<span id="minutes">{remainingMinutes}</span>:<span id="seconds">{remainingSeconds}</span>:
                <span id="milli">{remainingMillis}</span>
              </>
            )}
          </time>
          {fuelToWin > 0 && <div className="csh">{fuelToWin.toFixed(BAPES_TOKEN_DECIMALS)} BAPES</div>}
          <div className="sub" style={fuelToWin <= 0 ? { marginTop: '6em' } : {}}>
            Previous apestronauts
          </div>
          <table className="tw">
            <thead>
              <tr>
                <th>Date</th>
                <th>Apestronaut</th>
                <th>Reward</th>
              </tr>
            </thead>
            <tbody>
              {history.map(propulsion => {
                return (
                  <tr key={propulsion.transactionHash}>
                    <td className="tw-d">
                      <i className="fal fa-clock"></i> {propulsion.date}
                    </td>
                    <td className="tw-a">
                      <a href={getEtherscanLink(chainId, propulsion.astronaut, 'address')} target="_blank">
                        {shortenAddress(propulsion.astronaut)}
                      </a>
                    </td>
                    <td className="tw-w">{propulsion.reward} BAPES</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {history !== null && history.length > 0 && (
            <a href={getEtherscanLink(chainId, BAPES_PROPULSOR[chainId], null).concat('#events')} target="_blank" className="btn">
              Show more
            </a>
          )}
        </div>
        <div className="wc">
          <div className="wca">
            <div className="wcaa">
              <img src={WinnerSvg} />
            </div>
          </div>
          <div className="wcm">
            <img className="moon" src={MoonImg} />
          </div>
          <img className="star" src={StarGif} />
        </div>
      </div>
      <div id="roadmap">
        <div className="ct">
          <div className="rmc">
            <div className="l">
              <MoonSoundWrapper />
            </div>
            <div className="r">
              <div className="sub">Roadmap</div>
              <h2>Spacemap</h2>
              <ul>
                <li>
                  <div className="ic bg-y" />
                  <div>
                    <div className="sub c-y">Q2 2022</div>
                    <h3 className="c-y">Columbia</h3>
                    <div className="p">
                      <dl>
                        <dd-road>Open-source release on Github of the BAPES smart contracts.</dd-road>
                        <dd-road>Audits completion for Binance Ape Station (BEP-20) and Binance Ape Propulsor.</dd-road>
                        <dd-road>BAPES token Initial DEX Offering through PinkSale.</dd-road>
                        <dd-road>Locking the liquidity for at least 10 years to protect holders.</dd-road>
                        <dd-road>Activation of the Propulsor to start generating fees for apestronauts.</dd-road>
                        <dd-road>Registration on top-tier indexation platforms, CoinMarketCap and CoinGecko.</dd-road>
                        <dd-road>Referencing on top-tier tracking platforms, Blockfolio and Delta.</dd-road>
                        <dd-road>Listing of the BAPES token on mid-tier CEX.</dd-road>
                      </dl>
                    </div>
                  </div>
                </li>
                <li>
                  <div className="ic bg-r" />
                  <div>
                    <div className="sub c-r">Q3 2022</div>
                    <h3 className="c-r">Challenger</h3>
                    <div className="p">
                      <dl>
                        <dd-road>Implementation of a governance platform driven by BAPES holders.</dd-road>
                        <dd-road>Establishment of an advanced DuneAnalytics dashboard integrated on the website.</dd-road>
                        <dd-road>Mobile solutions development to track rewards and on-chain statistics in real time.</dd-road>
                        <dd-road>Launching new community incentives to increase token utility.</dd-road>
                      </dl>
                    </div>
                  </div>
                </li>
                <li>
                  <div className="ic bg-p" />
                  <div>
                    <div className="sub c-p">Q4 2022</div>
                    <h3 className="c-p">Discovery</h3>
                    <div className="p">
                      <dl>
                        <dd-road>Influencers onboarding and sponsorship program.</dd-road>
                        <dd-road>Telegram and Twitter bot development to relay new propulsions.</dd-road>
                        <dd-road>Listing of the BAPES token on top-tier CEX.</dd-road>
                        <dd-road>End of year marketing campaign featuring top-tier media coverages.</dd-road>
                      </dl>
                    </div>
                  </div>
                </li>
                <li>
                  <div className="ic bg-b" />
                  <div>
                    <div className="sub c-b">2023</div>
                    <h3 className="c-b">Atlantis</h3>
                    <div className="p">
                      <dl>
                        <dd-road>Development of the Propulsor V2 aggregating fees from multiple sources.</dd-road>
                        <dd-road>Integration of several other low cost chains to increase adoption.</dd-road>
                        <dd-road>Pooling of multi-chain fees to increase drastically the prize pool.</dd-road>
                        <dd-road style={{ marginTop: 6, fontSize: '1.1em', fontWeight: 'bolder' }}>Stay tuned to our social networks for more... 🚀</dd-road>
                      </dl>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div id="tokenomics">
        <div className="ct">
          <div className="moc">
            <div className="sub">Tokenomics</div>
            <h2 className="h2">$BAPES</h2>
            <ul>
              <li>
                <small>Total supply</small>
                <strong className="c-y">200 000 000</strong>
              </li>
              <li>
                <small>Circulating supply</small>
                <strong className="c-r">170 000 000</strong>
              </li>
              <li>
                <small>Propulsion</small>
                <strong className="c-p">
                  5% <small>fees</small>
                </strong>
              </li>
              <li>
                <small>Burned</small>
                <strong className="c-b">
                  5% <small>fees</small>
                </strong>
              </li>
            </ul>
            <div className="p">
              <p>
                The total supply of the BAPES token is 200 million. As a community driven project, transparency is our priority, which is why almost all of the existing BAPES tokens are
                in circulation.
              </p>
              <div className="p" style={{ marginBottom: '5px' }}>
                <dl>
                  <dd-road>
                    Liquidity: ➜ <span style={{ fontWeight: 'bold' }}>170 000 000</span> (85%)
                  </dd-road>
                  <dd-road>
                    Marketing ➜ <span style={{ fontWeight: 'bold' }}>20 000 000</span> (10%)
                  </dd-road>
                  <dd-road>
                    Team ➜ <span style={{ fontWeight: 'bold' }}>10 000 000</span> (5%)
                  </dd-road>
                </dl>
              </div>
              <p>A limit of 100 million BAPES burned has been implemented in the token contract to prevent the supply from going to zero.</p>
            </div>
            <a href={PCS_BUY_LINK} target="_blank" className="btn">
              Buy BAPES 🍌
            </a>
          </div>
        </div>
        <img src={AstroMoImg} className="img" />
      </div>
      <div id="faq">
        <div className="ct">
          <div className="sub">FAQ</div>
          <h2 className="h2">Frequently Asked Questions</h2>
          <ul data-faq>
            <li>
              <h3 className="open">
                What is the Binance Ape Station token utility?<i className="fal fa-plus"></i>
              </h3>
              <div className="p">
                <p>
                  $BAPES is employing simple but robust and powerful mechanics. Every time that a transfer occurs on the BAPES token or any trade over PancakeSwap, the following
                  operations are executed:
                </p>
                <ul style={{ marginTop: 0, listStyle: 'initial' }}>
                  <li style={{ marginLeft: 22, marginTop: 0 }}>5% of the amount is burned from the total supply.</li>
                  <li style={{ marginLeft: 22, marginTop: 0 }}>5% of the amount is sent to the Propuslor for the next propulsion.</li>
                </ul>

                <p style={{ marginTop: 12 }}>
                  Every 14,352 blocks which is approximately 12 hours, the Propulsor starts up then propels randomly a BAPES holder into space.
                  <br />
                  This lucky apestronaut receives all of the fees that was pooled during the previous period!
                </p>
              </div>
            </li>

            <li>
              <h3 className="open">
                What is the Propulsor? <i className="fal fa-plus"></i>
              </h3>
              <div className="p">
                <p>The Propulsor is a smart contract that collect fees each time a trade or a transfer occurs on the BAPES token.</p>
              </div>
            </li>

            <li>
              <h3 className="open">
                How to qualify for the next propulsions? <i className="fal fa-plus"></i>
              </h3>
              <div className="p">
                <p>
                  In order to qualify for the next propulsions, and potentially win all of the fees 🍌 collected by the Propulsor, the only thing you have to do is to deposit a minimum
                  of <span style={{ fontWeight: 'bold' }}>{minStakingToBePropelled} BAPES</span> through the <Link to="/propulsor">Propulsor page</Link>.
                </p>
              </div>
            </li>

            <li>
              <h3 className="open">
                How to buy the BAPES token? <i className="fal fa-plus"></i>
              </h3>
              <div className="p">
                {/* PinkSale */}
                <p>
                  You can buy $BAPES directly from PinkSale by{' '}
                  <a href={PKP_BUY_LINK} target="_blank">
                    clicking here
                  </a>
                  .
                </p>

                {/* Listing */}
                {/*
                <p>
                  You can buy $BAPES directly from PancakeSwap 🥞 by{' '}
                  <a href={PCS_BUY_LINK} target="_blank">
                    clicking here
                  </a>
                  .{' '}
                  <span style={{ fontWeight: 'bold' }}>
                    You need to set your slippage to <span style={{ textDecoration: 'underline' }}>at least 12%</span>
                  </span>
                  .<br />
                  You can view the live statistics of the BAPES token on our{' '}
                  <a
                    href={DEXT_LINK}
                    target="_blank"
                   
                  >
                    DexTools page
                  </a>
                  .
                </p>
                */}

                <p style={{ marginTop: 12 }}>
                  📑 The BAPES token is deployed on the BNB Smart Chain, token hash is{' '}
                  <a href={getEtherscanLink(chainId, BAPES_TOKEN[chainId], 'token')} target="_blank">
                    {BAPES_TOKEN[chainId]}
                  </a>
                  .<br />
                </p>
              </div>
            </li>

            <li>
              <h3 className="open">
                How much liquidity will be locked? <i className="fal fa-plus"></i>
              </h3>
              <div className="p">
                <p>
                  <strong>50%</strong> of the raised funds will be locked for at least <strong>10 years</strong>.
                </p>
              </div>
            </li>

            <li>
              <h3 className="open">
                Who is behind this project? <i className="fal fa-plus"></i>
              </h3>
              <div className="p">
                <p>We are a team of 7 crypto-veterans, composed as follows:</p>
                <ul style={{ marginTop: 0, listStyle: 'initial' }}>
                  <li style={{ marginLeft: 20, marginTop: 0 }}>2 &nbsp;Blockchain engineers.</li>
                  <li style={{ marginLeft: 20, marginTop: 0 }}>1 &nbsp;Front-end developer.</li>
                  <li style={{ marginLeft: 20, marginTop: 0 }}>1 &nbsp;Graphic designer.</li>
                  <li style={{ marginLeft: 20, marginTop: 0 }}>2 &nbsp;Marketing specialist.</li>
                  <li style={{ marginLeft: 20, marginTop: 0 }}>1 &nbsp;Community manager.</li>
                </ul>
              </div>
            </li>

            <li>
              <h3 className="open faq-shake">
                Why my screen is shaking in all directions? <i className="fal fa-plus"></i>
              </h3>
              <div className="p">
                <p>
                  Your screen and possibly the very chair you are sitting in, will begin to shake uncontrollably when one lucky apestronaut is about to win the entire collected fees
                  from the Propulsor.
                </p>
                <p style={{ marginTop: 12, fontWeight: 'bold' }}>
                  Have you never had the chance to see a propulsion live?{' '}
                  <a href={PROPULSION_DEMO_LINK} target="_blank">
                    Click here to see what it looks like.
                  </a>
                </p>
              </div>
            </li>
          </ul>
        </div>
        <div style={{ fontSize: '1em', fontWeight: 'bold', marginTop: 42 }}>
          If you have any further questions, please do not hesitate to join our{' '}
          <a href={TELEGRAM_LINK} target="_blank">
            Telegram
          </a>
          .
        </div>
      </div>
    </main>
  );
};

export default Home;
