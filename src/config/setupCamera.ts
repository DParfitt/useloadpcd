import * as THREE from 'three';
import { ILoadedCamera } from '../@types/types';

const setupCamera = (config: ILoadedCamera) => {
    const {
        fov,
        aspect,
        near,
        far,
        position: { x, z, y }
    } = config;
    
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

    camera.position.x = x;
    camera.position.z = z;
    if (y !== undefined) {
        camera.position.y = y;
    }

    camera.up.set(0, 0, 1);

    return camera;
};

export default setupCamera;
