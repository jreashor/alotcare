import { defineStore } from "pinia";
import axios from "axios";

export const useMessageStore = defineStore('message', {
    state: () => ({
        enabled: false,
        loading: true,
        id: null,
    }),
    actions: {
        async send() {
            console.log(this.id);
            this.loading = true;

            const messageData = {
                id: this.id,
                message: "Hello World"
            };

            try {
                const { data } = await axios.get("session/token");
                console.log("data", data);
                const response = await axios({
                    method: "POST",
                    url: "/api/message?_format=json",
                    data: messageData,
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRF-Token": data,
                    },
                });
                if (response.status == 200 || response.status == 201) {
                    console.log("response", response);
                }
            } catch (error) {
                console.log("error", error);
            }
            this.loading = false;
        }
    },
});