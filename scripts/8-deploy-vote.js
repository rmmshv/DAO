import sdk from "./1-initialize-sdk.js";

const appModule = sdk.getAppModule("0xA7a6233096cDd875BDEaf403A475BEFd1E494744");

(async () => {
    try {
        const voteMode = await appModule.deployVoteModule({
            name: "MetanewbiesDAO Proposals",
            votingTokenAddress: "0x3c79023C61fc9C29c398784a861c7A5ccFB0d257",
            // How soon can a member vote on proposals?
            proposalStartWaitTimeInSeconds: 0,
            // How long do members have to vote on a proposal?
            proposalVotingTimeInSeconds: 24 * 60 * 60,
            // How many votes for a proposal to pass? (currently at 0 for testing)
            votingQuorumFraction: 0,
            // Minimum number of tokens needed for a user to create a proposal
            minimumNumberOfTokensNeededToPropose: "0",
        });
        console.log("Successfully deployed vote module, address: ", voteMode.address);
    } catch (err) {
        console.log("Failed to deploy vote module", err);
    }
})();