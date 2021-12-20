import { ethers } from "ethers";
import sdk from "./1-initialize-sdk.js";

const tokenModule = sdk.getTokenModule("0x3c79023C61fc9C29c398784a861c7A5ccFB0d257");

(async () => {
    try {
        // Max $NOOB token supply
        const amount = 69_000_000;
        const amountWith18Decimals = ethers.utils.parseUnits(amount.toString(), 18);
        await tokenModule.mint(amountWith18Decimals);
        const totalSupply = await tokenModule.totalSupply();

        console.log("There is ", ethers.utils.formatUnits(totalSupply, 18), "$NOOB in circulation");
    } catch (error) {
        console.error("Failed to brrr money", error);
    }
})();