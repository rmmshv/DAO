import sdk from "./1-initialize-sdk.js";

const tokenModule = sdk.getTokenModule("0xE3d8ef2A86C4C29F9CE741eD9312104811C66C63");

(async () => {
    try {
        console.log("Roles that exist tight now: ", await tokenModule.getAllRoleMembers());

        await tokenModule.revokeAllRolesFromAddress(process.env.WALLET_ADDRESS);
        console.log("Roles after revoking ourselves: ", await tokenModule.getAllRoleMembers());
    console.log("✅ Successfully revoked our superpowers from the ERC-20 contract");
    } catch (error) {
        console.error("Failed to revoke ourselces from the DAO treasury", error);
    }
})();