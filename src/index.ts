import { Walker, DepType } from "flora-colossus";
import { dirname } from "path";
import PluginBase from "@electron-forge/plugin-base";
import {
  ForgeMultiHookMap,
  ResolvedForgeConfig,
} from "@electron-forge/shared-types";

const defaultOpts = {
  externals: [] as string[],
  includeDeps: true,
};

class ForgeExternalsPlugin extends PluginBase<unknown> {
  private _includeDeps: boolean;
  private _externals: string[];
  private _dir!: string;
  name = "forge-externals-plugin";

  constructor(opts: Record<string, unknown>) {
    super(opts);
    const options = { ...defaultOpts, ...(opts || {}) };
    this._externals = options.externals;
    this._includeDeps = options.includeDeps;
  }

  init = (dir: string) => {
    this._dir = dir;
  };

  getHooks(): ForgeMultiHookMap {
    return {
      resolveForgeConfig: [this.resolveForgeConfig],
    };
  }

  resolveForgeConfig = async (forgeConfig: ResolvedForgeConfig) => {
    const foundModules = new Set(this._externals) as Set<string>;

    if (this._includeDeps) {
      for (const external of this._externals) {
        const moduleRoot = dirname(
          require.resolve(`${external}/package.json`, { paths: [this._dir] })
        );

        const walker = new Walker(moduleRoot);
        // These are private so it's quite nasty!
        // @ts-expect-error
        walker.modules = [];
        // @ts-expect-error
        await walker.walkDependenciesForModule(moduleRoot, DepType.PROD);
        // @ts-expect-error
        walker.modules
          .filter(
            (dep: { nativeModuleType: unknown }) =>
              dep.nativeModuleType === DepType.PROD
          )
          .map((dep: { name: string }) => dep.name)
          .forEach((name: string) => foundModules.add(name));
      }
    }

    // The webpack plugin already sets the ignore function.
    const existingIgnoreFn = forgeConfig.packagerConfig.ignore as (
      file: string
    ) => boolean;

    if (existingIgnoreFn) {
      // We override it and ensure we include external modules too
      forgeConfig.packagerConfig.ignore = (file: string) => {
        const existingResult = existingIgnoreFn(file);

        if (existingResult === false) {
          return false;
        }

        if (file === "/node_modules") {
          return false;
        }

        for (const module of foundModules) {
          if (
            file.startsWith(`/node_modules/${module}`) ||
            file.startsWith(`/node_modules/${module.split("/")[0]}`)
          ) {
            return false;
          }
        }

        return true;
      };
    }

    return forgeConfig;
  };
}

export { ForgeExternalsPlugin };
