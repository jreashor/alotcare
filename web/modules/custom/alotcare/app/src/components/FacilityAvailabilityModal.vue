<template>
  <div
    class="modal fade"
    id="facilityAvailabilityModal"
    tabindex="-1"
    role="dialog"
    aria-labelledby="facilityAvailabilityModalLabel'"
    aria-hidden="true"
  >
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h4 class="modal-title" id="facilityAvailabilityModalLabel'">
            <span
              class="glyphicon glyphicon-calendar"
              aria-hidden="true"
            ></span>
            Availability
          </h4>
        </div>
        <div class="modal-body">
          <p>View applicant profiles and message staff.</p>
          <ul class="list-group">
            <li
              v-for="node in store.nodes"
              :key="node.nid"
              class="list-group-item clearfix"
              :class="{
                disabled: disabled,
              }"
            >
              <div>
                <base-button
                  label="Message"
                  class="btn-success"
                  icon="send"
                  size="xs"
                  @click="messageUser(node.uid.uid)"
                />
                <base-button
                  type="link"
                  size="xs"
                  icon="user"
                  label="Profile"
                  @click="openProfile(node.uid.uid)"
                />
                {{ node.uid.field_first_name }}, {{ node.uid.field_last_name }}
              </div>
              <div>
                <!-- Todo: Sort shift types. -->
                <span
                  v-for="type in node.field_shift_type"
                  :key="type.tid"
                  :class="'badge shift-type-' + type.machine_name"
                >
                  {{ type.name }}
                </span>
              </div>
            </li>
          </ul>
        </div>
        <div class="modal-footer">
          <div class="modal-alerts"></div>
          <base-button
            data-dismiss="modal"
            label="Close"
            icon="remove"
            class="btn-primary"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import BaseButton from "./BaseButton.vue";
import { useFacilityAvailabilityStore } from "../stores/facilityAvailability";
import { useMessageStore } from "../stores/message";
const store = useFacilityAvailabilityStore();
const messageStore = useMessageStore();

const openProfile = (id) => {
  window.App.setStaffId(id);
  window.jQuery("#profileModal").modal({ backdrop: "static", keyboard: false });
};

const messageUser = (id) => {
  messageStore.id = id;
  window.jQuery("#messageModal").modal({ backdrop: "static", keyboard: false });
};
</script>

<style scoped>
.badge {
  font-size: 10px;
  margin: 8px 4px 0;
}
/* morning */
.shift-type-event {
  background-color: #ff7575;
}
/* evening */
.shift-type-holiday {
  background-color: #ffc107;
}
/* night */
.shift-type-birthday {
  background-color: #3ca8ff;
}
</style>
