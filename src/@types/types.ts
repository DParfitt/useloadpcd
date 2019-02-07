export interface IFeedback {
    loading: boolean;
    percentage: number;
    error: ErrorEvent | null;
}

export interface ICamera {
    fov?: number;
    aspect?: number;
    near?: number;
    far?: number;
    position?: IPosition;
}

export interface IPosition {
    x?: number;
    y?: number;
    z?: number;
}

export interface IConfig {
    particalSize?: number;
    particalColor?: string;
    backgroundColor?: string;
    camera?: ICamera;
    windowSize?: IWindow;
    controls?: IControls;
}

export interface IControls {
    rotateSpeed?: number;
    zoomSpeed?: number;
    panSpeed?: number;
    noZoom?: boolean;
    noPan?: boolean;
    noRotate?: boolean;
    staticMoving?: boolean;
    dynamicDampingFactor?: number;
    minDistance?: number;
    maxDistance?: number;
}

export interface IWindow {
    width?: number;
    height?: number;
}

export interface ILoadedCamera {
    position: {
        x: number;
        y?: number;
        z: number;
    };
    aspect: number;
    far: number;
    fov: number;
    near: number;
}

export interface ILoadedControls {
    rotateSpeed: number;
    zoomSpeed: number;
    panSpeed: number;
    noZoom: boolean;
    noPan: boolean;
    noRotate: boolean;
    staticMoving: boolean;
    dynamicDampingFactor: number;
    minDistance: number;
    maxDistance: number;
}

export interface ILoadedConfig {
    camera: ILoadedCamera;
    backgroundColor: string;
    particalColor: string;
    particalSize: number;
    windowSize: {
        width: number;
        height: number;
    };
    controls: ILoadedControls;
}
