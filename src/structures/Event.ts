import BulbBotClient from "./BulbBotClient";
import EventException from "./exceptions/EventException";

export default class Event {
  public readonly client: BulbBotClient;
  public readonly name: string;
  public readonly type: string;
  public readonly emitter: any;

  constructor(client: BulbBotClient, name: string, options: any) {
    this.client = client;
    this.name = name;
    this.type = options.type ? "once" : "on";
    this.emitter =
      (typeof options.emitter === "string"
        ? this.client[options.emitter]
        : options.emitter) || this.client;

    Event.bootstrap(this);
  }

  private static bootstrap(event: Event) {
    event.emitter[event.type](event.name, async (...args: any) => {
      try {
        await event.run(...args);
      } catch (err: any) {
        event.client.bulbutils.logError(
          err,
          undefined,
          event.name ?? event.constructor.name ?? "Unknown Event",
          args
        );
      }
    });
  }

  public async run(..._: any) {
    throw new EventException(
      `Event ${this.name} doesn't contain a run method!`
    );
  }
}
