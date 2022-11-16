<template>
  <div
    class="modal fade"
    id="availabilityModal"
    tabindex="-1"
    role="dialog"
    aria-labelledby="availabilityModalLabel'"
    aria-hidden="true"
  >
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h4 class="modal-title" id="availabilityModalLabel'">
            <span
              class="glyphicon glyphicon-calendar"
              aria-hidden="true"
            ></span>
            Availability
          </h4>
        </div>
        <div class="modal-body">
          Select your availability. This is visible to facilities.
        </div>
        <div class="modal-footer">
          <base-button
            v-for="shiftType in store.shiftTypes"
            :key="shiftType.tid[0].value"
            :label="shiftType.name[0].value"
            :icon="
              store.selectedShiftTypes.includes(shiftType.machine_name[0].value)
                ? 'check'
                : 'plus'
            "
            :class="
              store.selectedShiftTypes.includes(shiftType.machine_name[0].value)
                ? 'btn-success'
                : 'shift-type-' + shiftType.machine_name[0].value
            "
            :disabled="store.enabled ? store.loading : true"
            @click="updateAvailability(shiftType.machine_name[0].value)"
            loader="true"
          />
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
import { DateTime } from "luxon";
import { useAvailabilityStore } from "../stores/availability";
const store = useAvailabilityStore();

const updateAvailability = (shiftType) => {
  let date = window.jQuery("#evoCalendar").evoCalendar("getActiveDate");
  date = DateTime.fromFormat(date, "MM/dd/yyyy").startOf("day");
  store.update(date, shiftType);
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
