import { createDfuseClient } from "@dfuse/client";

export default async ({ Vue }) => {
  Vue.prototype.$dfuse = createDfuseClient({
    apiKey: process.env.DFUSE_KEY,
    network: "mainnet"
  });
};
