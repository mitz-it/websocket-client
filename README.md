# Mitz IT - Web Socket Client

An abstraction over `WebSocket` object to manage strongly typed received messages.

## Installation

```bash
npm i @mitz-it/websocket-client
```

## Usage

Strongly typed messages are supported through strongly typed handlers (`MessageHandler<TMessage>`):

| Property | Type                               | Definition                              |
| -------- | ---------------------------------- | --------------------------------------- |
| key      | `string`                           | `string`                                |
| callback | `MessageHandlerCallback<TMessage>` | `(message: TMessage) => void`           |
| assert   | `TypeAssertion<TMessage>`          | `(message: any) => message is TMessage` |

Define your handler as follows:

```typescript
interface TypedMessage {
  foo: string;
  bar: int;
}

const callback = (message: TypedMessage): void => {
  console.log(message);
};

const assert = (message: any): message is TypedMessage => {
  return "foo" in message && "bar" in message;
};

const handler = {
  key: "typed-message-1",
  callback: callback,
  assert: assert,
};
```

Create an instance of the `WebSocketClient` object, and register your handlers:

```typescript
const client = new WebSocketClient("wss://...");

client.addMessageHandler(handler);

client.connect(() => {
  window.alert("connected!");
});
```

Publish a message:

```typescript
client.publish<TypedMessage>({ foo: "string", bar: 1 });
```

Safe publishing a message:

```typescript
if (client.isConnected())
  client.publish<TypedMessage>({ foo: "string", bar: 1 });
```

Remove a handler by its key:

```typescript
client.removeMessageHandler("typed-message-1");
```

Clear all registered handlers:

```typescript
client.clearMessageHandlers();
```
