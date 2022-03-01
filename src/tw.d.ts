/// <reference path="filter-operator.d.ts" />
/// <reference path="modules.d.ts" />
/// <reference path="Tiddler.d.ts" />
/// <reference path="twconfig.d.ts" />
/// <reference path="utils.d.ts" />
/// <reference path="Widget.d.ts" />
/// <reference path="Wiki.d.ts" />
/// <reference path="parser.d.ts" />
/// <reference path="ast.d.ts" />

declare module 'tiddlywiki' {
  export interface IBootFilesIndexItem {
    filepath: string;
    hasMetaFile: boolean;
    tiddlerTitle: string;
    type: string;
  }
  /**
   * Record<tiddlerTitle, IBootFilesIndexItem>
   */
  export type IBootFilesIndex = Partial<Record<string, IBootFilesIndexItem>>;

  export interface IPluginInfo {
    tiddlers: ITiddlerFields[];
  }

  export class Server {}

  export interface IFileExtensionInfo {
    type: string;
  }

  export interface IContentTypeInfo {
    deserializerType: string;
    encoding: string;
    extension: string;
    flags: string[];
  }

  export interface ITiddlyWiki {
    Tiddler: typeof Tiddler;
    Wiki: typeof Wiki;

    boot: {
      argv: string[];
      files: IBootFilesIndex;
      log(logString: string): void;
      logMessages: string[];
      startup(options: { callback?: () => unknown }): void;
      boot(callback?: () => unknown): void;
      /** Default boot tasks */
      tasks: {
        readBrowserTiddlers: boolean;
        trapErrors: boolean;
      };
    };

    browser: null | object;

    config: ITWConfig;

    hooks: {
      addHook(hookName: 'th-server-command-post-start', callback: (listenCommand: unknown, server: Server) => void): void;
      addHook(hookName: string, callback: (...arguments_: unknown[]) => unknown): void;
    };

    modules: ITWModules;
    /** NodeJS features, if tw isn't running on a NodeJS environment, the value will be `null` */
    node: null | object;
    /** Broswer features, if tw isn't running on a browser environment, the value will be `null` */
    nodeWebKit: null | object;

    /** Convenience function for pushing a tiddler onto the preloading array */
    preloadTiddler(fields: Record<string, unknown>): void;
    /** Convenience function for pushing an array of tiddlers onto the preloading array */
    preloadTiddlerArray(fieldsArray: Array<Record<string, unknown>>): void;
    /** External JavaScript can populate this array before calling boot.js in order to preload tiddlers */
    preloadTiddlers: Record<string, Record<string, unknown>>;

    rootWidget: Widget;

    utils: ITWUtils;

    version: string;
    wiki: Wiki;
  }

  export type TW5InitFunction = ($tw?: ITiddlyWiki) => ITiddlyWiki;
  export const TiddlyWiki: TW5InitFunction;
}
