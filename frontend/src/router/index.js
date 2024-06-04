import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '../views/Home-Page.vue';
import LoginPage from '../views/LoginPage.vue';
import DashboardPage from '../views/DashboardPage.vue';
import FriendsPage from "../views/FriendsPage.vue";
import { auth } from '../services/firebase';

const routes = [
  {
    path: '/',
    name: 'HomePage',
    component: HomePage
  },
  {
    path: '/login',
    name: 'LoginPage',
    component: LoginPage
  },
  {
    path: "/friends",
    name: "FriendsPage",
    component: FriendsPage,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/dashboard',
    name: 'DashboardPage',
    component: DashboardPage,
    meta: {
      requiresAuth: true
    }
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  
  auth.onAuthStateChanged(user => {
    const isAuthenticated = user !== null;

    if (requiresAuth && !isAuthenticated) {
      next('/login');
    } else {
      next();
    }
  });
});

export default router;
