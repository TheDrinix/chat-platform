import { defineStore } from "pinia";
import type { RawUserData, UserData } from "@/interfaces/user";

export const useUserStore = defineStore({
  id: "user",
  state: (): UserData => ({
    id: 0,
    username: '',
    public_uid: '',
    pfpUrl: '',
    access_token: '',
    refresh_token: ''
  }),
  actions: {
    async loadTokens() {
      this.refresh_token = localStorage.getItem('refresh_token') || '';

      let token = sessionStorage.getItem('access_token') || '';

      if (!token) {
        await this.refreshToken();
      } else {
        this.access_token = token;
      }
    },

    storeUser(data: RawUserData) {
      this.id = data.id
      this.username = data.username;
      this.public_uid = data.public_uid;
      this.pfpUrl = data.pfpUrl;
      this.access_token = data.token;
      this.refresh_token = data.refreshToken;

      sessionStorage.setItem('access_token', this.access_token);
      localStorage.setItem('refresh_token', this.refresh_token);
    },

    async refreshToken() {
      try {
        if (!this.refresh_token) {
          return;
        }

        const res = await this.axios.post<{ token: string }>(`${import.meta.env['VITE_SERVER_URL']}/auth/refresh`, {
          refreshToken: this.refresh_token
        });

        if (res.status === 201) {
          this.access_token = res.data.token;
        }
      } catch(e) {
        console.error(e);
      }
    },

    async loadUserData() {
      try {
        const res = await this.axios.get<RawUserData>(`${import.meta.env['VITE_SERVER_URL']}/user`, {
          headers: {
            Authorization: `Bearer ${this.access_token}`
          }
        });

        const user = res.data;

        this.id = user.id;
        this.username = user.username;
        this.public_uid = user.public_uid;
        this.pfpUrl = user.pfpUrl;
      } catch(e: any) {
        if (e.status === 401) {
          if (e.message === 'EXPIRED') {
            await this.refreshToken();

            this.loadUserData();
          }
        }

        console.error(e);
      }
    }
  },
  getters: {
    isAuthenticated(): boolean {
      return !!this.access_token;
    }
  }
})

