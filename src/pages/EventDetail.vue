<template>
  <q-page padding>
    <div class="row q-col-gutter-xl">
      <div class="col-xs-12 col-sm-6 col-md-3">
        <q-card class="my-card bg-primary text-white col">
          <q-card-section>
            <div class="text-h6">{{ $route.params.id }}</div>
            <div class="text-subtitle2">hosted by {{ host }}</div>
          </q-card-section>

          <q-card-section>
            <p>Seats Available: {{ att }} / {{ maxatt }}</p>
            <p>Stake Amount: {{ stakeamount }}</p>
          </q-card-section>

          <!-- <q-separator dark /> -->

          <q-card-actions v-if="eventopen">
            <q-btn color="amber" flat>Cancel</q-btn>
            <q-btn color="standard" flat @click="eventopen = false"
              >Close</q-btn
            >
          </q-card-actions>
          <q-card-actions v-else>
            <q-btn color="amber" flat>Delete event</q-btn>
            <q-btn color="standard" flat @click="rollcall = !rollcall"
              >Roll Call</q-btn
            >
          </q-card-actions>
        </q-card>
      </div>
      <div class="col-xs-12 col-sm-6 col-md-8 ">
        <q-list>
          <q-item v-for="attendant in attendees" :key="attendant.ticketid">
            <q-checkbox
              v-if="rollcall"
              v-model="selection"
              :val="attendant.ticketid"
              color="blue"
            />
            <q-item-section>
              <q-item-label>{{ attendant.attendee }}</q-item-label>
              <q-item-label caption>{{ attendant.ticketid }}</q-item-label>
            </q-item-section>

            <q-item-section side top>
              <div class="text-h6" v-if="attendant.paid">Going</div>
              <q-btn v-else color="primary" :label="Stake" />
            </q-item-section>
          </q-item>
        </q-list>
      </div>
      <q-page-sticky position="bottom-right" :offset="[18, 18]">
        <q-btn
          v-if="eventopen"
          fab
          icon="add"
          color="primary"
          @click="prompt = true"
        />
        <q-btn
          v-if="rollcall"
          fab
          icon="done"
          color="positive"
          @click="triggerRollCall"
        />
      </q-page-sticky>
    </div>

    <q-dialog v-model="prompt" persistent>
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Get Ticket</div>
          <div>
            I understand I will need to stake {{ stakeamount }} to attend this
            event which will be returned back to me at roll call at the event.
          </div>
        </q-card-section>

        <q-card-section>
          <q-input
            v-model="attendee"
            label="Attendee"
            :rules="[isEosioName]"
            :lazy-rules="true"
            placeholder="Your or someone elses EOS account name"
            error-message="Must be a valid EOS account name"
            autofocus
            @keyup.enter="prompt = false"
          />
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="ticketid"
            :rules="[isEosioName]"
            :lazy-rules="true"
            label="Ticket ID"
            placeholder="Random text OK"
          />
        </q-card-section>
        <q-card-section>
          <q-input v-model="eventid" label="Event ID" readonly="" />
        </q-card-section>
        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Cancel" @click="showNotification" v-close-popup />
          <q-btn flat label="Reserve" @click="reserveTicket" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<style></style>

<script>
export default {
  name: "PageIndex",
  data: function() {
    return {
      rollcall: false,
      eventopen: true,
      selection: [],
      prompt: false,
      attendees: [
        {
          ticketid: "ticket1",
          attendee: "marcel.x",
          eventid: "ap41",
          paid: true
        },
        {
          ticketid: "ticket2",
          attendee: "johnn.y",
          eventid: "ap41",
          paid: true
        },
        {
          ticketid: "ticket3",
          attendee: "kingcoolcorv",
          eventid: "ap41",
          paid: true
        },
        {
          ticketid: "ticket4",
          attendee: "randomaccount",
          eventid: "ap41",
          paid: false
        }
      ],
      eventid: "ap41",
      host: "thekellygang",
      att: 4,
      stakeamount: "5.0000 EOS",
      maxatt: 6,
      attendee: "",
      ticketid: ""
    };
  },
  computed: {
    Stake: function() {
      return "Stake";
    }
  },
  methods: {
    showNotification() {
      this.$q.notify("Some other message");
    },
    isEosioName(input) {
      return (
        new RegExp("^[a-z][a-z1-5.]{0,10}([a-z1-5]|^.)[a-j1-5]?$").test(
          input
        ) ||
        "Name must only contain characters a-z 1-5 and . No greater than 12 in length."
      );
    },
    async triggerRollCall() {
      const went = this.selection;
      const all = this.attendees.map(({ ticketid }) => ticketid);
      const didntgo = all.filter(ticketid => !went.includes(ticketid));
      console.log({ went, didntgo });
    },
    async closeEvent() {},
    async reserveTicket() {
      try {
        await this.$eos.tx({
          actions: [
            {
              account: "rockup",
              name: "reqticket",
              authorization: [
                {
                  actor: this.$eos.data.accountName,
                  permission: "active"
                }
              ],
              data: {
                attendee: this.attendee,
                ticketid: this.ticketid,
                eventid: this.eventid
              }
            },
            {
              account: "eosio.token",
              name: "transfer",
              authorization: [
                {
                  actor: this.$eos.data.accountName,
                  permission: "active"
                }
              ],
              data: {
                from: this.$eos.data.accountName,
                to: "rockup",
                quantity: this.stakeamount,
                memo: this.eventid
              }
            }
          ]
        });
      } catch (e) {
        this.prompt = true;
      }
    }
  }
};
</script>
