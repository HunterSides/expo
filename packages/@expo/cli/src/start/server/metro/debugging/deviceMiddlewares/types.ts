import type { unstable_Device } from '@react-native/dev-middleware';
import type WS from 'ws';

// TODO: use `@react-native/dev-middleware` type instead
export type DebuggerMetadata = NonNullable<unstable_Device['_debuggerConnection']>;

// TODO: use `@react-native/dev-middleware` type instead
type TargetCapabilityFlags = {
  /**
   * The target supports a stable page representation across reloads.
   *
   * In the proxy, this disables legacy page reload emulation and the
   * additional '(Experimental)' target in `/json/list`.
   *
   * In the launch flow, this allows targets to be matched directly by `appId`.
   */
  nativePageReloads?: boolean;

  /**
   * The target supports fetching source code and source maps.
   *
   * In the proxy, this disables source fetching emulation and host rewrites.
   */
  nativeSourceCodeFetching?: boolean;

  /**
   * The target supports native network inspection.
   *
   * In the proxy, this disables intercepting and storing network requests.
   */
  nativeNetworkInspection?: boolean;
};

// TODO: use `@react-native/dev-middleware` type instead
type Page = {
  id: string;
  title: string;
  vm: string;
  app: string;
  capabilities: TargetCapabilityFlags;
};

// TODO: use `@react-native/dev-middleware` type instead
export type DeviceMetadata = {
  deviceId: string;
  deviceName: string;
  deviceSocket: WS;
  appId: string;
  page: Page;
  projectRoot: string;
};

// TODO: use `@react-native/dev-middleware` type instead
export abstract class DeviceMiddleware {
  constructor(protected readonly deviceInfo: DeviceMetadata) {}

  /** Determine if this middleware should be enabled or disabled, based on the page capabilities */
  isEnabled(): boolean {
    return true;
  }

  /** Check if the device supports one of the native capabilities */
  hasCapability(flag: keyof TargetCapabilityFlags): boolean {
    return this.deviceInfo.page.capabilities[flag] === true;
  }

  /**
   * Intercept a message coming from the device, modify or respond to it through `this._sendMessageToDevice`.
   * Return `true` if the message was handled, this will stop the message propagation.
   */
  handleDeviceMessage?(message: DeviceRequest | DeviceResponse, info: DebuggerMetadata): boolean;

  /**
   * Intercept a message coming from the debugger, modify or respond to it through `socket.send`.
   * Return `true` if the message was handled, this will stop the message propagation.
   */
  handleDebuggerMessage?(message: DebuggerRequest, info: DebuggerMetadata): boolean;
}

/**
 * The outline of a basic Chrome DevTools Protocol request, either from device or debugger.
 * Both the request and response parameters could be optional, use `never` to enforce these fields.
 */
export type CdpMessage<
  Method extends string = string,
  Request extends object = object,
  Response extends object = object,
> = {
  id: number;
  method: Method;
  params: Request;
  result: Response;
};

export type DeviceRequest<M extends CdpMessage = CdpMessage> = Pick<M, 'method' | 'params'>;
export type DeviceResponse<M extends CdpMessage = CdpMessage> = Pick<M, 'id' | 'result'>;

export type DebuggerRequest<M extends CdpMessage = CdpMessage> = Pick<
  M,
  'id' | 'method' | 'params'
>;
export type DebuggerResponse<M extends CdpMessage = CdpMessage> = Pick<M, 'result'>;
