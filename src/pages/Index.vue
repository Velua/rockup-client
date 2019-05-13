<template>
  <q-page padding>
    <div class="row q-col-gutter-xl">
      <div class="col-xs-12 col-sm-6 col-md-3">
        <q-card class="my-card bg-primary text-white col">
          <q-card-section>
            <div class="text-h6">Rockup!</div>
            <div class="text-subtitle2">by John Williamson & Marcel McFall</div>
          </q-card-section>
          <q-card-section>
            {{ about }}
          </q-card-section>

          <q-separator dark />

          <q-card-actions>
            <q-btn flat @click="aboutPrompt = true">About</q-btn>
            <q-btn flat @click="donatePrompt = true">Donate</q-btn>
            <q-btn flat @click="fetchTableData">Refresh</q-btn>
          </q-card-actions>
        </q-card>
      </div>
      <div class="col-xs-12 col-sm-6 col-md-8 ">
        <q-card v-if="openEvents.length == 0 && closedEvents.length == 0">
          <q-card-section>
            <div class="text-h6">No events!</div>
            <div class="text">Login and press the plus icon to host one.</div>
          </q-card-section>
        </q-card>
        <q-list v-else>
          <q-item-label header>Open Events</q-item-label>
          <q-item
            v-for="event in openEvents"
            :key="event.eventid"
            @click="$router.push(`/event/${event.eventid}`)"
            clickable
            v-ripple
            :active="!!event.open"
          >
            <q-item-section>
              <q-item-label>{{ event.eventid }}</q-item-label>
              <q-item-label caption>{{ event.stakeamount }} Stake</q-item-label>
            </q-item-section>

            <q-item-section side top>
              <q-item-label caption
                >{{ event.att }}/{{ event.maxatt }} Tickets
                Reserved</q-item-label
              >
              <q-item-label caption>Host: {{ event.eventowner }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-separator spaced />
          <q-item-label header>Past/Closed Events</q-item-label>
          <q-item
            v-for="event in closedEvents"
            :key="event.eventid"
            @click="$router.push(`/event/${event.eventid}`)"
            clickable
            v-ripple
            :active="!!event.open"
          >
            <q-item-section>
              <q-item-label>{{ event.eventid }}</q-item-label>
              <q-item-label caption>{{ event.stakeamount }} Stake</q-item-label>
            </q-item-section>

            <q-item-section side top>
              <q-item-label caption
                >{{ event.att }}/{{ event.maxatt }} Tickets
                Reserved</q-item-label
              >
              <q-item-label caption>Host: {{ event.eventowner }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </div>

      <q-dialog v-model="prompt" persistent>
        <q-card style="min-width: 400px">
          <q-card-section>
            <div class="text-h6">New event</div>
          </q-card-section>

          <q-card-section>
            <q-input
              v-model="owner"
              label="Event Owner"
              :rules="[isEosioName]"
              :lazy-rules="true"
              placeholder="Your EOS account name"
              error-message="Must be a valid EOS account name"
              autofocus
              @keyup.enter="prompt = false"
            />
          </q-card-section>
          <q-card-section>
            <q-input
              v-model="EOS"
              :rules="[isNotEmpty, isOverZero]"
              :lazy-rules="true"
              type="number"
              suffix="EOS"
              label="EOS Stake"
              placeholder="Required amount of EOS staked to reserve ticket E.g. 5"
            />
          </q-card-section>
          <q-card-section>
            <q-input
              v-model="maxatt"
              :rules="[isOverZero]"
              :lazy-rules="true"
              type="number"
              label="Max attendance"
              placeholder="15"
            />
          </q-card-section>
          <q-card-section>
            <q-input
              v-model="eventid"
              label="Event ID"
              placeholder="ap41"
              :rules="[isEosioName]"
              :lazy-rules="true"
            />
          </q-card-section>

          <q-card-actions align="right" class="text-primary">
            <q-btn flat label="Cancel" v-close-popup />
            <q-btn flat label="Create" @click="createEvent" v-close-popup />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <q-page-sticky
        v-if="$eos.data.authed"
        position="bottom-right"
        :offset="[18, 18]"
      >
        <q-btn fab icon="add" color="primary" @click="triggerPrompt" />
      </q-page-sticky>

      <q-dialog v-model="aboutPrompt">
        <q-card>
          <q-card-section>
            <div class="text-h6">What is Rockup?</div>
          </q-card-section>

          <q-card-section>
            Free Meetups and events with limited seating space often use online
            websites like Meetup.com to organise and distribute free tickets,
            however, not everyone who collects a free ticket actually attends
            the event.
          </q-card-section>
          <q-card-section>
            By not attending a full event they have potentionally taken the seat
            of someone who would have. Rockup.xyz allows hosts to organise an
            event which requires a 'stake' in order to reserve a seat, at the
            event the host performs a 'roll call' declaring who did and did not
            attend the event.
          </q-card-section>
          <q-card-section>
            Those who attended the event have their stake immediately returned,
            those who fail to 'Rockup' forfeit their stake which instead sent to
            the events host, perhaps to pay for pizza at the next event?
          </q-card-section>
          <q-card-section>
            <div class="text-h6">Credits</div>
            <ul>
              <li>
                <a href="https://johnwilliamson.io" target="_blank"
                  >John Williamson</a
                >
              </li>
              <li>
                <a href="https://github.com/mcf21" target="_blank"
                  >Marcel McFall</a
                >
              </li>
            </ul>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn flat label="OK" color="primary" v-close-popup />
          </q-card-actions>
        </q-card>
      </q-dialog>
      <q-dialog v-model="donatePrompt">
        <q-card>
          <q-card-section>
            <div class="text-h6">Donate</div>
          </q-card-section>

          <q-card-section>
            This project is made with love and entirely free.
          </q-card-section>
          <q-card-section>
            Donations will be evenly distributed between developers who take
            part of the project based on their time and money spent making this
            happen.
          </q-card-section>
          <q-card-section>
            <q-input
              v-model="donationAmount"
              :rules="[isNotEmpty, isOverZero]"
              :lazy-rules="true"
              type="number"
              suffix="EOS"
              label="Donation Amount"
            />
          </q-card-section>
          <q-card-section>
            <q-input
              v-model="donationMemo"
              placeholder="Optional"
              label="Memo"
            />
          </q-card-section>
          <q-card-actions align="right">
            <q-btn
              flat
              label="OK"
              color="primary"
              @click="triggerDonate"
              v-close-popup
            />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
  </q-page>
</template>

<style></style>

<script>
import wait from "waait";
export default {
  name: "PageIndex",
  data: function() {
    return {
      events: [],
      donationAmount: null,
      donationMemo: "",
      aboutPrompt: false,
      donatePrompt: false,
      prompt: false,
      eventid: "",
      EOS: "",
      maxatt: "",
      owner: "",
      about:
        "Create free events which require an EOS stake, those who fail to rockup to the event lose their stake!"
    };
  },
  computed: {
    openEvents: function() {
      return this.events.filter(event => event.open);
    },
    closedEvents: function() {
      return this.events.filter(event => !event.open);
    }
  },
  created: async function() {
    console.log("created");
    await this.fetchTableData();
  },
  mounted: async function() {
    console.log("mounted");
  },
  methods: {
    triggerPrompt() {
      if (this.owner == "") {
        this.owner = this.$eos.data.accountName;
      }
      this.prompt = true;
    },
    async triggerDonate() {
      try {
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
                to: "eosbrisban.e",
                quantity: `${Number(this.donationAmount).toFixed(4)} EOS`,
                memo: this.donationMemo || "Rockup.xyz Donation"
              }
            }
          ]
        });
      } catch (e) {
        console.log(e);
      }
    },
    async fetchTableData() {
      const result = await this.$rpc.get_table_rows({
        code: process.env.CONTRACT,
        table: "events",
        scope: process.env.CONTRACT
      });
      this.events = result.rows;
    },
    isEosioName(input) {
      return (
        new RegExp("^[a-z][a-z1-5.]{0,10}([a-z1-5]|^.)[a-j1-5]?$").test(
          input
        ) ||
        "Name must only contain characters a-z 1-5 and . No greater than 12 in length."
      );
    },
    isNotEmpty(input) {
      return input.length !== 0 || "Cannot be empty";
    },
    isOverZero(input) {
      return input > 0 || "Must be greater than 0";
    },
    async createEvent() {
      try {
        await this.$eos.tx({
          actions: [
            {
              account: process.env.CONTRACT,
              name: "createevent",
              authorization: [
                {
                  actor: this.$eos.data.accountName,
                  permission: "active"
                }
              ],
              data: {
                owner: this.owner,
                eventid: this.eventid,
                stakeamt: `${Number(this.EOS).toFixed(4)} EOS`,
                maxatt: this.maxatt
              }
            }
          ]
        });
        await wait(1000);
        await this.fetchTableData();
      } catch (e) {
        console.log(e);
        this.prompt = true;
      }
    }
  }
};
</script>
