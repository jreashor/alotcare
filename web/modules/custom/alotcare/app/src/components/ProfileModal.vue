<template>
  <div
    class="modal fade"
    id="profileModal"
    aria-labelledby="profileModalLabel"
    tabindex="-1"
    role="dialog"
    aria-hidden="true"
  >
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h4 class="modal-title" id="profileModalLabel">
            <span class="glyphicon glyphicon-user" aria-hidden="true"></span>
            {{ title }}
          </h4>
        </div>
        <div class="modal-body">
          <template v-if="staff">
            <div class="profile-img">
              <img
                class="img-responsive img-rounded img-thumbnail"
                src=""
                alt=""
              />
            </div>
            <h2>{{ staff.field_first_name }} {{ staff.field_last_name }}</h2>
            <h1 v-if="staff.field_preferred_name">
              <small>Preferred:</small> {{ staff.field_preferred_name }}
            </h1>
            <h4 :v-if="staff.field_position">
              {{ staff.field_position.name }}
            </h4>
            <p>{{ staff.field_bio }}</p>
          </template>
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
  name: "ProfileModal",
  components: {
    BaseButton,
  },
  props: ["staffId"],
  data() {
    return {
      title: "Profile",
      staff: null,
      loading: true,
      errored: false,
    };
  },
  watch: {
    staffId(newId, oldId) {
      if (newId != oldId) {
        this.loadStaff(newId);
      }
    },
  },
  methods: {
    loadStaff(id) {
      this.loading = true;
      axios
        .get("user/" + id + "?_format=json")
        .then((response) => {
          this.staff = response.data;
        })
        .catch((error) => {
          console.log(error);
          this.errored = true;
        })
        .finally(() => (this.loading = false));
    },
  },
};
</script>

<style>
/* Set above other modals. */
#profileModal {
  z-index: 1052;
}
#profileModal .modal-dialog {
  max-width: 450px;
  margin-top: 75px;
}
.modal-backdrop + .modal-backdrop {
  z-index: 1051;
}
</style>
