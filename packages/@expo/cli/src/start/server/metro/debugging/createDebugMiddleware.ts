import chalk from 'chalk';

import { createDeviceMiddlewareFactory } from './createDeviceMiddlewareFactory';
import { Log } from '../../../../log';
import { type MetroBundlerDevServer } from '../MetroBundlerDevServer';

export function createDebugMiddleware(metroBundler: MetroBundlerDevServer) {
  // Load the React Native debugging tools from project
  // TODO: check if this works with isolated modules
  const { createDevMiddleware } =
    require('@react-native/dev-middleware') as typeof import('@react-native/dev-middleware');

  const { middleware, websocketEndpoints } = createDevMiddleware({
    projectRoot: metroBundler.projectRoot,
    serverBaseUrl: metroBundler.getJsInspectorBaseUrl(),
    logger: createLogger(chalk.bold('Debug:')),
    // @ts-expect-error Upgrade to latest `@react-native/dev-middleware` with the device middleware API
    unstable_deviceMessageMiddleware: createDeviceMiddlewareFactory(metroBundler),
    unstable_experiments: {
      enableNewDebugger: true,
    },
  });

  return {
    debugMiddleware: middleware,
    debugWebsocketEndpoints: websocketEndpoints,
  };
}

function createLogger(
  logPrefix: string
): Parameters<typeof import('@react-native/dev-middleware').createDevMiddleware>[0]['logger'] {
  return {
    info: (...args) => Log.log(logPrefix, ...args),
    warn: (...args) => Log.warn(logPrefix, ...args),
    error: (...args) => Log.error(logPrefix, ...args),
  };
}
