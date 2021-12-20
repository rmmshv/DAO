import sdk from "./1-initialize-sdk.js";
import { ethers } from "ethers";

const voteModule = sdk.getVoteModule("0x2992af1Ec19a8fBEdbBd041Fc75F0e6C2cA26B72");
const tokenModule = sdk.getTokenModule("0xE3d8ef2A86C4C29F9CE741eD9312104811C66C63");

(async () => {
    try {
        // Giving our treasury the power to mint additional token if needed
        await tokenModule.grantRole("minter", voteModule.address);
        console.log("Successfully gave vote module permissions to act on token module");
    } catch (err) {
        console.error("Failed to grant vote permissions on token module", err);
        process.exit(1);
    }

    try {
        const ownedTokenBalance = await tokenModule.balanceOf(process.env.WALLET_ADDRESS);
        const ownedAmount = ethers.BigNumber.from(ownedTokenBalance.value);
        const percent90 = ownedAmount.div(100).mul(90);

        // Transfer 90% of the supply to our voting contract
        await tokenModule.transfer(voteModule.address, percent90);
        console.log("Successfully transferred tokens to vote module");
    } catch (err) {
        console.error("Failed to transfer tokens to vote module", err);
    }
})();