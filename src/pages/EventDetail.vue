<template>
  <q-page padding>
    <div class="row q-col-gutter-xl">
      <div class="col-xs-12 col-sm-6 col-md-3">
        <q-card class="my-card bg-primary text-white col">
          <q-card-section>
            <div class="text-h6">{{ $route.params.id }}</div>
            <div class="text-subtitle2">hosted by {{ eventowner }}</div>
          </q-card-section>

          <q-card-section>
            <p>Seats Reserved: {{ att }} / {{ maxatt }}</p>
            <p>Stake Amount: {{ stakeamount }}</p>
          </q-card-section>

          <q-separator dark />

          <q-card-actions v-if="open">
            <!-- <q-btn color="amber" flat>Cancel</q-btn> -->
            <q-btn color="standard" flat @click="closeEvent">Close</q-btn>
          </q-card-actions>
          <q-card-actions v-else>
            <q-btn
              color="standard"
              v-if="ticketsExist"
              flat
              @click="rollcall = !rollcall"
              >Roll Call</q-btn
            >
            <q-btn color="amber" v-else flat @click="deleteEvent"
              >Delete event</q-btn
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
              <div class="text-h6" v-if="attendant.paid">
                {{
                  attendant.attendee == $eos.data.accountName
                    ? `You're going`
                    : `Going`
                }}
              </div>
              <q-btn
                v-else
                color="primary"
                :label="Stake"
                @click="stakeTicket(attendant.ticketid)"
              />
            </q-item-section>
          </q-item>
        </q-list>
      </div>
      <q-page-sticky
        v-if="$eos.data.authed"
        position="bottom-right"
        :offset="[18, 18]"
      >
        <q-btn
          v-if="open"
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
            event which will be returned back to me only if I am marked present
            at the event.
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
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn flat label="Reserve" @click="reserveTicket" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<style></style>

<script>
import wait from "waait";

export default {
  name: "PageIndex",
  data: function() {
    return {
      rollcall: false,
      open: true,
      selection: [],
      prompt: false,
      attendees: [],
      eventid: null,
      eventowner: null,
      att: null,
      stakeamount: null,
      maxatt: null,
      attendee: this.$eos.data.accountName,
      ticketid: ""
    };
  },
  computed: {
    Stake: function() {
      return "Stake";
    },
    ticketsExist: function() {
      return this.attendees.length;
    }
  },
  created: async function() {
    this.fetchTableData();
  },
  methods: {
    async stakeTicket(ticketId) {
      console.log("got ticket id", ticketId);
      await this.$eos.tx({
        actions: [
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
              to: process.env.CONTRACT,
              quantity: this.stakeamount,
              memo: ticketId
            }
          }
        ]
      });
    },
    async fetchTableData() {
      try {
        const result = await this.$rpc.get_table_rows({
          code: process.env.CONTRACT,
          table: "events",
          scope: process.env.CONTRACT
        });

        const {
          eventid,
          stakeamount,
          maxatt,
          att,
          eventowner,
          open
        } = result.rows.filter(
          event => event.eventid === this.$route.params.id
        )[0];

        this.eventid = eventid;
        this.eventowner = eventowner;
        this.att = att;
        this.stakeamount = stakeamount;
        this.maxatt = maxatt;
        this.open = open;

        const allTickets = await this.$rpc.get_table_rows({
          code: process.env.CONTRACT,
          table: "tickets",
          scope: process.env.CONTRACT
        });

        const tickets = allTickets.rows.filter(
          ticket => ticket.eventid === this.eventid
        );
        console.log(tickets);
        this.attendees = tickets;
      } catch (e) {
        this.$q.notify({
          message: "Fetching Event/Ticket data failed",
          position: "bottom-right",
          color: "negative",
          icon: "error"
        });
      }
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

      const list = [
        ...went.map(ticketId => ({ ticketId, attended: true })),
        ...didntgo.map(ticketId => ({ ticketId, attended: false }))
      ];

      const rollCallAction = ({ ticketId, attended }) => ({
        account: process.env.CONTRACT,
        name: "rollcall",
        authorization: [
          {
            actor: this.$eos.data.accountName,
            permission: "active"
          }
        ],
        data: {
          ticketid: ticketId,
          attended
        }
      });

      const actions = list.map(rollCallAction);
      console.log(actions);
      try {
        await this.$eos.tx({
          actions
        });
        await wait(1000);
        await this.fetchTableData();
      } catch (e) {
        console.log("fff");
      }
    },
    async closeEvent() {
      try {
        await this.$eos.tx({
          actions: [
            {
              account: process.env.CONTRACT,
              name: "closeevent",
              authorization: [
                {
                  actor: this.$eos.data.accountName,
                  permission: "active"
                }
              ],
              data: {
                eventid: this.eventid
              }
            }
          ]
        });
        await wait(1000);
        await this.fetchTableData();
        this.open = false;
      } catch (e) {
        console.log(e);
      }
    },
    async deleteEvent() {
      console.log("delete event");
      console.log(
        process.env.CONTRACT,
        this.$eos.data.accountName,
        this.eventid
      );
      try {
        await this.$eos.tx({
          actions: [
            {
              account: process.env.CONTRACT,
              name: "we",
              authorization: [
                {
                  actor: this.$eos.data.accountName,
                  permission: "active"
                }
              ],
              data: {
                eventid: this.eventid
              }
            }
          ]
        });
        this.$router.push(`/`);
      } catch (e) {
        console.log(e);
      }
    },
    async reserveTicket() {
      try {
        await this.$eos.tx({
          actions: [
            {
              account: process.env.CONTRACT,
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
                to: process.env.CONTRACT,
                quantity: this.stakeamount,
                memo: this.ticketid
              }
            }
          ]
        });
        await wait(1000);
        await this.fetchTableData();
      } catch (e) {
        this.prompt = true;
      }
    }
  }
};
</script>
