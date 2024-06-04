<!-- src/views/HomePage.vue -->
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
            <router-link class="nav-link" to="/login">Login</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/dashboard">Dashboard</router-link>
          </li>
        </ul>
      </div>
    </nav>
    
    <!-- Main Content -->
    <div class="container d-flex flex-column justify-content-center align-items-center vh-100">
      <h1 class="display-3">Web Messenger</h1>
      <p class="lead mt-3">Welcome to Web Messenger, your ultimate messaging app for seamless communication.</p>
      <p class="mt-1">To start using the app, please log in on the <router-link class="text-info" to="/login">Login</router-link> page.</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HomePage'
};
</script>
<style scoped>
.container {
  text-align: center;
}
</style>