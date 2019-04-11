import { Scatter } from "ual-scatter";
import Eos from "ual-quasar-renderer";
import { Notify, openURL } from "quasar";

const myChain = {
  chainId: "cf057bbfb72640471fd910bcb67639c22df9f92470936cddc1ade0e2f2e7dc4f",
  rpcEndpoints: [
    {
      protocol: "http",
      host: "localhost",
      port: "8888"
    }
  ]
};

const appName = "Rockup";
const scatter = new Scatter([myChain], { appName });

export default ({ Vue }) => {
  Vue.use(Eos, {
    eosStore: new Eos.Store([myChain], appName, [scatter], Vue, Notify, openURL)
  });
};
