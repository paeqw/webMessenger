import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { auth } from './services/firebase';

let app;

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

auth.onAuthStateChanged(() => {
  if (!app) {
    app = createApp(App);
    app.use(router);
    app.mount('#app');
  }
});
