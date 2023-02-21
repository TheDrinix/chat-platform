import { defineStore } from "pinia";
import type { AuthResponseData, LoggedInUser, UserResponseData, UserStoreState } from "@/interfaces/user";

export const useUserStore = defineStore({
  id: "user",
  state: (): UserStoreState => ({
    user: {
      id: 0,
      username: '',
      public_uid: '',
      email: '',
      pfpUrl: '',
      createdAt: new Date(0),
      accent_color: '#b300ff'
    },
    tokens: {
      access_token: '',
      refresh_token: ''
    }
  }),
  actions: {
    storeAuthData(authData: AuthResponseData) {
      localStorage.setItem('refresh_token', authData.refreshToken);
      sessionStorage.setItem('access_token', authData.token);

      this.tokens = {
        access_token: authData.token,
        refresh_token: authData.refreshToken
      }

      this.user = {
        id: authData.id,
        username: authData.username,
        public_uid: authData.public_uid,
        email: authData.email,
        pfpUrl: authData.pfpUrl,
        createdAt: authData.createdAt,
        accent_color: authData.accent_color ?? this.user.accent_color
      }
    },
    async loadLoggedInUserData() {
      const rt = localStorage.getItem('refresh_token');

      if (!rt) return;

      this.tokens.refresh_token = rt;

      let at = localStorage.getItem('access_token');

      if (!at) {
        await this.refreshToken();
      } else {
        this.tokens.access_token = at;
      }

      await this.loadUserData();
    },
    async loadUserData() {
      try {
        const res = await this.axios.get<UserResponseData>('/user', {
          headers: {
            Authorization: `Bearer ${this.tokens.access_token}`
          }
        })

        this.user = {
          id: res.data.id,
          username: res.data.username,
          public_uid: res.data.public_uid,
          email: res.data.email,
          pfpUrl: res.data.pfpUrl,
          createdAt: res.data.createdAt,
          accent_color: res.data.accent_color ?? this.user.accent_color
        }
      } catch (e: any) {
        console.error(e);
      }
    },
    async refreshToken() {
      this.tokens.access_token = '';

      try {
        const res = await this.axios.post<{
          token: string;
        }>("/auth/refresh", {
          refreshToken: this.tokens.refresh_token
        });

        this.tokens.access_token = res.data.token;
        return true;
      } catch (e: any) {
        console.error(e);
        return false;
      }
    },
    updateUserData(data: Partial<LoggedInUser>) {
      const updated = {
        ...this.user,
        ...data
      }

      this.user = updated;
    }
  },
  getters: {
    isAuthenticated: (state) => {
      return !!state.tokens.access_token;
    }
  }
})

