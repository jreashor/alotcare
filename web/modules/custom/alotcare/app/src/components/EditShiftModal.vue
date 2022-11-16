<template>
  <div
    class="modal fade"
    :id="modalId"
    tabindex="-1"
    role="dialog"
    :aria-labelledby="modalId + 'Label'"
    aria-hidden="true"
  >
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h4 class="modal-title" :id="modalId + 'Label'">
            <span class="glyphicon glyphicon-edit" aria-hidden="true"></span>
            {{ shift.title }}
          </h4>
        </div>
        <div class="modal-body">
          <p>View applicant profiles and assign staff.</p>
          <ul class="list-group">
            <li
              v-for="staff in shift.field_applicants"
              :key="staff.uid"
              class="list-group-item"
              :class="{
                active:
                  shift.field_assigned_to.uid &&
                  shift.field_assigned_to.uid == staff.uid,
                disabled: shift.field_assigned_to || loading,
              }"
            >
              <base-button
                v-if="
                  shift.field_assigned_to &&
                  shift.field_assigned_to.uid == staff.uid
                "
                label="Assigned"
                type="success"
                icon="check"
                size="xs"
                disabled
              />
              <base-button
                v-else-if="shift.field_assigned_to"
                label="Assigned"
                type="link"
                icon="ban-circle"
                size="xs"
                disabled
              />
              <base-button
                v-else
                label="Assigned"
                type="success"
                icon="unchecked"
                size="xs"
                @click="assignTo(staff.uid)"
              />
              <base-button
                type="link"
                size="xs"
                icon="user"
                label="Profile"
                @click="openProfile(staff.uid)"
              />
              {{ staff.field_last_name }}, {{ staff.field_first_name }}
              <base-button
                v-if="
                  shift.field_assigned_to &&
                  shift.field_assigned_to.uid == staff.uid
                "
                class="pull-right"
                label="Unassign"
                type="danger"
                icon="remove"
                size="xs"
                :disabled="loading"
                @click="unAssign()"
              />
            </li>
          </ul>
        </div>
        <div class="modal-footer">
          <base-button
            label="Remove Shift"
            type="danger"
            icon="remove"
            size="sm"
            :disabled="loading"
          />
        </div>
        <div class="modal-footer">
          <div class="modal-alerts"></div>
          <base-button
            data-dismiss="modal"
            label="Close"
            type="primary"
            icon="remove"
            :disabled="loading"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import BaseButton from "./BaseButton.vue";

export default {
  name: "EditShiftModal",
  components: {
    BaseButton,
  },
  props: ["shiftId"],
  data() {
    return {
      modalId: "editShiftModal",
      title: "Edit Shift",
      shift: {},
      profile: {},
      loading: true,
      errored: false,
    };
  },
  watch: {
    shiftId(newId, oldId) {
      if (newId != oldId) {
        this.loadShift(newId);
      }
    },
  },
  methods: {
    loadShift(id) {
      this.loading = true;
      axios
        .get("node/" + id + "?_format=json")
        .then((response) => {
          this.shift = response.data;
        })
        .catch((error) => {
          console.log(error);
          this.errored = true;
        })
        .finally(() => (this.loading = false));
    },
    openProfile(id) {
      window.App.setStaffId(id);
      window
        .jQuery("#profileModal")
        .modal({ backdrop: "static", keyboard: false });
    },
    async assignTo(id) {
      this.loading = true;
      const url = "node/" + this.shiftId + "?_format=json";
      const node = {
        type: [{ target_id: "shift" }],
        field_assigned_to: [{ target_id: id }],
      };

      try {
        const { data } = await axios.get("session/token");
        const response = await axios({
          method: "PATCH",
          url: url,
          data: node,
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": data,
          },
        });
        if (response.status == 200) {
          this.shift = response.data;
        }
      } catch (error) {
        console.log(error);
      }
      this.loading = false;
    },
    async unAssign() {
      this.loading = true;
      const url = "node/" + this.shiftId + "?_format=json";
      const node = {
        type: [{ target_id: "shift" }],
        field_assigned_to: [],
      };

      try {
        const { data } = await axios.get("session/token");
        const response = await axios({
          method: "PATCH",
          url: url,
          data: node,
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": data,
          },
        });
        if (response.status == 200) {
          this.shift = response.data;
        }
      } catch (error) {
        console.log(error);
      }
      this.loading = false;
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
