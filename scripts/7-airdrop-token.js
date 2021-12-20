import { ethers } from "ethers";
import sdk from "./1-initialize-sdk.js";

const bundleDropModule = sdk.getBundleDropModule("0x1251B8e51eE36f9f07b3f8e8AE13Dc02a70B3C13");
const tokenModule = sdk.getTokenModule("0x3c79023C61fc9C29c398784a861c7A5ccFB0d257");

(async () => {
    try {
        const walletAddresses = await bundleDropModule.getAllClaimerAddresses("0");
  
        if (walletAddresses.length === 0) {
          console.log(
            "No NFTs have been claimed yet, maybe get some friends to claim your free NFTs!",
          );
          process.exit(0);
        }
        
        // Loop through the array of addresses.
        const airdropTargets = walletAddresses.map((address) => {
          // Pick a random # between 1000 and 10000.
          const randomAmount = Math.floor(Math.random() * (10000 - 1000 + 1) + 1000);
          console.log("✅ Going to airdrop", randomAmount, "tokens to", address);
          
          // Set up the target.
          const airdropTarget = {
            address,
            // Remember, we need 18 decimal placees!
            amount: ethers.utils.parseUnits(randomAmount.toString(), 18),
          };
      
          return airdropTarget;
        });
        console.log("🌈 Starting airdrop...")
        await tokenModule.transferBatch(airdropTargets);
        console.log("✅ Successfully airdropped tokens to all the holders of the NFT!");
      } catch (err) {
        console.error("Failed to airdrop tokens", err);
      }
    })();