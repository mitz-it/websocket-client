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
      if (this.socket != undefined) {
        this.socket.onmessage = (event: MessageEvent) =>
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

    this.socket.onmessage = (event: MessageEvent) => {
      this.handleMessage(event, this.handlers);
    };
  }

  private handleMessage(event: MessageEvent, handlers: MessageHandler<any>[]) {
    for (let index = 0; index < handlers.length; index++) {
      const handler = handlers[index];

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
  TypeAssertion,
  MessageHandlerCallback,
  MessageHandler,
};
export default WebSocketClient;
