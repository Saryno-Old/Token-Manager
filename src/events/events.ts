import { SubscribeType, Publisher, Event } from 'kubets';

export { Event };

export const Events =
  process.env.ENABLE_KUBEMQ === 'true'
    ? new Publisher({
      host: process.env.KUBEMQ_HOST || 'localhost',
      port: Number(process.env.KUBEMQ_PORT) || 5000,
      channel: `internal_tokens`,
      client: `internal_tokens`,
      type: SubscribeType.Events,
    })
    : null;

export enum EventType {
  TOKEN_CREATED = 1,
  TOKEN_AUTHENTICATED = 2,
}

export const makeEvent = (type: EventType, data: any) => {
  const event = new Event();
  event.setBody(Buffer.from(JSON.stringify({ type, data })).toString('base64'));
  return event;
};

export const sendEvent = (type: EventType, data: any) => {
  if (Events) Events.send(makeEvent(type, data));
};
