import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WebsocketService {
  private socket$: WebSocketSubject<any> | null = null;

  public connect(): void {
    if (!this.socket$ || this.socket$.closed) {
      // TODO: Add token from Amplify
      this.socket$ = webSocket(`${environment.websocketUrl}?token=`);
    }
  }

  public sendMessage(message: any): boolean {
    if (this.socket$ && !this.socket$.closed) {
      this.socket$.next(message);
      return true;
    } else {
      console.error('WebSocket is not connected.');
      return false;
    }
  }

  public getObservable(): Observable<any> | undefined {
    if (!this.socket$ || this.socket$.closed) {
      this.connect();
    }
    return this.socket$?.asObservable();
  }

  public disconnect(): void {
    if (this.socket$) {
      this.socket$.complete();
      this.socket$ = null;
    }
  }
}
