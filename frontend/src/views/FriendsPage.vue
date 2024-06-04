<template>
  <div class="bg-dark text-white vh-100 d-flex flex-column">
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
            <router-link class="nav-link" to="/dashboard">Chats</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/friends">Friends</router-link>
          </li>
        </ul>
      </div>
    </nav>

    <!-- Main Content -->
    <div class="container d-flex flex-column justify-content-center align-items-center flex-grow-1">
      <h1 class="display-4">Friends</h1>
      <div class="w-75 mt-3">
        <h2 class="h4">Your Friends</h2>
        <ul class="list-group">
          <li v-for="friend in friends" :key="friend.id" class="list-group-item mb-3 list-group-item-dark d-flex justify-content-between align-items-center">
            <img :src="friend.photoURL" alt="Profile Picture" class="rounded-circle" width="40" height="40">
            <span>{{ friend.displayName }}</span>
            <button @click="removeFriend(friend.id)" class="btn btn-danger btn-sm">Remove</button>
          </li>
        </ul>
      </div>
      <div class="mt-4 w-75">
        <h2 class="h4">Add Friend</h2>
        <form @submit.prevent="addFriend" class="form-inline">
          <div class="form-group mb-2">
            <input v-model="newFriendEmail" type="email" class="form-control" placeholder="Friend's Email" required />
          </div>
          <button type="submit" class="btn btn-primary mb-2 ml-2">Add</button>
        </form>
      </div>
      <div v-if="notification" class="alert alert-info mt-3" role="alert">
        {{ notification }}
      </div>
    </div>

    <!-- Logged in User Info and Logout Button -->
    <div class="d-flex align-items-center p-3 bg-secondary text-white" style="position: fixed; bottom: 0; left: 0; width: 100%;">
      <img :src="user.photoURL" alt="Profile Picture" class="rounded-circle" width="40" height="40" v-if="user.photoURL">
      <div class="ml-3">
        <strong>{{ user.displayName }}</strong><br>
        <small>{{ user.email }}</small>
      </div>
      <button class="btn btn-danger btn-sm ml-auto" @click="logout">Logout</button>
    </div>

    <!-- Friend Request Modal -->
    <div v-if="showFriendRequestModal" class="modal d-block" tabindex="-1" role="dialog">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <button type="button" class="close" @click="closeFriendRequestModal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
            <h5 class="modal-title text-dark ps-3">Friend Request</h5>
            
          </div>
          <div class="modal-body">
            <p class="text-dark">{{ friendRequestMessage }}</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeFriendRequestModal">Reject</button>
            <button type="button" class="btn btn-primary" @click="acceptFriendRequest">Accept</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { auth, db, ref, query, orderByChild, equalTo, push, onValue, set, remove } from '../services/firebase';

export default {
  name: 'FriendsPage',
  data() {
    return {
      user: auth.currentUser,
      friends: [],
      newFriendEmail: '',
      notification: '',
      showFriendRequestModal: false,
      friendRequestMessage: '',
      currentFriendRequest: null
    };
  },
  created() {
  if (!this.user) {
    this.$router.push('/login');
    return;
  }
  this.fetchFriends();
  this.listenForFriendRequests();
},
  methods: {
    async logout() {
      await auth.signOut();
      this.$router.push('/');
    },
    async addFriend() {
      if (this.newFriendEmail.toLowerCase() === this.user.email.toLowerCase()) {
        this.notification = "You cannot add yourself as a friend.";
        return;
      }

      if (this.newFriendEmail) {
        const userDetails = await this.getUserDetailsByEmail(this.newFriendEmail);
        if (userDetails) {
          const friendRequestsRef = ref(db, 'friendRequests');
          const newFriendRequestRef = push(friendRequestsRef);
          await set(newFriendRequestRef, {
            from: this.user.uid,
            fromDisplayName: this.user.displayName,
            fromPhotoURL: this.user.photoURL,
            to: userDetails.uid,
            toDisplayName: userDetails.displayName,
            toPhotoURL: userDetails.photoURL
          });

          this.notification = `Friend request sent to ${userDetails.displayName}`;
          this.newFriendEmail = '';
        } else {
          this.notification = `User with email ${this.newFriendEmail} not found.`;
        }
      }
    },
    async getUserDetailsByEmail(email) {
      const usersRef = query(ref(db, 'users'), orderByChild('email'), equalTo(email));
      return new Promise((resolve) => {
        onValue(usersRef, (snapshot) => {
          const users = snapshot.val();
          if (users) {
            const userId = Object.keys(users)[0];
            resolve({ uid: userId, ...users[userId] });
          } else {
            resolve(null);
          }
        }, { onlyOnce: true });
      });
    },
    async removeFriend(friendId) {
      const friendRef = ref(db, `users/${auth.currentUser.uid}/friends/${friendId}`);
      await remove(friendRef);

      const currentUserRef = ref(db, `users/${friendId}/friends/${auth.currentUser.uid}`);
      await remove(currentUserRef);

      this.fetchFriends();
    },
    async fetchFriends() {
      const friendsRef = ref(db, `users/${auth.currentUser.uid}/friends`);
      onValue(friendsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          this.friends = Object.keys(data).map((key) => ({
            id: key,
            ...data[key]
          }));
        } else {
          this.friends = [];
        }
      });
    },
    listenForFriendRequests() {
      const friendRequestsRef = ref(db, 'friendRequests');
      onValue(friendRequestsRef, (snapshot) => {
        const requests = snapshot.val();
        if (requests) {
          Object.keys(requests).forEach((key) => {
            const request = requests[key];
            if (request.to === auth.currentUser.uid && !this.showFriendRequestModal) {
              this.currentFriendRequest = { key, ...request };
              this.friendRequestMessage = `${request.fromDisplayName} wants to add you as a friend. Do you accept?`;
              this.showFriendRequestModal = true;
            }
          });
        }
      });
    },
    closeFriendRequestModal() {
      this.showFriendRequestModal = false;
      this.currentFriendRequest = null;
    },
    async acceptFriendRequest() {
      if (this.currentFriendRequest) {
        const request = this.currentFriendRequest;
        await this.addFriendToDatabase(auth.currentUser.uid, request.from, request.fromDisplayName, request.fromPhotoURL);
        await this.addFriendToDatabase(request.from, auth.currentUser.uid, auth.currentUser.displayName, auth.currentUser.photoURL);
        await remove(ref(db, `friendRequests/${request.key}`));
        this.closeFriendRequestModal();
      }
    },
    async addFriendToDatabase(userId, friendId, displayName, photoURL) {
      const userFriendsRef = ref(db, `users/${userId}/friends/${friendId}`);
      await set(userFriendsRef, {
        displayName: displayName,
        photoURL: photoURL
      });
      this.fetchFriends();
    }
  }
};
</script>

<style scoped>
.container {
  text-align: center;
}
img {
  margin-right: 10px;
}
.modal.d-block {
  display: block;
  background-color: rgba(0, 0, 0, 0.5);
}
</style>
