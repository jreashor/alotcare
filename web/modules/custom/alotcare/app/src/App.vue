<template>
  <div>
    <profile-modal :staffId="staffId" />
    <edit-shift-modal :shiftId="shiftId" />
    <availability-modal />
    <facility-availability-modal />
    <message-modal />
  </div>
</template>

<script>
import EditShiftModal from "./components/EditShiftModal";
import ProfileModal from "./components/ProfileModal";
import MessageModal from "./components/MessageModal";
import FacilityAvailabilityModal from "./components/FacilityAvailabilityModal";
import AvailabilityModal from "./components/AvailabilityModal";

import { mapStores } from "pinia";
import { DateTime } from "luxon";
import { useAvailabilityStore } from "./stores/availability";
import { useFacilityAvailabilityStore } from "./stores/facilityAvailability";

export default {
  name: "App",
  components: {
    EditShiftModal,
    ProfileModal,
    AvailabilityModal,
    FacilityAvailabilityModal,
    MessageModal,
  },
  data() {
    return {
      shiftId: null,
      staffId: null,
    };
  },
  computed: {
    ...mapStores(useAvailabilityStore, useFacilityAvailabilityStore),
  },
  methods: {
    setShiftId(id) {
      console.log("id", id);
      this.shiftId = id;
    },
    setStaffId(id) {
      this.staffId = id;
    },
    openAvailability() {
      let date = window.jQuery("#evoCalendar").evoCalendar("getActiveDate");
      date = DateTime.fromFormat(date, "MM/dd/yyyy");
      if (window.drupalSettings.evoCalendar.role == "facility") {
        this.facilityAvailabilityStore.get(date);
        window
          .jQuery("#facilityAvailabilityModal")
          .modal({ backdrop: "static", keyboard: false });
      } else {
        this.availabilityStore.get(date);
        window
          .jQuery("#availabilityModal")
          .modal({ backdrop: "static", keyboard: false });
      }
    },
  },
};
</script>

<style>
</style>
