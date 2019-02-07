import { IConfig, ILoadedConfig } from '../@types/types';
import initialConfig from '../config/defaults';

const loadConfig = (userConfig: IConfig): ILoadedConfig => {
  const config = {
    ...initialConfig,
    ...userConfig,
    camera: {
      ...initialConfig.camera,
      ...userConfig.camera,
      position: {
        ...initialConfig.camera.position,
        ...(userConfig.camera !== undefined
          ? userConfig.camera.position
          : undefined)
      }
    },
    controls: {
      ...initialConfig.controls,
      ...userConfig.controls
    },
    windowSize: {
      ...initialConfig.windowSize,
      ...userConfig.windowSize
    }
  };

  return config;
};

export default loadConfig;
