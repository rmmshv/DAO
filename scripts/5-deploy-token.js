import sdk from "./1-initialize-sdk.js";

const app = sdk.getAppModule("0xA7a6233096cDd875BDEaf403A475BEFd1E494744");

(async () => {
    try {
        // Deploying a standard ERC-20 contract
        const tokenModule = await app.deployTokenModule({
            name: "MetanewbiesDAO Governance Token",
            symbol: "NOOB",
        });
    console.log("✅✅ Successfully deployed token module, address: ", tokenModule.address);
    } catch (error) {
        console.error("Failed to deploy token module", error);
    }
})();