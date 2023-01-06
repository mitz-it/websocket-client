type ConnectionHandler = () => void;

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
  private handlers: MessageHandler<any>[] = [];

  constructor(url: string) {
    this.url = url;
  }

  isConnected(): boolean {
    return this.socket != undefined && this.socket.readyState == WebSocket.OPEN;
  }

  connect(onConnect?: ConnectionHandler, onClose?: ConnectionHandler) {
    this.socket = new WebSocket(this.url);

    this.socket.onopen = () => {
      if (onConnect) onConnect();
      if (this.socket != undefined) this.socket.onmessage = this.handleMessage;
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
  }

  clearMessageHandlers() {
    this.handlers = [];
  }

  publish<TMessage>(message: TMessage) {
    if (!this.canPublish()) throw new Error("client not connected");

    const content = JSON.stringify(message);

    this.socket?.send(content);
  }

  private canPublish(): boolean {
    return this.socket !== undefined && this.isConnected();
  }

  private handleMessage(event: MessageEvent) {
    for (let index = 0; index < this.handlers.length; index++) {
      const handler = this.handlers[index];

      const { assert, callback } = handler;

      const message = JSON.parse(event.data);

      if (!assert(message)) continue;

      callback(message);
      break;
    }
  }
}

export {
  ConnectionHandler,
  TypeAssert,
  MessageHandlerCallback,
  MessageHandler,
};
export default WebSocketClient;
