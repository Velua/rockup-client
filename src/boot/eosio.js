// import axios from "axios";

const eos = {
  derp: function() {
    console.log("doop doop");
  }
};

export default async ({ Vue }) => {
  Vue.prototype.$eos = eos;
};
