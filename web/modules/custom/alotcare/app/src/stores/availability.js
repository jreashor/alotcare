import { defineStore } from "pinia";
import axios from "axios";
import { DateTime } from "luxon";

export const useAvailabilityStore = defineStore('availability', {
    state: () => ({
        enabled: false,
        loading: true,
        node: null,
        shiftTypes: window.drupalSettings.evoCalendar.shiftTypes,
        selectedShiftTypes: []
    }),
    actions: {
        async get(date) {
            this.loading = true;
            this.node = null;
            this.selectedShiftTypes = [];
            console.log(date);
            try {
                const response = await axios.get("api/availability/" + date.toFormat("yyyy-MM-dd") + "?_format=json");
                if (response.status == 200 && response.data.length) {
                    this.node = response.data[0];
                    if (response.data[0].field_shift_type) {
                        this.selectedShiftTypes = response.data[0].field_shift_type.map((shiftType) => {
                            return shiftType.machine_name;
                        });
                    }
                }
            } catch (error) {
                console.log(error);
            }
            this.loading = false;
            this.enabled = date.startOf("day") >= DateTime.now().startOf("day");
        },
        async update(date, shiftType) {
            this.loading = true;
            const removeShift = this.selectedShiftTypes.includes(shiftType);

            // Format shift types for Drupal.
            let fieldShiftTypes = [];
            if (removeShift) {
                fieldShiftTypes = this.selectedShiftTypes.filter(ele => ele !== shiftType);
            } else {
                fieldShiftTypes = [...this.selectedShiftTypes, shiftType]
            }
            fieldShiftTypes = fieldShiftTypes.map((shiftType) => {
                return { target_id: this.shiftTypes[shiftType].tid[0].value };
            });

            const url = this.node ? "node/" + this.node.nid : "node";
            const method = this.node ? "PATCH" : "POST";
            const nodeData = {
                type: [{ target_id: "availability" }],
                field_shift_type: fieldShiftTypes,
                field_date: [{ value: date.toFormat("yyyy-MM-dd") }],
            };

            try {
                const { data } = await axios.get("session/token");
                const response = await axios({
                    method: method,
                    url: url + "?_format=json",
                    data: nodeData,
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRF-Token": data,
                    },
                });
                if (response.status == 200 || response.status == 201) {
                    this.node = response.data;
                    if (response.data.field_shift_type) {
                        this.selectedShiftTypes = response.data.field_shift_type.map((shiftType) => {
                            return shiftType.machine_name;
                        });
                    } else {
                        this.selectedShiftTypes = [];
                    }

                    // Update jQuery calendar.
                    const evo = window.jQuery("#evoCalendar");
                    const calendarId =
                        this.node.nid + "-" + this.shiftTypes[shiftType].tid[0].value;
                    if (removeShift) {
                        evo.evoCalendar("removeCalendarEvent", calendarId);
                    } else {
                        evo.evoCalendar("addCalendarEvent", [{
                            id: calendarId,
                            name: "",
                            type: shiftType,
                            date: evo.evoCalendar("getActiveDate"),
                        }]);
                    }
                }
            } catch (error) {
                console.log(error);
            }
            this.loading = false;
        }
    },
});