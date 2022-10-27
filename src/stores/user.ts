import { defineStore } from "pinia";
import type { AuthResponseData, UserResponseData, UserStoreState } from "@/interfaces/user";

export const useUserStore = defineStore({
  id: "user",
  state: (): UserStoreState => ({
    user: {
      id: 0,
      username: '',
      public_uid: '',
      email: '',
      pfp_url: '',
      createdAt: new Date(0)
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
        pfp_url: authData.pfpUrl,
        createdAt: authData.createdAt
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
          pfp_url: res.data.pfpUrl,
          createdAt: res.data.createdAt
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
      } catch (e: any) {
        console.error(e);
      }
    }
  },
  getters: {
    isAuthenticated: (state) => {
      return !!state.tokens.access_token;
    }
  }
})

