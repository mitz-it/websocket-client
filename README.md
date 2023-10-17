# Mitz IT - Web Socket Client

A higher-level abstraction of the `WebSocket` object that manages strongly-typed received messages.

## Installation

```bash
npm install @mitz-it/websocket-client@^2.0.0
```

## Usage

Import the client:

```javascript
import WebSocketClient from "@mitz-it/websocket-client";
```

Strongly typed messages can be managed using corresponding strongly typed handlers, represented by `MessageHandler<TMessage>`:

| Property | Type                          | Description                             |
| -------- | ----------------------------- | --------------------------------------- |
| key      | `string`                      | Unique identifier for the message type  |
| callback | `OnMessageCallback<TMessage>` | Function invoked with the typed message |
| assert   | `TypeAssertion<TMessage>`     | Asserts if a message matches the type   |

Define your handler by implementing the `MessageHandler<TMessage>` structure:

```typescript
interface CustomMessage {
  foo: string;
  bar: int;
}

const callback = (message: CustomMessage): void => {
  console.log(message);
};

const assert = (message: any): message is CustomMessage => {
  return "foo" in message && "bar" in message;
};

const handler = {
  key: "custom-message-key",
  callback: callback,
  assert: assert,
};
```

Create an instance of the `WebSocketClient` object, and register the handler:

```typescript
const client = new WebSocketClient("wss://some-domain.com");

client.addMessageHandler(handler);

client.connect(
  () => console.log("Connected!"),
  (e, reconnect) => {
    if (e.code === YOUR_SERVER_CODE_FOR_MAX_TIME_LIMIT) {
      console.log("Reconnecting...");
      reconnect();
    }
  }
);
```

Publishing a message:

```typescript
client.publish<CustomMessage>({ foo: "string", bar: 1 });
```

Safe publishing:

```typescript
if (client.connected())
  client.publish<CustomMessage>({ foo: "string", bar: 1 });
```

Remove a handler:

```typescript
client.removeMessageHandler("custom-message-key");
```

Clear all handlers:

```typescript
client.clearMessageHandlers();
```
