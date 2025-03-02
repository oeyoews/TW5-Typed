declare module 'tiddlywiki' {
  export interface IParseOptions {
    /**
     * Optional source uri, used in parseText
     */
    _canonical_uri?: string;
    /**
     * While calling `getCacheForTiddler`, use inlineParseTree or blockParseTree
     */
    parseAsInline?: boolean;
    defaultType?: string;
    parentWidget?: Widget;
    document?: TWDocument;
  }

  export class WikiParseRule {
    is: { block?: boolean; inline?: boolean };

    match?: unknown;

    matchRegExp?: RegExp;

    parser?: WikiParser;

    nextTag?: unknown;

    /** `{type: 'macrocall', start: 261, params: Array(1), name: 'reuse-tiddler', end: 290}` */
    nextCall?: {
      end: number;
      name: string;
      /** `{ type: 'macro-parameter'; start: 276; value: '快速创建新笔记按钮'; end: 288 }` */
      params: { end: number; start: number; type: string; value: string };
      start: number;
      type: string;
    };
  }
  export class WikiParser {
    blockRules: { matchIndex?: number; rule: WikiParseRule }[];

    inlineRules: { matchIndex?: number; rule: WikiParseRule }[];

    pragmaRules: { matchIndex?: number; rule: WikiParseRule }[];

    configTrimWhiteSpace: boolean;

    pos: number;

    source: string;

    sourceLength: number;

    type: string;

    wiki: Wiki;

    tree: IParseTreeNode[];
  }

  export interface IParseTreeAttribute {
    end?: number;
    name?: string;
    start?: number;
    type:
      | 'string'
      | 'number'
      | 'bigint'
      | 'boolean'
      | 'macro'
      | 'macro-parameter';
    value: string | IMacroCallParseTreeNode;
  }

  export interface IWikiASTNode {
    attributes?: Record<string, IParseTreeAttribute>;
    children?: IParseTreeNode[];
    end?: number;
    isBlock?: boolean;
    isMacroDefinition?: boolean;
    isSelfClosing?: boolean;
    orderedAttributes?: IParseTreeAttribute[];
    start?: number;
    type: string;
  }
  export interface ITextParseTreeNode extends IWikiASTNode {
    text: string;
    type: 'text';
  }
  export interface ILinkParseTreeNode extends IWikiASTNode {
    text?: string;
    type: 'link';
  }
  export interface IImageParseTreeNode extends IWikiASTNode {
    type: 'image';
  }
  export interface ITranscludeParseTreeNode extends IWikiASTNode {
    type: 'transclude';
  }
  export interface ITiddlerParseTreeNode extends IWikiASTNode {
    type: 'tiddler';
  }
  export type HTMLTags = keyof HTMLElementTagNameMap | 'strike';

  export interface IDomParseTreeNode extends IWikiASTNode {
    tag: HTMLTags;
    type: 'element';
  }
  export interface ICodeBlockParseTreeNode extends IWikiASTNode {
    attributes: {
      code?: {
        type: 'string';
        value: string;
      };
      language?: {
        type: 'string';
        value: string;
      };
    } & IWikiASTNode['attributes'];
    type: 'codeblock';
  }
  export interface IMacroParameterCallParseTreeNode extends IWikiASTNode {
    name?: string;
    type: 'macro-parameter';
    value: string;
  }
  export interface IMacroCallParseTreeNode extends IWikiASTNode {
    name?: string;
    params?: IMacroParameterCallParseTreeNode[];
    /** `tag: '$macrocall',` */
    tag?: string;
    type: 'macrocall';
  }
  export interface IMacroParseTreeNode extends IWikiASTNode {
    name: string;
    type: 'macro';
    value: IMacroCallParseTreeNode;
  }
  export interface ICustomParseTreeNode extends IWikiASTNode {
    params: IMacroParameterCallParseTreeNode[];
    tag?: string;
    text?: string;
    type: string;
  }
  export type IParseTreeNode =
    | IWikiASTNode
    | IDomParseTreeNode
    | IMacroParameterCallParseTreeNode
    | IMacroCallParseTreeNode
    | ITextParseTreeNode
    | IImageParseTreeNode
    | ITranscludeParseTreeNode
    | ITiddlerParseTreeNode
    | ICodeBlockParseTreeNode
    | ILinkParseTreeNode
    | ICustomParseTreeNode
    | IMacroParseTreeNode
    | IParseTreeAttribute;
}
