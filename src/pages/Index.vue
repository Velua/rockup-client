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

          <!-- <q-separator dark /> -->

          <!-- <q-card-actions>
            <q-btn flat>Action 1</q-btn>
            <q-btn flat>Action 2</q-btn>
          </q-card-actions> -->
        </q-card>
      </div>
      <div class="col-xs-12 col-sm-6 col-md-8 ">
        <q-list>
          <q-item
            v-for="event in events"
            :key="event.eventid"
            clickable
            v-ripple
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
              <q-item-label caption>Host: {{ event.host }}</q-item-label>
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
            <q-btn flat label="Create" v-close-popup />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <q-page-sticky position="bottom-right" :offset="[18, 18]">
        <q-btn fab icon="add" color="primary" @click="prompt = true" />
      </q-page-sticky>
    </div>
  </q-page>
</template>

<style></style>

<script>
const defaultEvents = [
  {
    eventid: "ap41",
    host: "thekellygang",
    stakeamount: "5.0000 EOS",
    att: 4,
    maxatt: 6,
    open: true
  },
  {
    eventid: "whatever",
    host: "marcel.x",
    stakeamount: "10.0000 EOS",
    att: 2,
    maxatt: 8,
    open: true
  }
];

export default {
  name: "PageIndex",
  data: function() {
    return {
      events: defaultEvents,
      prompt: false,
      eventid: "",
      EOS: "",
      maxatt: "",
      owner: "",
      about:
        "Create free events which require an EOS stake, those who fail to rockup to the event lose their stake!"
    };
  },
  methods: {
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
    showNotification() {
      this.$q.notify("Some other message");
    }
  }
};
</script>
