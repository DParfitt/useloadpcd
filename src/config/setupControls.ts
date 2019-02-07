import * as THREE from 'three';
import { ILoadedControls } from '../@types/types';
import TrackballControls from '../three/Trackball';

const setupControls = (
    camera: THREE.PerspectiveCamera,
    canvas: HTMLDivElement,
    config: ILoadedControls
) => {
    const controls = new TrackballControls(camera, canvas);

    controls.rotateSpeed = config.rotateSpeed;
    controls.zoomSpeed = config.zoomSpeed;
    controls.panSpeed = config.panSpeed;

    controls.noZoom = config.noZoom;
    controls.noPan = config.noPan;
    controls.noRotate = config.noRotate;

    controls.staticMoving = config.staticMoving;
    controls.dynamicDampingFactor = config.dynamicDampingFactor;

    controls.minDistance = config.minDistance;
    controls.maxDistance = config.maxDistance;

    return controls;
};

export default setupControls;
