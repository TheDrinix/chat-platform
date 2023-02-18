<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import defaultUserPfpUrl from "@/assets/images/default_user_pfp.png"
import { useUserStore } from "@/stores/user";
import { computed, inject, ref } from "vue";
import SettingOverlay from "@/components/userSettings/SettingOverlay.vue";
import type { AxiosInstance } from "axios";
import { checkTokenExpirationError } from "@/helpers";
import type { LoggedInUser, User, UserResponseData } from "@/interfaces/user";
import type { VTextField } from "vuetify/components";
import { useDisplay } from "vuetify";

const router = useRouter();

const userStore = useUserStore();

const axios = inject<AxiosInstance>("axios");

if (!axios) throw new Error("Axios injection failed");

const serverUrl = import.meta.env["VITE_SERVER_URL"];

const isDisplayLg = useDisplay().lgAndUp;

let usernameEditMode = ref(false);
let username = ref(userStore.user.username);
let usernameInput = ref<VTextField>();

let tagEditMode = ref(false);
let tag = ref(userStore.user.public_uid);
let tagInput = ref<VTextField>();

let mailEditMode = ref(false);
let mail = ref(userStore.user.email);
let mailInput = ref<VTextField>();

let colorDialog = ref(false);
let pfpInput = ref<HTMLInputElement>();
let pfpDialog = ref(false);

const userPfpUrl = computed(() => {
  return userStore.user.pfpUrl ? `${serverUrl}${userStore.user.pfpUrl}` : defaultUserPfpUrl
})

const user = computed(() => {
  return userStore.user
})

const hexToRgb = (hex: string): RGB => {
  const red = hex.slice(1, 3);
  const green = hex.slice(3, 5);
  const blue = hex.slice(5);

  return {
    r: parseInt(red, 16),
    g: parseInt(green, 16),
    b: parseInt(blue, 16)
  }
}

const rgbToHex = (rgb: RGB): string => {
  const [red, green, blue] = [rgb.r, rgb.g, rgb.b].map(c => {
    const hex = c.toString(16);
    return hex.length === 1 ? '0' + hex : hex
  });

  return `#${red + green + blue}`
}

let colors = ref<RGB>(hexToRgb(userStore.user.accent_color ?? '#FF0000'));
const hex = computed(() => {
  return rgbToHex(colors.value);
})
const rgb = computed(() => {
  return hexToRgb(hex.value)
})
const isColorValid = computed(() => {
  return validateColor(rgb.value);
})

const validateColor = (rgb: RGB): boolean => {
  const colorsArray = [rgb.r, rgb.g, rgb.b].sort((a, b) => a - b);

  const isValid = colorsArray.every(c => c >= 48)
    || colorsArray[2] >= 64
    || (colorsArray[1] >= 32 && colorsArray[2] >= 56)

  return isValid;
}

interface RGB {
  r: number;
  g: number;
  b: number;
}
async function handlePfpFileChange(e: Event) {
  let files = (<HTMLInputElement>e.target).files;

  if (!files || files.length === 0) return;

  const body = new FormData();

  body.append("pfp", files[0]);

  const res = await axios?.post<string>("/user/updatePfp", body, {
    headers: {
      Authorization: `Bearer ${userStore.tokens.access_token}`
    }
  }).catch(async (e: any) => {
    if (await checkTokenExpirationError(e)) {
      return;
    }
  })

  if (res?.data) {
    userStore.updateUserData({ pfpUrl: res.data });
  }
}

function handleColorUpdate() {
  if (!validateColor(rgb.value)) return;

  handleUserUpdate({accent_color: hex.value});

  colorDialog.value = false;
}
async function handleUserUpdate(data: Partial<LoggedInUser>) {
  if (
    (await tagInput.value?.validate())?.length ||
    (await usernameInput.value?.validate())?.length ||
    (await mailInput.value?.validate())?.length
  ) return;

  const res = await axios?.patch<UserResponseData>('/user', data, {
    headers: {
      Authorization: `Bearer ${userStore.tokens.access_token}`
    }
  }).catch(async (e: any) => {
    if (await checkTokenExpirationError(e)) return;
  });

  if (!res?.data) return;

  userStore.updateUserData(res.data);
}
</script>

