import { io, Socket } from "socket.io-client";

export class SocketIOService {
  private _socket: Socket | undefined;

  get socket(): Socket | undefined {
    return this._socket;
  }

  initializeConnection(serverUrl: string, token: string) {
    this._socket = io(serverUrl, {
      auth: {
        token
      }
    });
  }

  disconnect() {
    if (this._socket) {
      this._socket.disconnect()
    }
  }

  get isConnected() {
    if (!this._socket) {
      return false;
    }

    return this._socket.connected;
  }
}