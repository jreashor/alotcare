import { defineStore } from "pinia";
import axios from "axios";
import { DateTime } from "luxon";

export const useFacilityAvailabilityStore = defineStore('facilityAvailability', {
    state: () => ({
        enabled: false,
        loading: true,
        nodes: null,
    }),
    actions: {
        async get(date) {
            this.loading = true;
            this.node = null;
            this.selectedShiftTypes = [];
            try {
                const response = await axios.get("api/availability/" + date.toFormat("yyyy-MM-dd") + "?_format=json");
                if (response.status == 200 && response.data.length) {
                    this.nodes = response.data;
                }
            } catch (error) {
                console.log(error);
            }
            this.loading = false;
            this.enabled = date.startOf("day") >= DateTime.now().startOf("day");
        }
    },
});