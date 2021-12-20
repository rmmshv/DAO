import { useEffect, useMemo, useState } from "react";
import { useWeb3 } from "@3rdweb/hooks";
import { ThirdwebSDK } from "@3rdweb/sdk";
import { ethers } from "ethers";

// Initiate sdk on Rinkeby
const sdk = new ThirdwebSDK("rinkeby");

// Grab a reference to our ERC-1155 contract
const bundleDropModule = sdk.getBundleDropModule("0x1251B8e51eE36f9f07b3f8e8AE13Dc02a70B3C13");
const tokenModule = sdk.getTokenModule("0x3c79023C61fc9C29c398784a861c7A5ccFB0d257");
const voteModule = sdk.getVoteModule("0x2992af1Ec19a8fBEdbBd041Fc75F0e6C2cA26B72");


const App = () => {
  const { connectWallet, address, error, provider } = useWeb3();
  console.log("Address: ", address);

  const signer = provider ? provider.getSigner() : undefined;
  const [hasClaimedNFT, setHasClaimedNFT] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [memberTokenAmounts, setMemberTokenAmounts] = useState({});
  const [memberAddress, setMemberAddresses] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  // Retrieving all the existing proposals from our contract
  useEffect(() => {
    if(!hasClaimedNFT) { 
      return;
    }

    voteModule.getAll()
    .then((proposals) => {
      setProposals(proposals);
      console.log("🌈 Proposals:", proposals);
    })
    .catch((err) => {
      console.error("Failed to get proposals", err);
    });
  }, [hasClaimedNFT]);

  // Check if the user has already voted
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }
    if (!proposals.length) {
      return;
    }

    voteModule
    .hasVoted(proposals[0].proposalId, address)
    .then((hasVoted) => {
      setHasVoted(hasVoted);
      console.log("🥵 User has already voted")
    })
    .catch((err) => {
      console.error("failed to check if wallet has voted", err);
    });
}, [hasClaimedNFT, proposals, address]);
  
  const shortenAddress = (str) => {
    return str.substring(0, 6) + "..." + str.substring(str.length - 4);
  };
  
  // Grabs all the addresses holding members NFTs
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }
    bundleDropModule
    .getAllClaimerAddresses("0")
    .then((addresess) => {
      console.log("🚀 Members addresses", addresess)
      setMemberAddresses(addresess);
    })
    .catch((err) => {
      console.error("failed to get member list", err);
    });
}, [hasClaimedNFT]);

  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }
    tokenModule
    .getAllHolderBalances()
    .then((amounts) => {
      console.log("👜 Amounts", amounts)
      setMemberTokenAmounts(amounts);
    })
    .catch((err) => {
      console.error("failed to get token amounts", err);
    });
}, [hasClaimedNFT]);

  const memberList = useMemo(() => {
    return memberAddress.map((address) => {
      return {
        address,
        tokenAmount: ethers.utils.formatUnits(
        memberTokenAmounts[address] || 0, 18,),
      };
    });
  }, [memberAddress, memberTokenAmounts]);

  // Pass the signer to the sdk to interact with the contract
  useEffect(() => {
    sdk.setProviderOrSigner(signer);
  }, [signer]);

  useEffect(() => {
    // Exit if the user doesn't have a connected wallet
    if (!address) { return; 
  }
  if (error && error.name === "UnsupportedChainError") {
    return (
      <div className="unsupported-network">
        <h2>Please connect to Rinkeby Testnet</h2>
        <p> This dapp only works on the Rinkeby testnet, please switch networks in your connected wallet.</p>
      </div>
    )
  }

  // Check if the user has an NFT
  return bundleDropModule
      .balanceOf(address, "0")
      .then((balance) => {
        // If balance is greater than 0, they have our NFT!
        if (balance.gt(0)) {
          setHasClaimedNFT(true);
          console.log("This user has a membership NFT!")
        } else {
          setHasClaimedNFT(false);
          console.log("This user doesn't have a membership NFT.")
        }
      })
      .catch((error) => {
        setHasClaimedNFT(false);
        console.error("failed to nft balance", error);
      });
  }, [address]);

  // If user's wallet is not connected
  if (!address) {
    return (
      <div className="landing">
        <h1>🤖Join MetanewbiesDAO🤖</h1>
        <button onClick={() => connectWallet("injected")} className="btn-hero">
          beep boop your wallet
        </button>
      </div>
    );
  }
  if (hasClaimedNFT) {
    return (
      <div className="member-page">
        <h1>MetanewbiesDAO Member Page</h1>
      <div>
        <div>
          <h2>Member List</h2>
          <table className="card">
            <thead>
              <tr>
                <th>Address</th>
                <th>Token Amount</th>
              </tr>
            </thead>
            <tbody>
                {memberList.map((member) => {
                  return (
                    <tr key={member.address}>
                      <td>{shortenAddress(member.address)}</td>
                      <td>{member.tokenAmount}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div>
            <h2>Active Proposals</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                e.stopPropagation();

                //before we do async things, we want to disable the button to prevent double clicks
                setIsVoting(true);

                // lets get the votes from the form for the values
                const votes = proposals.map((proposal) => {
                  let voteResult = {
                    proposalId: proposal.proposalId,
                    //abstain by default
                    vote: 2,
                  };
                  proposal.votes.forEach((vote) => {
                    const elem = document.getElementById(
                      proposal.proposalId + "-" + vote.type
                    );

                    if (elem.checked) {
                      voteResult.vote = vote.type;
                      return;
                    }
                  });
                  return voteResult;
                });

                // first we need to make sure the user delegates their token to vote
                try {
                  //we'll check if the wallet still needs to delegate their tokens before they can vote
                  const delegation = await tokenModule.getDelegationOf(address);
                  // if the delegation is the 0x0 address that means they have not delegated their governance tokens yet
                  if (delegation === ethers.constants.AddressZero) {
                    //if they haven't delegated their tokens yet, we'll have them delegate them before voting
                    await tokenModule.delegateTo(address);
                  }
                  // then we need to vote on the proposals
                  try {
                    await Promise.all(
                      votes.map(async (vote) => {
                        // before voting we first need to check whether the proposal is open for voting
                        // we first need to get the latest state of the proposal
                        const proposal = await voteModule.get(vote.proposalId);
                        // then we check if the proposal is open for voting (state === 1 means it is open)
                        if (proposal.state === 1) {
                          // if it is open for voting, we'll vote on it
                          return voteModule.vote(vote.proposalId, vote.vote);
                        }
                        // if the proposal is not open for voting we just return nothing, letting us continue
                        return;
                      })
                    );
                    try {
                      // if any of the propsals are ready to be executed we'll need to execute them
                      // a proposal is ready to be executed if it is in state 4
                      await Promise.all(
                        votes.map(async (vote) => {
                          // we'll first get the latest state of the proposal again, since we may have just voted before
                          const proposal = await voteModule.get(
                            vote.proposalId
                          );

                          //if the state is in state 4 (meaning that it is ready to be executed), we'll execute the proposal
                          if (proposal.state === 4) {
                            return voteModule.execute(vote.proposalId);
                          }
                        })
                      );
                      // if we get here that means we successfully voted, so let's set the "hasVoted" state to true
                      setHasVoted(true);
                      // and log out a success message
                      console.log("successfully voted");
                    } catch (err) {
                      console.error("failed to execute votes", err);
                    }
                  } catch (err) {
                    console.error("failed to vote", err);
                  }
                } catch (err) {
                  console.error("failed to delegate tokens");
                } finally {
                  // in *either* case we need to set the isVoting state to false to enable the button again
                  setIsVoting(false);
                }
              }}
            >
              {proposals.map((proposal, index) => (
                <div key={proposal.proposalId} className="card">
                  <h5>{proposal.description}</h5>
                  <div>
                    {proposal.votes.map((vote) => (
                      <div key={vote.type}>
                        <input
                          type="radio"
                          id={proposal.proposalId + "-" + vote.type}
                          name={proposal.proposalId}
                          value={vote.type}
                          //default the "abstain" vote to chedked
                          defaultChecked={vote.type === 2}
                        />
                        <label htmlFor={proposal.proposalId + "-" + vote.type}>
                          {vote.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <button disabled={isVoting || hasVoted} type="submit">
                {isVoting
                  ? "Voting..."
                  : hasVoted
                    ? "You Already Voted"
                    : "Submit Votes"}
              </button>
              <small>
                This will trigger multiple transactions that you will need to
                sign.
              </small>
            </form>
          </div>
        </div>
      </div>
    );
  };
  
  const mintNFT = () => {
    setIsClaiming(true);
    bundleDropModule
    .claim("0", 1)
    .catch((err) => {
      console.error("Failed to claim", err);
      setIsClaiming(false);
    })
    .finally(() => {
      setIsClaiming(false);
      setHasClaimedNFT(true);
      console.log(
        `🌊 Successfully Minted! Check it out on OpenSea: https://testnets.opensea.io/assets/${bundleDropModule.address}/0`
      );
    });
  }

  // Render mint nft screen
  return (
    <div classname="mint-nft">
      <h1>Mint your free MetanewbiesDAO membership NFT</h1>
      <button
        disabled={isClaiming}
        onClick={() => mintNFT()}
      >
        {isClaiming ? "Minting..." : "Mint your nft (FREE)"}
      </button>
    </div>
  );


  // If user's walllet is connected
  return (
    <div className="landing">
      <h2>wallet successfully beep booped🤖✅</h2>
      <h1>🚀now buckle up your seatbelt🚀</h1>
    </div>
  );
};

export default App;
