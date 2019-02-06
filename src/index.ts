import _ from 'lodash';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

import PCDLoader from './three/PCDLoader';
import TrackballControls from './three/Trackball';

interface IFeedback {
  loading: boolean;
  percentage: number;
  error: ErrorEvent | null;
}

interface ICamera {
  fov?: number;
  aspect?: number;
  near?: number;
  far?: number;
  position?: IPosition;
}

interface IPosition {
  x?: number;
  y?: number;
  z?: number;
}

interface IConfig {
  particalSize?: number;
  particalColor?: string;
  backgroundColor?: string;
  camera?: ICamera;
  windowSize?: IWindow;
  controls?: IControls;
}

interface IControls {
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

interface IWindow {
  width?: number;
  height?: number;
}

const initialConfig = {
  backgroundColor: '#000000',
  camera: {
    aspect: window.innerWidth / window.innerHeight,
    far: 2000,
    fov: 50,
    near: 0.01,
    position: {
      x: 0.4,
      z: 4
    }
  },
  controls: {
    dynamicDampingFactor: 0.3,
    maxDistance: 100,
    minDistance: 2,
    noPan: false,
    noRotate: false,
    noZoom: false,
    panSpeed: 0.25,
    rotateSpeed: 2.0,
    staticMoving: true,
    zoomSpeed: 0.7
  },
  particalColor: '#ffffff',
  particalSize: 0.1,
  windowSize: {
    height: window.innerHeight,
    width: window.innerWidth
  }
};

const load = (
  path: string,
  configuration: IConfig = initialConfig
): [React.RefObject<HTMLDivElement>, IFeedback] => {
  const canvas = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState<number>(0);
  const [err, setErr] = useState<ErrorEvent | null>(null);
  const [frameId, setFrameId] = useState<number | undefined>(undefined);

  const config = {
    ...initialConfig,
    ...configuration,
    camera: {
      ...initialConfig.camera,
      ...configuration.camera,
      position: {
        ...initialConfig.camera.position,
        ...(configuration.camera !== undefined
          ? configuration.camera.position
          : undefined)
      }
    },
    controls: {
      ...initialConfig.controls,
      ...configuration.controls
    },
    windowSize: {
      ...initialConfig.windowSize,
      ...configuration.windowSize
    }
  };

  const getFile = async () => {
    const scene = new THREE.Scene();

    scene.background = new THREE.Color(config.backgroundColor);
    const loader = new PCDLoader();

    let camera: THREE.PerspectiveCamera;

    const { fov, aspect, near, far } = config.camera;
    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

    camera.position.x = config.camera.position.x;
    camera.position.z = config.camera.position.z;

    camera.up.set(0, 0, 1);

    scene.add(camera);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);

    renderer.setSize(config.windowSize.width, config.windowSize.height);
    if (canvas.current !== null) {
      const controls = new TrackballControls(camera, canvas.current);

      controls.rotateSpeed = config.controls.rotateSpeed;
      controls.zoomSpeed = config.controls.zoomSpeed;
      controls.panSpeed = config.controls.panSpeed;

      controls.noZoom = config.controls.noZoom;
      controls.noPan = config.controls.noPan;
      controls.noRotate = config.controls.noRotate;

      controls.staticMoving = config.controls.staticMoving;
      controls.dynamicDampingFactor = config.controls.dynamicDampingFactor;

      controls.minDistance = config.controls.minDistance;
      controls.maxDistance = config.controls.maxDistance;

      await loader.load(
        path,
        mesh => {
          scene.add(mesh);
          const center = mesh.geometry.boundingSphere.center;
          controls.target.set(center.x, center.y, center.z);
          controls.update();

          const sceneStyle = scene.getObjectByName(
            path.substring(path.lastIndexOf('/') + 1)
          );

          if (config.particalColor !== undefined) {
            (sceneStyle as any).material.color = new THREE.Color(
              config.particalColor
            );
          }

          (sceneStyle as any).material.size = 0.1;

          if (canvas.current !== null) {
            canvas.current.appendChild(renderer.domElement);
          }

          const renderScene = () => {
            renderer.render(scene, camera);
          };

          const animate = () => {
            controls.update();
            requestAnimationFrame(animate);
            renderScene();
          };

          const start = () => {
            if (!frameId) {
              setFrameId(requestAnimationFrame(animate));
            }
          };

          start();
        },
        xhr => {
          const completed = (xhr.loaded / xhr.total) * 100;
          // console.log(completed + '% loaded');
          setLoading(completed);
        },
        error => {
          setErr(error);
        }
      );
    }
  };

  useEffect(() => {
    if (canvas.current !== null) {
      if (canvas.current.children.length === 0) {
        getFile();
      }
    }
  }, []);

  return [
    canvas,
    {
      error: err,
      loading: loading < 100,
      percentage: loading
    }
  ];
};

export default load;
