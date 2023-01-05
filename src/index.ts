type OnConnectFunc = () => void;

type TypeAssert<TMessage> = (value: any) => value is TMessage;

type MessageHandlerCallback<TMessage> = (message: TMessage) => void;

interface MessageHandler<TMessage> {
  key: string;
  callback: MessageHandlerCallback<TMessage>;
  assert: TypeAssert<TMessage>;
}

class WebSocketClient {
  private url: string = "";
  private socket?: WebSocket;
  private connected: boolean = false;
  private handlers: MessageHandler<any>[] = [];

  constructor(url: string) {
    this.url = url;
  }

  isConnected(): boolean {
    return this.connected;
  }

  connect(onConnect?: OnConnectFunc) {
    this.socket = new WebSocket(this.url);

    this.socket.onopen = () => {
      this.connected = false;
      if (onConnect) onConnect();
    };

    this.socket.onmessage = (event: MessageEvent) => {
      for (let index = 0; index < this.handlers.length; index++) {
        const handler = this.handlers[index];

        const { assert, callback } = handler;

        const message = JSON.parse(event.data);

        if (!assert(message)) continue;

        callback(message);
        break;
      }
    };
  }

  addMessageHandler<TMessage>(handler: MessageHandler<TMessage>) {
    this.handlers = [...this.handlers, handler];
  }

  removeMessageHandler(key: string) {
    this.handlers = this.handlers.filter((resolver) => resolver.key != key);
  }

  clearMessageHandlers() {
    this.handlers = [];
  }
}

export { OnConnectFunc, TypeAssert, MessageHandlerCallback, MessageHandler };
export default WebSocketClient;
