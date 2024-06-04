<template>
  <div class="bg-dark text-white vh-100 d-flex flex-column">
    <!-- Navbar -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark fixed-top">
      <a class="navbar-brand ms-2" href="#">Web Messenger</a>
      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav"
        aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
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
      <div class="navbar-text d-flex align-items-center">
        <img :src="user.photoURL || 'default-profile.png'" class="rounded-circle mr-2" style="width: 40px; height: 40px;"
          referrerpolicy="no-referrer">
        <div>
          <div>{{ user.displayName }}</div>
          <div>{{ user.email }}</div>
        </div>
        <button class="btn btn-danger ms-3" @click="logout">Logout</button>
      </div>
    </nav>
    <link rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" />
    <div class="d-flex h-100 flex-grow-1 overflow-hidden" style="margin-top: 60px;">
      <!-- Sidebar -->
      <div style="width: 300px; background-color: #303030;">
        <div class="p-3">
          <h2>Chats</h2>
          <input type="text" class="form-control mt-2 mb-3" placeholder="Search in Messenger" v-model="searchQuery"
            @input="searchChats" />
          <ul class="list-group list-group-flush">
            <li v-for="chat in filteredChats" :key="chat.id" @click="selectChat(chat)"
              :class="['list-group-item-dark', 'd-flex', 'justify-content-between', 'align-items-center', 'chat-item', { 'selected-chat': currentChatId === chat.id }]">
              <div class="d-flex align-items-center">
                <img :src="chat.photoURL || 'default-profile.png'" class="rounded-circle"
                  style="width: 40px; height: 40px; margin-right: 10px;" referrerpolicy="no-referrer">
                <div>
                  <div><strong>{{ chat.name }}</strong></div>
                  <div class="text-light" style="font-size: 0.85em;">{{ chat.lastMessage.text }}</div>
                  <div class="text-light" style="font-size: 0.65em;">{{ getTimeSince(chat.lastMessage.timestamp) }}</div>
                </div>
              </div>
              <div v-if="chat.unread" class="text-danger" style="font-size: 1.5em;">&#x26A0;</div>
            </li>
          </ul>

          <button @click="showAddChatModal" class="btn btn-primary mt-3">Add New Chat</button>
        </div>
      </div>

      <!-- Chat Area -->
      <div class="flex-grow-1 d-flex flex-column" style="margin-top: 20px;">
        <!-- Current Chat Info -->
        <div v-if="currentChatId" class="bg-secondary p-2 text-white d-flex align-items-center justify-content-between">
          <div>
            <img :src="currentChatPhotoURL || 'default-profile.png'" class="rounded-circle mr-2"
              style="width: 40px; height: 40px;" referrerpolicy="no-referrer">
            <h4 class="d-inline">{{ currentChatName }}</h4>
          </div>
          <div>
            <button @click="leaveChat" class="btn btn-danger mr-2">Leave</button>
            <button @click="showSettingsModal" class="btn btn-secondary">Settings</button>
          </div>
        </div>

        <!-- Chat Messages -->
        <div class="chat-messages flex-grow-1" style="overflow-y: auto;">
          <div v-for="message in messages" :key="message.id" class="p-2 message-item"
            @mouseover="showMessageOptions(message.id)" @mouseleave="hideMessageOptions(message.id)">
            <small style="font-size: 0.65em;">{{ formatTimestamp(message.timestamp) }}</small>
            <br>
            <strong>{{ getMessageSenderDisplayName(message.sender) }} : </strong>
            <span v-html="message.text"></span>
            <span v-if="message.edited" class="text-light small"><br>(edited)</span>
            <div v-if="message.imageUrls" class="image-message-grid">
              <div v-for="url in message.imageUrls" :key="url" class="image-message">
                <img :src="url" class="img-thumbnail" />
              </div>
            </div>
            <div v-if="message.reactions" class="message-reactions">
              <span v-for="(count, emoji) in message.reactions" :key="emoji" class="reaction small">{{ emoji }}{{ count >
                1 ? ' ' + count : '' }}</span>
            </div>
            <div v-if="messageOptions[message.id]" class="message-options">
              <button v-if="!message.deleted && message.sender !== 'system'" @click="editMessage(message)"
                class="btn btn-sm"><span class="material-icons"><img height="24px"
                    src="../assets/edit.png"></span></button>
              <button v-if="message.sender !== 'system'" @click="deleteMessage(message)" class="btn btn-sm"><span
                  class="material-icons"><img height="24px" src="../assets/delete.png"></span></button>
              <button @click="reactToMessage(message)" class="btn btn-sm"><span class="material-icons"><img height="24px"
                    src="../assets/sentiment_satisfied.png"></span></button>
            </div>
          </div>
        </div>

        <!-- Message Input Area -->
        <div v-if="currentChatId" class="p-3 bg-dark input-area" style="margin-bottom: 80px;">
          <div class="input-group">
            <div class="input-group-prepend">
              <label class="btn btn-secondary mb-0">
                📷
                <input type="file" @change="uploadImage" style="display: none;" multiple />
              </label>
            </div>
            <input v-model="newMessage" type="text" class="form-control" placeholder="Type message"
              @keyup.enter="sendMessage" @paste="handlePaste" />
            <div class="input-group-append">
              <button class="btn btn-primary" @click="sendMessage">Send</button>
            </div>
          </div>
          <div v-if="images.length" class="mt-2">
            <div class="image-preview-grid">
              <div v-for="(img, index) in images" :key="index" class="image-preview">
                <img :src="img.url" class="img-thumbnail" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Chat Modal -->
    <div v-if="isAddChatModalVisible" class="modal d-block" tabindex="-1" role="dialog"
      aria-labelledby="addChatModalLabel" aria-hidden="true" style="background-color: rgba(0,0,0,0.5);">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="addChatModalLabel">Add New Chat</h5>
            <button type="button" class="close top-0 start-0" @click="hideAddChatModal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <ul class="list-group">
              <li v-for="friend in friends" :key="friend.id" @click="selectFriendForChat(friend)"
                class="list-group-item list-group-item-action d-flex align-items-center">
                <img :src="friend.photoURL" alt="Profile Picture" referrerpolicy="no-referrer" class="rounded-circle mr-2"
                  width="40" height="40">
                <span>{{ friend.displayName }}</span>
              </li>
            </ul>
            <div v-if="selectedFriends.length > 0">
              <label class="text-dark">Selected Friends:</label>
              <ul>
                <li v-for="friend in selectedFriends" class="text-dark" :key="friend.id">{{ friend.displayName }}</li>
              </ul>
            </div>
            <div v-if="selectedFriends.length > 1">
              <input v-model="groupChatName" type="text" class="form-control" placeholder="Group Chat Name" />
              <input type="file" @change="uploadGroupImage" class="form-control mt-2" />
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="hideAddChatModal">Close</button>
            <button type="button" class="btn btn-primary" @click="addChat">Create Chat</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Settings Modal -->
    <div v-if="isSettingsModalVisible" class="modal d-block" tabindex="-1" role="dialog"
      aria-labelledby="settingsModalLabel" aria-hidden="true" style="background-color: rgba(0,0,0,0.5);">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <button type="button" class="close top-0 start-0" @click="hideSettingsModal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
            <h5 class="modal-title text-dark ps-2" id="settingsModalLabel">Chat Settings</h5>
          </div>
          <div class="modal-body">
            <div v-if="isGroupChat">
              <h6 class="text-dark">Group Chat Settings</h6>
              <input v-model="groupChatName" type="text" class="form-control mb-2" placeholder="Group Chat Name" />
              <button class="btn btn-primary mb-2" @click="updateGroupChatName">Save Group Name</button>
              <input type="file" @change="uploadGroupImage" class="form-control mb-2" />
              <button class="btn btn-primary mb-2" @click="updateGroupChatImage">Save Group Image</button>
              <h6 class="text-dark">Participants</h6>
              <ul class="list-group">
                <li v-for="participant in currentChatParticipants" :key="participant.id"
                  class="list-group-item d-flex justify-content-between align-items-center">
                  <span>{{ participant.displayName }}</span>
                  <button v-if="participant.id !== user.uid && isOwner" class="btn btn-danger btn-sm"
                    @click="removeParticipant(participant.id)">Remove</button>
                </li>
              </ul>
              <input v-model="newParticipantEmail" type="text" class="form-control mt-2"
                placeholder="Add participant by email" />
              <button class="btn btn-primary mt-2" @click="addParticipant">Add</button>
            </div>
            <div v-else>
              <h6 class="text-dark">Change Nickname</h6>
              <div class="input-group">
                <select v-model="selectedUserForNickname" class="form-control">
                  <option v-for="participant in currentChatParticipants" :key="participant.id" :value="participant.id">
                    {{ participant.displayName }}
                  </option>
                </select>
                <input v-model="newNickname" type="text" class="form-control" placeholder="New nickname" />
              </div>
              <button class="btn btn-primary mt-2" @click="changeNickname">Change</button>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="hideSettingsModal">Close</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Message Modal -->
    <div v-if="isEditMessageModalVisible" class="modal d-block" tabindex="-1" role="dialog"
      aria-labelledby="editMessageModalLabel" aria-hidden="true" style="background-color: rgba(0,0,0,0.5);">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <button type="button" class="close top-0 start-0" @click="hideEditMessageModal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
            <h5 class="modal-title text-dark ps-2" id="editMessageModalLabel">Edit Message</h5>
          </div>
          <div class="modal-body">
            <input v-model="messageToEdit.text" type="text" class="form-control" placeholder="Edit message" />
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="hideEditMessageModal">Cancel</button>
            <button type="button" class="btn btn-primary" @click="confirmEditMessage">Save changes</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Message Modal -->
    <div v-if="isDeleteMessageModalVisible" class="modal d-block" tabindex="-1" role="dialog"
      aria-labelledby="deleteMessageModalLabel" aria-hidden="true" style="background-color: rgba(0,0,0,0.5);">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <button type="button" class="close top-0 start-0" @click="hideDeleteMessageModal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
            <h5 class="modal-title text-dark ps-2" id="deleteMessageModalLabel">Delete Message</h5>
          </div>
          <div class="modal-body">
            <p>Do you want to delete this message for you or for the entire chat?</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="hideDeleteMessageModal">Cancel</button>
            <button type="button" class="btn btn-danger" @click="deleteMessageForMe">Delete for me</button>
            <button type="button" class="btn btn-danger" @click="deleteMessageForEveryone">Delete for everyone</button>
          </div>
        </div>
      </div>
    </div>

    <!-- React Message Modal -->
    <div v-if="isReactMessageModalVisible" class="modal d-block" tabindex="-1" role="dialog"
      aria-labelledby="reactMessageModalLabel" aria-hidden="true" style="background-color: rgba(0,0,0,0.5);">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <button type="button" class="close top-0 start-0" @click="hideReactMessageModal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
            <h5 class="modal-title text-dark ps-2" id="reactMessageModalLabel">React to Message</h5>
          </div>
          <div class="modal-body">
            <div class="reactions">
              <span @click="addReaction('❤️')"> ❤️ </span>
              <span @click="addReaction('😆')"> 😆 </span>
              <span @click="addReaction('😮')"> 😮 </span>
              <span @click="addReaction('😢')"> 😢 </span>
              <span @click="addReaction('😠')"> 😠 </span>
              <span @click="addReaction('👍')"> 👍 </span>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="hideReactMessageModal">Close</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { auth, db, ref, push, onValue, get, set, remove, update } from '../services/firebase';
