import {ethers } from "ethers";
import sdk from "./1-initialize-sdk.js";

const voteModule = sdk.getVoteModule("0x2992af1Ec19a8fBEdbBd041Fc75F0e6C2cA26B72");
const tokenModule = sdk.getTokenModule("0xE3d8ef2A86C4C29F9CE741eD9312104811C66C63");

(async () => {
    try {
        const amount = 420_000;
        // Creating a proposal to mint 420,000 new tokens for the treasury
        await voteModule.propose("Should the DAO delegate " + amount + " tokens to our TAs?",
        [
            {
                nativeTokenValue: 0,
                transactionData: tokenModule.contract.interface.encodeFunctionData("mint",
                [
                    voteModule.address,
                    ethers.utils.parseUnits(amount.toString(), 18),
                ]),
                toAddress: tokenModule.address,
            },
        ]);
        console.log("✅ ✅ Successfully created proposal to mint more tokens");
    } catch (err) {
        console.error("Failed to create proposal to mint more tokens");
        process.exit(1);
    }

})();