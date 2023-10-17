type OnOpenHandler = (e: Event) => void;

type OnReconnectHandler = () => void;

type OnCloseHandler =
  | ((e: CloseEvent, reconnect?: OnReconnectHandler) => void)
  | (() => void);

type TypeAssertion<TMessage> = (value: any) => value is TMessage;

type OnMessageCallback<TMessage> = (message: TMessage) => void;

type MessageHandler<TMessage> = {
  key: string;
  callback: OnMessageCallback<TMessage>;
  assert: TypeAssertion<TMessage>;
};

class WebSocketClient {
  private url: string = "";
  private protocols?: string | string[];
  private socket?: WebSocket;
  private handlers: Set<MessageHandler<any>> = new Set();

  constructor(url: string, protocols?: string | string[]) {
    this.url = url;
    this.protocols = protocols;
  }

  connected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  connect(onopen?: OnOpenHandler, onclose?: OnCloseHandler) {
    this.socket = new WebSocket(this.url, this.protocols);

    this.socket.onopen = (e) => {
      onopen?.(e);
      this.socket!.onmessage = this.handleMessage.bind(this);
    };

    this.socket.onclose = (e) => {
      if (onclose) {
        const reconnect = this.reconnect.bind(this, onopen, onclose);
        onclose(e, reconnect);
      }
    };
  }

  disconnect() {
    this.socket?.close();
  }

  addMessageHandler<TMessage>(handler: MessageHandler<TMessage>) {
    this.handlers.add(handler);
  }

  removeMessageHandler(key: string) {
    for (let handler of this.handlers) {
      if (handler.key === key) {
        this.handlers.delete(handler);
        break;
      }
    }
  }

  clearMessageHandlers() {
    this.handlers.clear();
  }

  publish<TMessage>(message: TMessage) {
    if (!this.connected()) {
      throw new Error("client not connected");
    }

    const content = JSON.stringify(message);

    this.socket!.send(content);
  }

  private reconnect(onopen?: OnOpenHandler, onclose?: OnCloseHandler) {
    this.connect(onopen, onclose);
  }

  private handleMessage(event: MessageEvent) {
    const message = JSON.parse(event.data as string);

    for (let handler of this.handlers) {
      const { assert, callback } = handler;
      if (assert(message)) {
        callback(message);
        break;
      }
    }
  }
}

export {
  OnOpenHandler,
  OnCloseHandler,
  TypeAssertion,
  OnMessageCallback,
  MessageHandler,
};

export default WebSocketClient;