<template>
  <div class="escape">
    <v-btn icon="mdi-close" size="small" @click="router.back()" variant="tonal" />
  </div>
  <div id="user-settings">
    <header>
      <h2>User settings</h2>
    </header>
    <v-container>
      <v-row>
        <v-col cols="12">
          <div class="profile" >
            <div class="color-overlay" />
            <div class="profile-content">
              <div class="user-profile">
                <div class="profile-picture">
                  <img :src="userPfpUrl" alt="Profile picture">
                  <input ref="pfpInput" type="file" id="new_pfp" hidden @change="handlePfpFileChange" accept="image/png, image/jpeg, image/gif">
                  <label for="new_pfp">
                    <div class="overlay" >
                      <v-icon icon="mdi-file-replace-outline" />
                    </div>
                  </label>
                </div>
                <div class="profile-username">
                  <span>{{ user.username }}<span class="tag">#{{ user.public_uid }}</span></span>
                </div>
              </div>
              <v-divider />
              <div class="profile-details">
                <div class="profile-details-row">
                  <div class="profile-edit-input">
                    <h4>Username</h4>
                    <p v-if="!usernameEditMode">{{ user.username }}</p>
                    <v-text-field
                      ref="usernameInput"
                      v-else
                      v-model="username"
                      class="w-100"
                      density="compact"
                      label="Username"
                      color="primary"
                      variant="outlined"
                      append-inner-icon="mdi-content-save"
                      @click:append-inner="() => {handleUserUpdate({username}); usernameEditMode = false}"
                      @keydown.enter="() => {handleUserUpdate({username}); usernameEditMode = false}"
                      hide-details="auto"
                      :rules="[
                        () => !!username && username.length >= 3 || 'Username must be at least 3 characters long',
                        () => /^[a-zA-Z0-9_.-]*$/gm.test(username) || 'Username can contain only letters and numbers'
                      ]"
                    />
                  </div>
                  <div class="profile-edit-control">
                    <v-btn
                      :color="user.accent_color"
                      :variant="isDisplayLg ? 'tonal' : 'elevated'"
                      @click="usernameEditMode = !usernameEditMode"
                      :size="isDisplayLg ? 'default' : 'small'"
                      :rounded="!isDisplayLg"
                    >
                      <span v-if="isDisplayLg">{{ usernameEditMode ? "Cancel" : "Change username" }}</span>
                      <v-icon v-else :icon="usernameEditMode ? 'mdi-cancel' : 'mdi-pencil'" />
                    </v-btn>
                  </div>
                </div>
                <div class="profile-details-row">
                  <div class="profile-edit-input">
                    <h4>Profile tag</h4>
                    <p v-if="!tagEditMode">{{ user.public_uid }}</p>
                    <v-text-field
                      ref="tagInput"
                      v-else
                      v-model="tag"
                      class="w-100"
                      density="compact"
                      label="Tag"
                      color="primary"
                      variant="outlined"
                      append-inner-icon="mdi-content-save"
                      @click:append-inner="() => {handleUserUpdate({ public_uid: tag }); tagEditMode = false}"
                      @keydown.enter="() => {handleUserUpdate({ public_uid: tag }); tagEditMode = false}"
                      hide-details="auto"
                      :rules="[
                        () => !!tag && tag.length === 4 || 'Tag must be 4 characters long',
                        () => /^[a-zA-Z0-9_.-]*$/gm.test(tag) || 'Tag can contain only letters and numbers'
                      ]"
                   />
                  </div>
                  <div class="profile-edit-control">
                    <v-btn
                      :color="user.accent_color"
                      :variant="isDisplayLg ? 'tonal' : 'elevated'"
                      @click="tagEditMode = !tagEditMode"
                      :size="isDisplayLg ? 'default' : 'small'"
                      :rounded="!isDisplayLg"
                    >
                      <span v-if="isDisplayLg">{{ tagEditMode ? 'Cancel' : 'Change profile tag' }}</span>
                      <v-icon v-else :icon="tagEditMode ? 'mdi-cancel' : 'mdi-pencil'" />
                    </v-btn>
                  </div>
                </div>
                <div class="profile-details-row">
                  <div class="profile-edit-input">
                    <h4>Email</h4>
                    <p v-if="!mailEditMode">{{ user.email }}</p>
                    <v-text-field
                      ref="tagInput"
                      v-else
                      v-model="mail"
                      class="w-100"
                      density="compact"
                      label="Tag"
                      color="primary"
                      variant="outlined"
                      append-inner-icon="mdi-content-save"
                      @click:append-inner="() => {handleUserUpdate({ email: mail }); mailEditMode = false}"
                      @keydown.enter="() => {handleUserUpdate({ email: mail }); mailEditMode = false}"
                      hide-details="auto"
                      :rules="[
                        () => /^((?!\.)[\w-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/gm.test(mail) || 'Enter a valid email'
                      ]"
                    />
                  </div>
                  <div class="profile-edit-control">
                    <v-btn
                      :color="user.accent_color"
                      :variant="isDisplayLg ? 'tonal' : 'elevated'"
                      @click="mailEditMode = !mailEditMode"
                      :size="isDisplayLg ? 'default' : 'small'"
                      :rounded="!isDisplayLg"
                    >
                      <span v-if="isDisplayLg">{{ mailEditMode ? 'Cancel' : 'Change email' }}</span>
                      <v-icon v-else :icon="mailEditMode ? 'mdi-cancel' : 'mdi-pencil'" />
                    </v-btn>
                  </div>
                </div>
                <div class="profile-details-row">
                  <v-divider />
                </div>
                <div class="profile-details-row">
                  <div>
                  </div>
                  <v-dialog v-model="colorDialog">
                    <template v-slot:activator="{ props }">
                      <v-btn :color="user.accent_color" variant="tonal" v-bind="props">Change profile color</v-btn>
                    </template>

                    <v-card id="accent-picker-dialog">
                      <v-card-title class="text-center">Change profile accent color</v-card-title>
                      <v-divider />
                      <v-card-item>
                        <v-color-picker class="w-100" dot-size="12" :modes="['hex', 'rgb', 'hsl']" v-model="colors" />
                      </v-card-item>
                      <v-card-actions>
                        <div class="ml-auto">
                          <v-btn @click="handleColorUpdate" :disabled="!isColorValid">Save</v-btn>
                          <v-btn @click="colorDialog = false">Cancel</v-btn>
                        </div>
                      </v-card-actions>
                    </v-card>
                  </v-dialog>
                </div>
              </div>
            </div>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<style scoped>
.escape {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
}

#user-settings {
}

