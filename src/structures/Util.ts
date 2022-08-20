import { parse, dirname, sep } from "path";
import { cd, exec } from "shelljs";
import BulbBotClient from "./BulbBotClient";
import { promisify } from "util";
import glob from "glob";

const globAsync = promisify(glob);

export default class {
  private readonly client: BulbBotClient;

  constructor(client: BulbBotClient) {
    this.client = client;
  }

  get directory(): string {
    return `${dirname(require.main?.filename || ".")}${sep}`;
  }

  async loadAbout(): Promise<void> {
    cd(`${__dirname}/../../`);

    this.client.about = {
      buildId: exec(`git rev-list --all --count`, { silent: true }).stdout,
      build: {
        hash: exec(`git rev-parse --short HEAD`, { silent: true }).stdout,
        time: exec(`git log -1 --format=%cd`, { silent: true }).stdout,
      },
    };
  }

  async loadDir<C extends Constructable>(
    dirname: string,
    ParentClass?: Nullable<C>
  ): Promise<void> {
    this.client.log.client(
      `[CLIENT - ${dirname.toUpperCase()}] Started registering ${dirname}...`
    );
    const total = await loadAndConstruct<C>({
      client: this.client,
      pathspec: `${this.directory}${dirname}/**/*.js`,
      test: isClass(ParentClass)
        ? (item) => item instanceof ParentClass
        : undefined,
      onLoad: (item) => this.client[dirname].set(item.name, item),
      onError: (item) => {
        throw new Error(`File "${item.name}" doesn't belong in ${dirname}!`);
      },
    });
    this.client.log.client(
      `[CLIENT - ${dirname.toUpperCase()}] Successfully registered all ${total} ${dirname}`
    );
  }

  async loadDirList(dirs: string[] | Record<string, Maybe<Constructable>>) {
    return await Promise.all(
      Array.isArray(dirs)
        ? dirs.map((dirname) => this.loadDir(dirname))
        : Object.entries(dirs).map((entry) => this.loadDir(...entry))
    );
  }
}

interface LoadDirectoryParams<V = LoadableClass> {
  client: BulbBotClient;
  pathspec: string;
  /**
   * A test callback may optionally be passed. The test will be applied to each constructed
   * instance. If the test returns `true`, it indicates the instance was satisfactory, while
   * `false` indicates a problem with the instance
   */
  test?: (instance: V) => boolean;
  onLoad?: (instance: V, data: { name: string; filePath: string }) => any;
  onError?: (value: V, filePath: string) => any;
}

// Object is the base prototype of everything
interface LoadableClass extends Object {
  name: string;
  constructor: typeof LoadableClass;
}
declare var LoadableClass: {
  new (...args: any): LoadableClass;
  prototype: LoadableClass;
};

/**
 * @returns Count of instances constructed successfully. This is effectively the number of times onLoad is called
 */
export async function loadAndConstruct<V = LoadableClass>({
  client,
  pathspec,
  // Default no-op callbacks
  test = () => true,
  onLoad = () => {},
  onError = () => {},
}: LoadDirectoryParams<V>): Promise<number> {
  const files = await globAsync(pathspec);
  let count = 0;
  for (const filePath of files) {
    delete require.cache[filePath];
    const { name } = parse(filePath);
    const LoadedFile: { default: Constructable<V> } = await import(filePath);

    const instance = isClass(LoadedFile.default)
      ? new LoadedFile.default(client, name)
      : LoadedFile.default;
    if (!test(instance)) {
      await onError(instance, filePath);
      continue;
    }

    ++count;
    onLoad(instance, { name, filePath });
  }

  return count;
}

function isClass(input: any): input is Constructable {
  return (
    typeof input === "function" &&
    typeof input.prototype === "object" &&
    input.toString().substring(0, 5) === "class"
  );
}

type Constructable<C = any> = new (...args: any[]) => C;
