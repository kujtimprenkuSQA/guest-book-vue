import { createApp } from "vue";
import "./shims";
import "./style.css";
import "@near-wallet-selector/modal-ui/styles.css";
import "@near-wallet-selector/account-export/styles.css";
import App from "./App.vue";

createApp(App).mount("#app");
