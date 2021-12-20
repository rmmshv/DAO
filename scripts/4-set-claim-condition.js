import sdk from "./1-initialize-sdk.js"

const bundleDrop = sdk.getBundleDropModule("0x1251B8e51eE36f9f07b3f8e8AE13Dc02a70B3C13");

(async () => {
    try {
        const claimConditionFactory = bundleDrop.getClaimConditionFactory();
        claimConditionFactory.newClaimPhase({
            startTime: new Date(),
            maxQuantoty: 69_000,
            maxQuantityPerTransaction: 1,
        });
        await bundleDrop.setClaimCondition(0, claimConditionFactory);
        console.log("✅✅ Successfully set claim codnditions");
    }catch (error) {
        console.error("🚨 🚨 Failed to create the new NFT", error);
    }
})()