import * as ws from "ws";

type ConnectionHandler = () => void;

type TypeAssertion<TMessage> = (value: any) => value is TMessage;

type MessageHandlerCallback<TMessage> = (message: TMessage) => void;

interface MessageHandler<TMessage> {
  key: string;
  callback: MessageHandlerCallback<TMessage>;
  assert: TypeAssertion<TMessage>;
}

class WebSocketClient {
  private url: string = "";
  private socket?: ws.WebSocket;
  private handlers: MessageHandler<any>[] = [];
  private headers: any;

  constructor(url: string, headers?: any) {
    this.url = url;
    this.headers = headers;
  }

  isConnected(): boolean {
    return (
      this.socket != undefined && this.socket.readyState == ws.WebSocket.OPEN
    );
  }

  connect(onConnect?: ConnectionHandler, onClose?: ConnectionHandler) {
    this.socket = new ws.WebSocket(this.url, {
      headers: this.headers,
    });

    this.socket.onopen = () => {
      if (onConnect) onConnect();
      if (this.socket != undefined) {
        this.socket.onmessage = (event: ws.MessageEvent) =>
          this.handleMessage(event, this.handlers);
      }
    };

    this.socket.onclose = () => {
      if (onClose) onClose();
    };
  }

  disconnect() {
    if (this.socket == undefined) return;
    this.socket.close();
  }

  addMessageHandler<TMessage>(handler: MessageHandler<TMessage>) {
    this.handlers = [...this.handlers, handler];
  }

  removeMessageHandler(key: string) {
    this.handlers = this.handlers.filter((resolver) => resolver.key != key);
    this.setSocketHandlers();
  }

  clearMessageHandlers() {
    this.handlers = [];
    this.setSocketHandlers();
  }

  publish<TMessage>(message: TMessage) {
    if (this.socket == undefined || !this.isConnected()) {
      throw new Error("client not connected");
    }

    const content = JSON.stringify(message);

    this.socket.send(content);
  }

  private setSocketHandlers() {
    if (this.socket == undefined || !this.isConnected()) return;

    this.socket.onmessage = (event: ws.MessageEvent) => {
      this.handleMessage(event, this.handlers);
    };
  }

  private handleMessage(
    event: ws.MessageEvent,
    handlers: MessageHandler<any>[]
  ) {
    const message = JSON.parse(event.data as never);

    for (let index = 0; index < handlers.length; index++) {
      const handler = handlers[index];

      const { assert, callback } = handler;

      if (!assert(message)) continue;

      callback(message);
      break;
    }
  }
}

export {
  ConnectionHandler,
  TypeAssertion,
  MessageHandlerCallback,
  MessageHandler,
};
export default WebSocketClient;
