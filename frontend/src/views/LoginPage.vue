<template>
  <div class="bg-dark text-white vh-100">
    <!-- Navbar -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
      <a class="navbar-brand" href="#">Web Messenger</a>
      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ml-auto">
          <li class="nav-item">
            <router-link class="nav-link" to="/">Home</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/dashboard">Dashboard</router-link>
          </li>
        </ul>
      </div>
    </nav>
    
    <!-- Main Content -->
    <div class="container d-flex flex-column justify-content-center align-items-center vh-100">
      <h1 class="display-4">Login</h1>
      <form @submit.prevent="login" class="w-50 mt-3">
        <div class="form-group">
          <input v-model="email" type="email" class="form-control" placeholder="Email" />
        </div>
        <br>
        <div class="form-group">
          <input v-model="password" type="password" class="form-control" placeholder="Password" />
        </div>
        <br>
        <button type="submit" class="btn btn-primary btn-block">Login</button>
        <br>
        <button @click="loginWithGoogle" type="button" class="btn btn-danger btn-block mt-2">
          <img src="https://img.icons8.com/color/16/000000/google-logo.png" alt="Google icon" class="mr-2" />
          Login with Google
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import { auth, googleProvider, db, ref, set, get } from '../services/firebase';
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";

export default {
  name: 'LoginPage',
  data() {
    return {
      email: '',
      password: ''
    };
  },
  created() {
    if (auth.currentUser) {
      this.$router.push('/dashboard');
    }
  },
  methods: {
    async login() {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, this.email, this.password);
        await this.saveUserToDatabase(userCredential.user);
        this.$router.push('/dashboard');
      } catch (error) {
        console.error('Authentication failed:', error);
      }
    },
    async loginWithGoogle() {
      try {
        const userCredential = await signInWithPopup(auth, googleProvider);
        await this.saveUserToDatabase(userCredential.user);
        this.$router.push('/dashboard');
      } catch (error) {
        console.error('Google authentication failed:', error);
      }
    },
    async saveUserToDatabase(user) {
      const userRef = ref(db, `users/${user.uid}`);
      const snapshot = await get(userRef);
      if (!snapshot.exists()) {
        await set(userRef, {
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL
        });
      }
    }
  }
};
</script>

<style scoped>
.container {
  text-align: center;
}
</style>
