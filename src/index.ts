import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

import { IConfig, IFeedback } from './@types/types';
import loadConfig from './config/loadConfig';
import setupCamera from './config/setupCamera';
import setupControls from './config/setupControls';
import PCDLoader from './three/PCDLoader';

const load = (
    path: string,
    configuration: IConfig
): [React.RefObject<HTMLDivElement>, IFeedback] => {
    const canvas = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState<number>(0);
    const [err, setErr] = useState<ErrorEvent | null>(null);
    const [frameId, setFrameId] = useState<number | undefined>(undefined);

    const config = loadConfig(configuration);

    const getFile = async () => {
        const scene = new THREE.Scene();

        scene.background = new THREE.Color(config.backgroundColor);
        const loader = new PCDLoader();

        const camera = setupCamera(config.camera);
        scene.add(camera);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(config.windowSize.width, config.windowSize.height);

        if (canvas.current !== null) {
            const controls = setupControls(
                camera,
                canvas.current,
                config.controls
            );

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

                    const onWindowResize = () => {
                        camera.aspect =
                            config.windowSize.width / config.windowSize.height;

                        camera.updateProjectionMatrix();
                        renderer.setSize(
                            config.windowSize.width,
                            config.windowSize.height
                        );

                        controls.handleResize();
                    };

                    window.addEventListener('resize', onWindowResize, false);
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