#user-settings header {
  background-color: #181818;
  padding: 0.5rem;
  line-height: 2.5rem;
}

#user-settings main {
  display: flex;
  padding: 0.5rem;
}

.profile {
  background-color: #191919;
  border-radius: 1rem;
}

.profile .color-overlay {
  background-color: v-bind('user.accent_color');
  width: 100%;
  height: 4rem;
  border-radius: 1rem 1rem 0 0;
  z-index: 1;
}

.user-profile {
  display: flex;
  align-items: center;
  flex-direction: column;
}

.profile-content {
  padding: 0.75rem;
  margin-top: -3rem;
}

.profile-picture {
  display: inline-block;
  border: solid 0.5rem #191919;
  background: #191919;
  border-radius: 50%;
  position: relative;
}

.profile-picture img {
  border-radius: 50%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
}

.profile-picture .overlay {
  display: none;
}

.profile-picture:hover .overlay {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 10rem;
  width: 10rem;
  position: absolute;
  top: 0;
  left: 0;
  background-color: rgba(255, 255, 255, 0.25);
  border-radius: 50%;
  cursor: pointer;
}

.profile-picture img {
  height: 10rem;
}

.profile-username {
  font-size: 1.5rem;
  margin-top: -0.625rem;
}

.profile-username .tag {
  font-size: 75%;
  color: #8a828c;
}

.profile-details {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.profile-details-row {
  width: 100%;
  margin: 0.5rem 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.profile-edit-input {
  width: 100%;
}

.profile-edit-input h4 {
  margin-bottom: 0.375rem;
}

.profile-edit-control {
  margin-left: 1rem;
}

#accent-picker-dialog {
  width: fit-content;
  margin: 0 auto;
}

@media only screen and (min-width: 768px) {
  .profile .color-overlay {
    height: 6rem;
  }

  .user-profile {
    flex-direction: row;
  }

  .profile-picture {
    margin-left: 1.5rem;
  }

  .profile-username {
    margin-left: 0.75rem;
    margin-top: 0;
  }

  .profile-edit-control {
    min-width: 20%;
    display: flex;
    flex-direction: column;
  }
}
</style>