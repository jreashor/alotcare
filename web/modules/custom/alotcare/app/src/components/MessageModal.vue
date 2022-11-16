<template>
  <div
    class="modal fade"
    id="messageModal"
    aria-labelledby="messageModalLabel"
    tabindex="-1"
    role="dialog"
    aria-hidden="true"
  >
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h4 class="modal-title" id="messageModalLabel">
            <span class="glyphicon glyphicon-send" aria-hidden="true"></span>
            Message Staff
          </h4>
        </div>
        <div class="modal-body clearfix">
          <textarea class="form-control" rows="6"></textarea>
          <base-button
            label="Send Message"
            class="btn-success pull-right"
            icon="send"
            size="sm"
            :disabled="loading"
            @click="store.send()"
          />
        </div>
        <div class="modal-footer">
          <div class="modal-alerts"></div>
          <base-button
            data-dismiss="modal"
            label="Close"
            class="btn-primary"
            icon="remove"
            :disabled="loading"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import BaseButton from "./BaseButton.vue";
import { useMessageStore } from "../stores/message";
const store = useMessageStore();
</script>

<style scoped>
textarea {
  margin-bottom: 20px;
}
/* Set above other modals. */
#messageModal {
  z-index: 1052;
}
#messageModal .modal-dialog {
  max-width: 450px;
  margin-top: 75px;
}
.modal-backdrop + .modal-backdrop {
  z-index: 1051;
}
</style>
