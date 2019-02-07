const INITIAL_CONFIG = {
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

export default INITIAL_CONFIG;
