# UseLoadPCD

[![npm](https://img.shields.io/npm/v/useloadpcd.svg)](https://www.npmjs.com/package/useloadpcd)
[![dependency Status](https://img.shields.io/david/dparfitt/useloadpcd.svg?maxAge=1000)](https://david-dm.org/dparfitt/useloadpcd)
[![devDependency Status](https://img.shields.io/david/dev/dparfitt/useloadpcd.svg?maxAge=1000)](https://david-dm.org/dparfitt/useloadpcd)
[![peerDependency Status](https://img.shields.io/david/peer/dparfitt/useloadpcd.svg?maxAge=1000)](https://david-dm.org/dparfitt/useloadpcd)

## Installation

useLoadPCD requires atleast React and React-DOM v.16.8.0 (with Hooks).

If you are using npm:

```shell
npm install useloadpcd --save
```

or Yarn:

```shell
yarn add useloadpcd
```

## Usage

The path given to useLoadPCD is the path relative to the public directory.

```tsx
import React from 'react';
import useLoadPCD from 'useloadpcd';

const App = () => {
    const [pcdRef, status] = useLoadPCD('./simple.pcd', {});

    return <div ref={pcdRef} style={{ width: 800, height: 800 }} />;
};

export default App;
```

The second argument given to useLoadPCD has the following structure:

```typescript
{
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
```
