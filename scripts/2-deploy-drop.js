import { ethers } from "ethers";
import sdk from "./1-initialize-sdk.js";
import { readFileSync } from "fs";

const app = sdk.getAppModule("0xA7a6233096cDd875BDEaf403A475BEFd1E494744");

(async () => {
    try {
        const bundleDropModule = await app.deployBundleDropModule({
            // The colectors name
            name: "MetanewbiesDAO membership",
            description: "A place for tech newbies to learn and grow together",
            image: readFileSync("scripts/assets/newbies.jpg"),
            primarySaleRecipientAddress: ethers.constants.AddressZero,
        });
        console.log("✅✅Successfully deployed bundleDrop module, address: ", bundleDropModule.address,
        );
        console.log("BundleDrop metadata: ",
        await bundleDropModule.getMetadata(),
        );
     } catch (error) {
            console.log("failed to deploy bundleDrop module", error);
     }
})()