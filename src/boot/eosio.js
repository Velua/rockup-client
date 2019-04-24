import { Scatter } from "ual-scatter";
import { Lynx } from "ual-lynx";
import { TokenPocket } from "ual-token-pocket";
import { MeetOne } from "ual-meetone";

import Eos from "ual-quasar-renderer";
import { Notify, openURL } from "quasar";
import { JsonRpc } from "eosjs";

const { CHAIN_ID, PROTOCOL, HOST, PORT } = process.env;
const myChain = {
  chainId: CHAIN_ID,
  rpcEndpoints: [
    {
      protocol: PROTOCOL,
      host: HOST,
      port: PORT
    }
  ]
};

const appName = "Rockup";
const scatter = new Scatter([myChain], { appName });
const lynx = new Lynx([myChain]);
const tokenPocket = new TokenPocket([myChain]);
const meetOne = new MeetOne([myChain]);

console.log(`${PROTOCOL}://${HOST}:${PORT}`);
const rpc = new JsonRpc(`${PROTOCOL}://${HOST}:${PORT}`);

export default ({ Vue }) => {
  Vue.use(Eos, {
    eosStore: new Eos.Store(
      [myChain],
      appName,
      [scatter, lynx, tokenPocket, meetOne],
      Vue,
      Notify,
      openURL
    )
  });

  Vue.prototype.$rpc = rpc;
};
