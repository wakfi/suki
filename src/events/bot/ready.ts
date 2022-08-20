import Event from "../../structures/Event";
import { activityName, type, status } from "../../Config";
import { registerSlashCommands } from "../../utils/InteractionCommands";

export default class extends Event {
  constructor(...args: any[]) {
    // @ts-expect-error
    super(...args, {
      once: true,
    });
  }

  async run() {
    this.client.user?.setActivity({
      name: activityName,
      type,
      url: "",
    });

    this.client.user?.setStatus(status);
    registerSlashCommands(this.client);

    this.client.log.client(
      `[CLIENT] ${
        this.client.user?.username || "Bot (client.user is undefined?)"
      } successfully logged and ready`
    );
    this.client.log.client(
      `[CLIENT] Listening to ${this.client.events.size} event(s)`
    );
    this.client.log.client(
      `[CLIENT] Listening to ${this.client.commands.size} command(s)`
    );
  }
}
