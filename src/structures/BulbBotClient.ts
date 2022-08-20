import {
  Client,
  Collection,
  Permissions,
  Intents,
  BitField,
  PermissionString,
  Options,
  Sweepers,
  SelectMenuInteraction,
} from "discord.js";
import ClientException from "./exceptions/ClientException";
import Event from "./Event";
import Util from "./Util";
import BulbBotUtils from "../utils/BulbBotUtils";
import Config from "src/Config";
import { logger } from "../utils/Logger";
import BulbBotFetch from "../utils/BulbBotFetch";
import ApplicationCommand from "./ApplicationCommand";

// https://github.com/TeamBulbbot/bulbbot
export default class BulbBotClient extends Client {
  public commands: Collection<string, ApplicationCommand>;
  public aliases: Collection<string, string>;
  public events: Collection<string, Event>;
  public interactions: Collection<
    string,
    (client: BulbBotClient, interaction: SelectMenuInteraction) => any
  >;
  public defaultPerms!: Readonly<BitField<PermissionString, bigint>>;
  private readonly utils: Util;
  public readonly bulbutils: BulbBotUtils;
  public readonly bulbfetch: BulbBotFetch;
  public userClearance = 0;
  public log: any;
  public about: any;

  constructor(options: any) {
    super({
      intents: new Intents(Config.intents),
      partials: Config.partials,
      http: { version: 9 },
      restTimeOffset: 500,
      restGlobalRateLimit: 50,
      makeCache: Options.cacheWithLimits({
        ...Options.defaultMakeCacheSettings,
        MessageManager: {
          sweepInterval: 300,
          sweepFilter: Sweepers.filterByLifetime({
            lifetime: 600,
            getComparisonTimestamp: (e) =>
              e.editedTimestamp ?? e.createdTimestamp,
          }),
        },
      }),
      allowedMentions: {
        parse: [],
        repliedUser: false,
        roles: [],
        users: [],
      },
    });
    this.validate(options);

    this.commands = new Collection();
    this.aliases = new Collection();

    this.events = new Collection();
    this.interactions = new Collection();

    this.utils = new Util(this);
    this.bulbutils = new BulbBotUtils(this);
    this.bulbfetch = new BulbBotFetch(this);

    this.about = {};

    this.log = logger;
  }

  private validate(options: any): void {
    if (typeof options !== "object")
      throw new ClientException("Options must be type of Object!");

    if (!options.token)
      throw new ClientException("Client cannot log in without token!");
    this.token = options.token;

    if (!options.defaultPerms)
      throw new ClientException("Default permissions cannot be null!");
    this.defaultPerms = new Permissions(options.defaultPerms).freeze();
  }

  public async login(token = this.token): Promise<any> {
    await this.utils.loadAbout();
    await this.utils.loadEvents();
    await this.utils.loadDirList({
      commands: ApplicationCommand,
      interactions: null,
    });

    await super.login(token as string);
  }
}
