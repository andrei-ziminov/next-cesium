import { Cesium3DTileset, ShadowMode, Viewer } from 'cesium';
import { useCallback, useEffect, useRef, useState } from 'react';
import { CesiumType } from '../types/cesium';
import { Position } from '../types/position';

export const useCesium = (CesiumJs: CesiumType, initialPosition: Position) => {
  const cesiumViewer = useRef<Viewer | null>(null);
  const cesiumContainerRef = useRef<HTMLDivElement>(null);
  const addedScenePrimitives = useRef<Cesium3DTileset[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const resetCamera = useCallback(async () => {
    if (cesiumViewer.current !== null) {
      cesiumViewer.current.scene.camera.setView({
        destination: CesiumJs.Cartesian3.fromDegrees(
          initialPosition.lng,
          initialPosition.lat,
          370
        ),
        orientation: {
          heading: CesiumJs.Math.toRadians(10),
          pitch: CesiumJs.Math.toRadians(-10),
        },
      });
    }
  }, [CesiumJs, initialPosition]);

  const cleanUpPrimitives = useCallback(() => {
    addedScenePrimitives.current.forEach((scenePrimitive) => {
      if (cesiumViewer.current !== null) {
        cesiumViewer.current.scene.primitives.remove(scenePrimitive);
      }
    });
    addedScenePrimitives.current = [];
  }, []);

  const initializeCesiumJs = useCallback(async () => {
    if (cesiumViewer.current !== null) {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

      const googleTileset = await CesiumJs.createGooglePhotorealistic3DTileset(
        apiKey,
        {
          showCreditsOnScreen: true,
          maximumScreenSpaceError: 16, // Increase for better performance
          dynamicScreenSpaceError: true,
          skipLevelOfDetail: true,
          shadows: ShadowMode.DISABLED,
          immediatelyLoadDesiredLevelOfDetail: false,
          cullRequestsWhileMoving: true,
          cullRequestsWhileMovingMultiplier: 10.0,
          preloadFlightDestinations: false,
          foveatedScreenSpaceError: true,
          foveatedTimeDelay: 0.2,
          skipScreenSpaceErrorFactor: 16,
          skipLevels: 1,
        }
      );

      cleanUpPrimitives();

      cesiumViewer.current.scene.primitives.add(googleTileset);

      const camera = cesiumViewer.current.camera;
      camera.frustum.fov = CesiumJs.Math.toRadians(30); // Reduce FOV to 30 degrees
      camera.frustum.near = 0.1;
      camera.frustum.far = 6000.0;
      resetCamera();

      setIsLoaded(true);
    }
  }, [CesiumJs, cleanUpPrimitives, resetCamera]);

  useEffect(() => {
    if (isLoaded) return;
    initializeCesiumJs();
  }, [isLoaded, initializeCesiumJs]);

  useEffect(() => {
    const render = async () => {
      if (cesiumViewer.current === null && cesiumContainerRef.current) {
        CesiumJs.Ion.defaultAccessToken = `${process.env.NEXT_PUBLIC_CESIUM_TOKEN}`;
        cesiumViewer.current = new Viewer(cesiumContainerRef.current, {
          terrainProvider: new CesiumJs.EllipsoidTerrainProvider(), // Disables real-world terrain
          baseLayerPicker: false, // Disable layer picker
          timeline: false, // Optional: Disable timeline
          animation: false, // Optional: Disable animation controls
        });

        cesiumViewer.current.clock.clockStep =
          CesiumJs.ClockStep.SYSTEM_CLOCK_MULTIPLIER;
      }
    };
    render();
  }, [CesiumJs]);

  return {
    viewer: cesiumViewer.current,
    cesiumContainerRef,
  };
};
