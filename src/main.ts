import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import { loadFonts } from './plugins/webfontloader'
import { createPinia } from "pinia";
import axios from './plugins/axios';
import type { AxiosInstance } from 'axios';
import '@/assets/main.css';

loadFonts()

// const axi = axios.create({
//   baseURL: 'http://localhost:3200'
// })

import 'pinia'
import { SocketIOService } from "@/services/SocketIO";

declare module 'pinia' {
  export interface PiniaCustomProperties {
    axios: AxiosInstance
  }
}

const app = createApp(App);

app.use(axios, {
  baseUrl: 'http://192.168.1.2:3000'
});

const pinia = createPinia().use(() => ({
  axios: app.config.globalProperties.axios
}));

app.use(pinia);
app.use(router);
app.use(vuetify);
app.provide('axios', app.config.globalProperties.axios);

const socketIOService = new SocketIOService();
app.provide('socketio', socketIOService);


app.mount('#app');
