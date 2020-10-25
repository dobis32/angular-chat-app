import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
@Injectable({
  providedIn: 'root'
})
export class SocketServiceService {

  private socket: any;
  private uri: string = 'ws://localhost:3000'
  constructor() {
    this.socket = io(this.uri);
  }
}
