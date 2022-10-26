import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import { loadFonts } from './plugins/webfontloader'
import { createPinia } from "pinia";
import axios from './plugins/axios';
import type { AxiosInstance } from 'axios';

loadFonts()

// const axi = axios.create({
//   baseURL: 'http://localhost:3200'
// })

import 'pinia'

declare module 'pinia' {
  export interface PiniaCustomProperties {
    axios: AxiosInstance
  }
}

const app = createApp(App);

app.use(axios, {
  baseUrl: 'http://localhost:3200'
});

const pinia = createPinia().use(() => ({
  axios: app.config.globalProperties.axios
}));

app.use(pinia);
app.use(router);
app.use(vuetify);
app.provide('axios', app.config.globalProperties.axios);


app.mount('#app');
