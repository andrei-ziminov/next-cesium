'use client';

import * as Cesium from 'cesium';
import { useEffect } from 'react';
export const CesiumViewer = () => {
  useEffect(() => {
    const render = async () => {
      Cesium.RequestScheduler.requestsByServer['tile.googleapis.com:443'] = 18;

      // Create the viewer.
      const viewer = new Cesium.Viewer('cesiumContainer', {
        imageryProvider: false,
        baseLayerPicker: false,
        geocoder: false,
        globe: false,
        // https://cesium.com/blog/2018/01/24/cesium-scene-rendering-performance/#enabling-request-render-mode
        requestRenderMode: true,
      });
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      // Add 3D Tiles tileset.
      const tileset = viewer.scene.primitives.add(
        new Cesium.Cesium3DTileset({
          url: `https://tile.googleapis.com/v1/3dtiles/root.json?key=${apiKey}`,
          // This property is needed to appropriately display attributions
          // as required.
          showCreditsOnScreen: true,
        })
      );
    };
    render();
  }, []);
  return (
    <div id='cesiumContainer' style={{ height: '100vh', width: '100vw' }} />
  );
};
