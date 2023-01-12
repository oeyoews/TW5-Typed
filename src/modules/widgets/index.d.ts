declare module 'tiddlywiki' {
  /**
   * Parameter of Widget.refresh
   * Key is tiddler title
   */
  export type IChangedTiddlers = Record<string, IChangedTiddlersMeta>;
  /** Only one of these fields will be `true` */
  export interface IChangedTiddlersMeta {
    deleted?: boolean;
    modified?: boolean;
  }

  export interface IWidgetEvent {
    [extraKeys: string]: unknown;
    /** maybe a DOM click event, if trigger by button click */
    event: UIEvent | Event;
    name: string;
    navigateFromTitle?: string;
    /**
     * Get `$param`
     */
    param?: string | undefined;
    /** Optional hashmap of additional tiddler fields. Widget event can carry any other parameters
     *
     * For example, `<$action-sendmessage $message="tw-mobile-sync-set-active-server-and-sync" title={{!!title}} />` will produce `paramObject: { title: "xxxx" }`
     */
    paramObject?: {
      [othersParamKeys: string]: unknown;
    };
    tiddlerTitle?: string;
    /** the first parameter of addEventListener
     *
     * For example, the `'open-command-palette'` in `$tw.rootWidget.addEventListener('open-command-palette', (e: IWidgetEvent) => this.openPalette(e));`
     */
    type: string;
    widget: Widget;
  }

  export interface IWidgetInitializeOptions {
    wiki?: ITiddlyWiki;
    parentWidget?: Widget;
  }

  /**
   * @link https://tiddlywiki.com/dev/#Widgets
   *
   * Create a widget object for a parse tree node
   * * parseTreeNode: reference to the parse tree node to be rendered
   * * options: see below
   *
   * Options include:
   * * wiki: mandatory reference to wiki associated with this render tree
   * * parentWidget: optional reference to a parent renderer node for the context chain
   * * document: optional document object to use instead of global document
   */
  export class Widget {
    parseTreeNode: IParseTreeNode;

    wiki: ITiddlyWiki;

    document: IFakeDocument;

    parentWidget?: Widget;

    attributes: Record<string, string>;

    domNodes: Node[];

    parentDomNode: Node;

    eventListeners: Record<string, Function>;

    /**
     * we can use $tw.rootWidget.widgetClasses.xxx to new a widget
     *
     * This is a set of all widgets defined in tiddlywiki.
     */
    widgetClasses: Record<string, typeof Widget>;

    children: Widget[];

    qualifiers?: Record<string, string>;

    ancestorCount?: number;

    /**
     * Set the value of a context variable
     * * name: name of the variable
     * * value: value of the variable
     * * params: array of {name:, default:} for each parameter
     * * isMacroDefinition: true if the variable is set via a \define macro pragma (and hence should have variable substitution performed)
     */
    variables: Record<
      string,
      {
        value: string;
        params?: { name: string; default: string }[];
        isMacroDefinition: boolean;
      }
    >;

    constructor(
      parseTreeNode: IParseTreeNode,
      options?: IWidgetInitializeOptions,
    );

    /**
      Make child widgets correspondng to specified parseTreeNodes
      And push them to `this.children`
      @param parseTreeNodes default to `this.parseTreeNode.children`, can be undefined
    */
    makeChildWidgets(
      parseTreeNodes?: IParseTreeNode[],
      options?: { variables?: unknown },
    ): void;

    /**
     * Initialise widget properties. These steps are pulled out of the constructor so that we can reuse them in subclasses
     */
    initialise(
      parseTreeNode: IParseTreeNode,
      options?: {
        document?: Document;
        parentWidget?: Widget;
        wiki?: ITiddlyWiki;
      },
    ): void;
    /**
     * Remove any DOM nodes created by this widget or its children
     *
     * If this widget has directly created DOM nodes, delete them and exit. This assumes that any child widgets are contained within the created DOM nodes, which would normally be the case.
     * Otherwise, ask the child widgets to delete their DOM nodes
     */
    removeChildDomNodes(): void;
    /**
      Construct the widget object for a parse tree node, and return the new widget
      options include:
        variables: optional hashmap of variables to wrap around the widget
    */
    makeChildWidget(
      parseTreeNode: IParseTreeNode,
      options?: { variables?: unknown },
    ): Widget;
    /**
      Add an event listener
    */
    addEventListener(
      type: string,
      handler: (event: IWidgetEvent) => void | Promise<void>,
    ): void;
    /**
      Dispatch an event to a widget. If the widget doesn't handle the event then it is also dispatched to the parent widget

      Events added via `addEventListener`, like `tm-notify`, can be invoked by this.
    */
    dispatchEvent(typeOrEvent: string | Omit<IWidgetEvent, 'widget'>): void;
    /**
      Add a list of event listeners from an array [{type:,handler:},...]
    */
    addEventListeners(
      listeners: Array<{
        handler: (event: IWidgetEvent) => void | Promise<void>;
        type: string;
      }>,
    ): void;

    /**
      Compute the internal state of the widget.
      This will be automatically called in the `render` method.

      For example, `getAttribute` and set them to class members.

    */
    execute(): void;
    /**
     * Invoke the action widgets that are descendents of the current widget. Will call child widget's invokeAction recursively.
     *
     * @param triggeringWidget
     * @param event
     * @returns handled by any children
     */
    invokeActions(triggeringWidget: Widget, event: IWidgetEvent): boolean;
    /**
     * Invoke the action associated with this widget
     *
     * No every widget has this method, but some do, like `action-xxx` widget, e.g., `action-sendmessage`
     * @param triggeringWidget
     * @param event
     * @returns handled
     */
    invokeAction(
      triggeringWidget: Widget,
      event: IWidgetEvent,
    ): boolean | undefined;

    /**
     * Lifecycle method: Render this widget into the DOM
     */
    render(parent: Node, nextSibling: Node | null): void;
    /**
     * Render the children of this widget into the DOM
     */
    renderChildren(parent: Node, nextSibling: Node | null): void;
    /**
     * Selectively refreshes the widget if needed. Returns true if the widget or any of its children needed re-rendering.
     * You can do some cleanup or buildup before return true.
     * @param changedTiddlers Object key is tiddler title, value is metadata about the change
     * @link https://tiddlywiki.com/dev/#Selective%20Update
     */
    refresh(changedTiddlers: IChangedTiddlers): boolean;
    /**
      Refresh all the children of a widget
      will call `this.render`

      Need to call this after `setVariable`
    */
    refreshChildren(changedTiddlers?: IChangedTiddlers): boolean;
    /**
     * Rebuild a previously rendered widget
     */
    refreshSelf(): boolean | void;
    /**
     * Find the next sibling in the DOM to this widget. This is done by scanning the widget tree through all next siblings and their descendents that share the same parent DOM node
     * @param startIndex Refer to this widget by its index within its parents children
     */
    findNextSiblingDomNode(startIndex?: number): Node | null;
    /**
     * Find the first DOM node generated by a widget or its children
     */
    findFirstDomNode(): Node | null;
    computeAttributes(): Record<string, IParseTreeAttribute>;
    /**
     * Get parameters that user set in the widget
     * @param name attribute name, for example, `actions` in the button widget
     * @param fallbackText default value if the attribute is not set
     */
    getAttribute(name: string, fallbackText?: string): string;
    /**
     * Get variable in the context of the widget.
     * Simplified version of getVariableInfo() that just returns the text.
     * @param name variable name, for example, `currentTiddler` in the widget context
     * @param options options for getVariableInfo()
     *
     * Options include
        params: array of {name:, value:} for each parameter
        defaultValue: default value if the variable is not defined

        Returns an object with the following fields:

        params: array of {name:,value:} of parameters passed to wikitext variables
        text: text of variable, with parameters properly substituted
     */
    getVariable(name: string, options?: object): string;
    /**
      Set the value of a context variable

      @param name name of the variable
      @param value value of the variable
      @param params array of {name:, default:} for each parameter
      @param isMacroDefinition true if the variable is set via a \define macro pragma (and hence should have variable substitution performed)
      */
    setVariable(
      name: string,
      value: string,
      parameters?: object[],
      isMacroDefinition?: boolean,
    ): void;
  }

  export interface IFakeDocument {
    compatMode: string;
    createElement: (tag: string) => TW_Element;
    createElementNS: (namespace: string, tag: string) => TW_Element;
    createTextNode: (text: string) => TW_TextNode;
    isTiddlyWikiFakeDom: boolean;
    setSequenceNumber: (value: any) => void;
  }
  // eslint-disable-next-line @typescript-eslint/naming-convention
  export interface TW_Element extends HTMLElement {
    _style: Record<string, unknown>;
    appendChild: <T extends TW_Element | TW_TextNode | Node>(node: T) => T;
    isRaw: boolean;
    isTiddlyWikiFakeDom: boolean;
    namespaceURI: string;
    tag: string;
  }
  // eslint-disable-next-line @typescript-eslint/naming-convention
  export interface TW_TextNode extends Node {
    textContent: string;
  }

  export type ModalWidget = {
    adjustPageClass: () => void;
    /**
     *
     * @param title
     * @param options
     * variables: optional hashmap of variables to wrap around the widget
     * downloadLink: normally is used for "Right-click to save changes"
     */
    display: (
      title: string,
      options?: {
        downloadLink?: string;
        event?: IWidgetEvent;
        variables?: unknown;
      },
    ) => void;

    new (wiki: Wiki): ModalWidget;
  };
}

declare module '$:/core/modules/widgets/widget.js' {
  import { Widget } from 'tiddlywiki';
  export { Widget as widget };
}