import moment from "moment";
import { reactive } from 'vue';

export default {
  name: 'DashboardPage',
  data() {
    return {
      user: auth.currentUser,
      chats: [],
      friends: [],
      messages: [],
      newMessage: '',
      images: [],
      currentChatId: null,
      currentChatName: '',
      currentChatPhotoURL: '',
      isAddChatModalVisible: false,
      isSettingsModalVisible: false,
      isEditMessageModalVisible: false,
      isDeleteMessageModalVisible: false,
      isReactMessageModalVisible: false,
      selectedUserForNickname: null,
      newNickname: '',
      newParticipantEmail: '',
      messageToEdit: null,
      messageToDelete: null,
      messageOptions: reactive({}),
      reactMessage: null,
      selectedFriends: [],
      groupChatName: '',
      groupChatImage: null,
      searchQuery: '',
    };
  },

  computed: {
    filteredChats() {
      return this.chats.filter(chat =>
        chat.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    },
    currentChatParticipants() {
      if (!this.currentChatId) return [];
      const chat = this.chats.find(chat => chat.id === this.currentChatId);
      if (!chat) return [];
      return Object.keys(chat.participants).map(id => ({
        id,
        displayName: chat.participants[id].displayName,
        isOwner: chat.participants[id].isOwner
      }));
    },
    isGroupChat() {
      const chat = this.chats.find(chat => chat.id === this.currentChatId);
      return chat && chat.groupChatName;
    },
    isOwner() {
      const chat = this.chats.find(chat => chat.id === this.currentChatId);
      return chat && chat.participants[this.user.uid] && chat.participants[this.user.uid].isOwner;
    }
  },

  created() {
    if (!this.user) {
      this.$router.push('/login');
      return;
    }
    this.fetchChats();
    this.fetchFriends();
  },
  methods: {
    async logout() {
      await auth.signOut();
      this.$router.push('/');
    },
    showAddChatModal() {
      this.isAddChatModalVisible = true;
      this.selectedFriends = [];
    },
    hideAddChatModal() {
      this.isAddChatModalVisible = false;
    },
    showSettingsModal() {
      this.isSettingsModalVisible = true;
    },
    hideSettingsModal() {
      this.isSettingsModalVisible = false;
    },
    showEditMessageModal(message) {
      this.messageToEdit = { ...message };
      this.isEditMessageModalVisible = true;
    },
    hideEditMessageModal() {
      this.isEditMessageModalVisible = false;
    },
    showDeleteMessageModal(message) {
      this.messageToDelete = { ...message };
      this.isDeleteMessageModalVisible = true;
    },
    hideDeleteMessageModal() {
      this.isDeleteMessageModalVisible = false;
    },
    showReactMessageModal(message) {
      this.reactMessage = { ...message };
      this.isReactMessageModalVisible = true;
    },
    hideReactMessageModal() {
      this.isReactMessageModalVisible = false;
    },
    selectFriendForChat(friend) {
      if (!this.selectedFriends.includes(friend)) {
        this.selectedFriends.push(friend);
      }
    },
    async uploadImage(event) {
      const files = Array.from(event.target.files);
      if (files.length + this.images.length > 9) {
        alert('You can upload a maximum of 9 images.');
        return;
      }

      for (const file of files) {
        const url = URL.createObjectURL(file);
        this.images.push({ file, url });
      }
    },
    async uploadGroupImage(event) {
      const file = event.target.files[0];
      if (file) {
        try {
          const formData = new FormData();
          formData.append('image', file);
          const response = await fetch('http://localhost:3000/upload', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            throw new Error('Failed to upload image');
          }

          const data = await response.json();
          this.groupChatImage = data.imageUrls[0];
        } catch (error) {
          console.error('Error uploading group chat image:', error);
          alert('Failed to upload group chat image: ' + error.message);
        }
      }
    },
    async addChat() {
      if (this.selectedFriends.length > 1) {
        // Group chat creation
        const newChatRef = push(ref(db, 'chats'));
        const participants = this.selectedFriends.reduce((acc, friend) => {
          acc[friend.id] = { displayName: friend.displayName, photoURL: friend.photoURL, isOwner: false };
          return acc;
        }, { [auth.currentUser.uid]: { displayName: this.user.displayName, photoURL: this.user.photoURL, isOwner: true } });

        const newChat = {
          participants,
          lastMessage: {
            text: 'No messages yet',
            timestamp: null,
            read: { [auth.currentUser.uid]: true }
          },
          groupChatName: this.groupChatName,
          groupChatImage: this.groupChatImage
        };

        await set(newChatRef, newChat);

        // Add system message for chat creation
        const systemMessageRef = push(ref(db, `messages/${newChatRef.key}`));
        const systemMessage = {
          text: `${this.user.displayName} created the group chat.`,
          sender: 'system',
          timestamp: Date.now(),
        };
        await set(systemMessageRef, systemMessage);

        this.hideAddChatModal();
        this.fetchChats();
      } else if (this.selectedFriends.length === 1) {
        // One-on-one chat creation
        const friend = this.selectedFriends[0];
        const newChatRef = push(ref(db, 'chats'));
        const newChat = {
          participants: {
            [auth.currentUser.uid]: { displayName: this.user.displayName, photoURL: this.user.photoURL, isOwner: true },
            [friend.id]: { displayName: friend.displayName, photoURL: friend.photoURL, isOwner: false }
          },
          lastMessage: {
            text: 'No messages yet',
            timestamp: null,
            read: { [auth.currentUser.uid]: true, [friend.id]: false }
          }
        };
        await set(newChatRef, newChat);
        this.hideAddChatModal();
        this.fetchChats();
      }
    },
    async fetchChats() {
      const chatsRef = ref(db, 'chats');
      onValue(chatsRef, async snapshot => {
        const chatsData = snapshot.val();
        this.chats = [];

        for (let chatId in chatsData) {
          const chat = chatsData[chatId];

          if (!chat.participants || !chat.lastMessage) {
            continue; // Skip invalid chat data
          }

          const participants = Object.keys(chat.participants);
          if (participants.includes(this.user.uid)) {
            let unread = false;
            if (chat.lastMessage.read && chat.lastMessage.read[this.user.uid] === false) {
              unread = true;
            }

            const otherParticipantKey = participants.find(participantId => participantId !== this.user.uid);
            const otherParticipant = chat.participants[otherParticipantKey] || {};

            this.chats.push({
              id: chatId,
              ...chat,
              name: chat.groupChatName || otherParticipant.displayName || 'Unknown',
              photoURL: chat.groupChatImage || otherParticipant.photoURL || 'default-profile.png',
              unread
            });
          }
        }
      });
    },

    async fetchMessages(chatId) {
      const messagesRef = ref(db, `messages/${chatId}`);
      onValue(messagesRef, snapshot => {
        const messagesData = snapshot.val();
        this.messages = [];
        for (let messageId in messagesData) {
          const message = messagesData[messageId];
          this.messages.push({ id: messageId, ...message });
        }
        this.markMessagesAsRead(chatId);  // Mark messages as read when fetching
      });
    },

    handlePaste(event) {
      const items = (event.clipboardData || window.clipboardData).items;
      for (const item of items) {
        if (item.type.indexOf('image') !== -1) {
          const file = item.getAsFile();
          const url = URL.createObjectURL(file);
          this.images.push({ file, url });
        }
      }
      if (this.images.length > 9) {
        this.images = this.images.slice(0, 9);
        alert('You can upload a maximum of 9 images.');
      }
    },
    async sendMessage() {
      if (this.newMessage.trim() === '' && this.images.length === 0) return;

      try {
        // Upload images first
        const imageUrls = await Promise.all(
          this.images.map(async (image) => {
            const formData = new FormData();
            formData.append('image', image.file);
            const response = await fetch('http://localhost:3000/upload', {
              method: 'POST',
              body: formData,
            });

            if (!response.ok) {
              throw new Error('Failed to upload image');
            }

            const data = await response.json();
            return data.imageUrls[0];
          })
        );

        // Create a message with text and image URLs
        const newMessageRef = push(ref(db, `messages/${this.currentChatId}`));
        const message = {
          text: this.newMessage,
          sender: this.user.displayName,
          timestamp: Date.now(),
          imageUrls,
        };
        await set(newMessageRef, message);
        await update(ref(db, `chats/${this.currentChatId}/lastMessage`), {
          text: this.newMessage || 'Image',
          timestamp: Date.now(),
          read: { [this.user.uid]: true, ...this.getReadStatusForParticipants() },
        });

        this.newMessage = '';
        this.images = [];
      } catch (error) {
        console.error('Error sending message:', error);
        alert('Failed to send message: ' + error.message);
      }
    },
    async removeChat(chatId) {
      await remove(ref(db, `chats/${chatId}`));
      this.currentChatId = null;
      this.currentChatName = '';
      this.currentChatPhotoURL = '';
      this.messages = [];
    },

    leaveChat() {
      if (confirm("Are you sure you want to leave the chat?")) {
        const chatRef = ref(db, `chats/${this.currentChatId}/participants/${this.user.uid}`);
        remove(chatRef).then(async () => {
          // Add system message for leaving
          const systemMessageRef = push(ref(db, `messages/${this.currentChatId}`));
          const systemMessage = {
            text: `${this.user.displayName} has left the chat.`,
            sender: 'system',
            timestamp: Date.now(),
          };
          await set(systemMessageRef, systemMessage);

          this.fetchChats();
          this.currentChatId = null;
          this.currentChatName = '';
          this.currentChatPhotoURL = '';
          this.messages = [];
        });
        location.reload();
      }
    },

    selectChat(chat) {
      this.currentChatId = chat.id;
      const participants = Object.keys(chat.participants);
      const recipientId = participants.find(participantId => participantId !== this.user.uid);
      const recipient = chat.participants[recipientId];
      this.currentChatName = chat.groupChatName || (recipient ? recipient.displayName : 'Unknown');
      this.currentChatPhotoURL = chat.groupChatImage || (recipient ? recipient.photoURL : 'default-profile.png');

      this.fetchMessages(chat.id);
    },

    async markMessagesAsRead(chatId) {
      const chatRef = ref(db, `chats/${chatId}/lastMessage/read/${this.user.uid}`);
      await set(chatRef, true);
    },

    getRecipientId() {
      const chat = this.chats.find(chat => chat.id === this.currentChatId);
      if (chat) {
        return Object.keys(chat.participants).find(participantId => participantId !== this.user.uid);
      }
      return null;
    },

    getReadStatusForParticipants() {
      const chat = this.chats.find(chat => chat.id === this.currentChatId);
      if (chat) {
        const readStatus = {};
        Object.keys(chat.participants).forEach(participantId => {
          readStatus[participantId] = participantId === this.user.uid;
        });
        return readStatus;
      }
      return {};
    },

    getTimeSince(timestamp) {
      if (!timestamp) return '';
      return moment(timestamp).fromNow();
    },

    formatTimestamp(timestamp) {
      return moment(timestamp).format('MMM Do, h:mm a');
    },

    async fetchFriends() {
      const usersRef = ref(db, 'users');
      onValue(usersRef, snapshot => {
        const usersData = snapshot.val();
        this.friends = [];
        for (let userId in usersData) {
          if (userId !== this.user.uid) {
            this.friends.push({ id: userId, ...usersData[userId] });
          }
        }
      });
    },

    async changeNickname() {
      if (this.selectedUserForNickname && this.newNickname.trim()) {
        const chatRef = ref(db, `chats/${this.currentChatId}/participants/${this.selectedUserForNickname}/displayName`);
        const oldDisplayName = this.currentChatParticipants.find(participant => participant.id === this.selectedUserForNickname).displayName;
        const newDisplayName = this.newNickname.trim();

        // Update the display name in the participants list
        await set(chatRef, newDisplayName);

        // Add a system message to indicate the nickname change
        const systemMessageRef = push(ref(db, `messages/${this.currentChatId}`));
        const systemMessage = {
          text: `${oldDisplayName} changed their nickname to: "${newDisplayName}"`,
          sender: 'system',
          timestamp: Date.now(),
        };
        await set(systemMessageRef, systemMessage);

        // Update the local chat data to reflect the nickname change
        const chatIndex = this.chats.findIndex(chat => chat.id === this.currentChatId);
        if (chatIndex !== -1) {
          this.chats[chatIndex].participants[this.selectedUserForNickname].displayName = newDisplayName;
          this.chats = [...this.chats];  // Force Vue to re-render the chats list
        }

        // Update the messages to reflect the new nickname
        this.messages = this.messages.map(message => {
          if (message.sender === oldDisplayName) {
            return { ...message, sender: newDisplayName };
          }
          return message;
        });

        this.newNickname = '';
        this.hideSettingsModal();
      }
    },
    getMessageSenderDisplayName(sender) {
      const chat = this.chats.find(chat => chat.id === this.currentChatId);
      if (!chat) return sender;
      const participant = Object.values(chat.participants).find(p => p.displayName === sender);
      return participant ? participant.displayName : sender;
    },
    showMessageOptions(messageId) {
      this.messageOptions[messageId] = true;
    },
    hideMessageOptions(messageId) {
      this.messageOptions[messageId] = false;
    },
    editMessage(message) {
      this.showEditMessageModal(message);
    },
    async confirmEditMessage() {
      const editedMessageRef = ref(db, `messages/${this.currentChatId}/${this.messageToEdit.id}`);
      await update(editedMessageRef, {
        text: this.messageToEdit.text,
        edited: true,
      });
      this.hideEditMessageModal();
    },
    deleteMessage(message) {
      this.showDeleteMessageModal(message);
    },
    async deleteMessageForMe() {
      const messageToDeleteRef = ref(db, `messages/${this.currentChatId}/${this.messageToDelete.id}`);
      await remove(messageToDeleteRef);
      this.hideDeleteMessageModal();
      this.messages = this.messages.map(m => m.id === this.messageToDelete.id ? { ...m, text: 'you deleted this message to yourself' } : m);
    },
    async deleteMessageForEveryone() {
      const messageToDeleteRef = ref(db, `messages/${this.currentChatId}/${this.messageToDelete.id}`);
      await update(messageToDeleteRef, {
        text: this.user.displayName + ' deleted message.',
        deleted: true,
      });
      this.hideDeleteMessageModal();
    },
    reactToMessage(message) {
      this.showReactMessageModal(message);
    },
    async addReaction(emoji) {
      const reactMessageRef = ref(db, `messages/${this.currentChatId}/${this.reactMessage.id}/reactions/${emoji}`);
      const currentCountSnapshot = await get(reactMessageRef);
      const currentCount = currentCountSnapshot.exists() ? currentCountSnapshot.val() : 0;
      await set(reactMessageRef, currentCount + 1);
      this.hideReactMessageModal();
    },
    async removeParticipant(participantId) {
      if (confirm("Are you sure you want to remove this participant?")) {
        const chatRef = ref(db, `chats/${this.currentChatId}/participants/${participantId}`);
        await remove(chatRef);
        const systemMessageRef = push(ref(db, `messages/${this.currentChatId}`));
        const systemMessage = {
          text: `${this.user.displayName} removed a participant.`,
          sender: 'system',
          timestamp: Date.now(),
        };
        await set(systemMessageRef, systemMessage);
      }
    },
    async addParticipant() {
      const usersRef = ref(db, 'users');
      const snapshot = await get(usersRef);
      const usersData = snapshot.val();

      const user = Object.values(usersData).find(user => user.email === this.newParticipantEmail);
      console.log('User found:', user); // Debug log
      if (user) {
        const chatRef = ref(db, `chats/${this.currentChatId}/participants/${user.id}`);
        await set(chatRef, { displayName: user.displayName, photoURL: user.photoURL, isOwner: false });

        const systemMessageRef = push(ref(db, `messages/${this.currentChatId}`));
        const systemMessage = {
          text: `${user.displayName} joined your group chat.`,
          sender: 'system',
          timestamp: Date.now(),
        };
        await set(systemMessageRef, systemMessage);

        this.newParticipantEmail = '';
      } else {
        alert('User not found');
      }
    },
    async updateGroupChatName() {
      if (this.currentChatId) {
        const chatRef = ref(db, `chats/${this.currentChatId}`);
        await update(chatRef, {
          groupChatName: this.groupChatName,
        });

        const systemMessageRef = push(ref(db, `messages/${this.currentChatId}`));
        const systemMessage = {
          text: `${this.user.displayName} changed the group name to "${this.groupChatName}".`,
          sender: 'system',
          timestamp: Date.now(),
        };
        await set(systemMessageRef, systemMessage);

        this.hideSettingsModal();
      }
    },
    async updateGroupChatImage() {
      if (this.currentChatId) {
        const chatRef = ref(db, `chats/${this.currentChatId}`);
        await update(chatRef, {
          groupChatImage: this.groupChatImage,
        });

        const systemMessageRef = push(ref(db, `messages/${this.currentChatId}`));
        const systemMessage = {
          text: `${this.user.displayName} changed the group image.`,
          sender: 'system',
          timestamp: Date.now(),
        };
        await set(systemMessageRef, systemMessage);

        this.hideSettingsModal();
      }
    },
    searchChats() {
      // Trigger search based on searchQuery
      this.filteredChats;
    },
  },
};
</script>

<style scoped>
.container {
  text-align: center;
}

.modal.d-block {
  display: block;
}

.selected-chat {
  background-color: #414141 !important;
}

.list-group-item-dark {
  background-color: #303030;
  border: none;
  color: white;
  padding: 10px;
  cursor: pointer;
  border-radius: 10px;
}

.bg-secondary {
  display: flex;
  align-items: center;
  padding: 10px;
  color: white;
}

.rounded-circle {
  width: 40px;
  height: 40px;
  margin-right: 10px;
}

.btn-danger {
  margin-right: 10px;
}

.chat-messages {
  overflow-y: auto;
  flex-grow: 1;
}

.input-area {
  padding: 15px;
  background-color: #333;
}

.overflow-hidden {
  overflow: hidden;
}

.list-group-item {
  background-color: #ffffff;
  border: none;
  color: black;
  cursor: pointer;
  border-radius: 10px;
}

.selected-chat {
  background-color: #414141;
}

.chat-item:hover {
  background-color: #383838;
}

.list-group-item div,
.list-group-item-dark div {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.chat-messages {
  position: relative;
}

.input-area {
  margin-top: auto;
}

.image-preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 10px;
}

.image-preview {
  position: relative;
}

.image-preview img {
  width: 100%;
  height: auto;
}

.text-muted {
  display: block;
  font-size: 0.75em;
  color: #6c757d;
}

.image-message-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 10px;
  margin-top: 10px;
}

.image-message img {
  width: 100%;
  height: auto;
}

.message-item {
  position: relative;
}

.message-options {
  position: absolute;
  top: 50%;
  right: 0;
  transform: translateY(-50%);
  display: flex;
  gap: 5px;
  visibility: hidden;
}

.message-options {
  visibility: visible;
  color: white;
}

.message-reactions {
  display: flex;
  gap: 5px;
  margin-top: 5px;
}</style>
