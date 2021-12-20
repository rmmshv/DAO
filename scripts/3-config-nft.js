import sdk from "./1-initialize-sdk.js";
import { readFileSync } from "fs";

const bundleDrop = sdk.getBundleDropModule("0x1251B8e51eE36f9f07b3f8e8AE13Dc02a70B3C13");

(async () => {
    try {
        await bundleDrop.createBatch([
            {
                name: "Newbie",
                description: "This NFT makes you an honorable MetanewbiesDAO member. Hell yeah that was a dumb question! Be proud of it!",
                image: readFileSync("scripts/assets/newb.jpg"),
            },
        ]);
        console.log("✅✅Successfully created a new NFT in the drop");
    } catch (error) {
        console.error("🚨 🚨 Failed to create the new NFT", error);
    }
})()