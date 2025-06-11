import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { fetchAuthSession } from 'aws-amplify/auth';

@Injectable({
  providedIn: 'root',
})
export class WebsocketService {
  private socket$: WebSocketSubject<any> | null = null;

  public async connect(): Promise<void> {
    if (!this.socket$ || this.socket$.closed) {
      const session = await fetchAuthSession();
      const token = session?.tokens?.accessToken?.toString() ?? '';
      this.socket$ = webSocket(`${environment.websocketUrl}?token=${token}`);
    }
  }

  public sendMessage(message: any): boolean {
    console.log('Sending websocket message:', message);
    if (this.socket$ && !this.socket$.closed) {
      this.socket$.next(message);
      return true;
    } else {
      console.error('WebSocket is not connected.');
      return false;
    }
  }

  public getObservable(): Promise<Observable<any> | undefined> {
    return new Promise((resolve) => {
      if (!this.socket$ || this.socket$.closed) {
        this.connect().then(
          () => resolve(this.socket$?.asObservable()),
          (error) => {
            console.error('WebSocket connection failed:', error);
            resolve(undefined);
          },
        );
      }
    });
  }

  public disconnect(): void {
    if (this.socket$) {
      this.socket$.complete();
      this.socket$ = null;
    }
  }
}
