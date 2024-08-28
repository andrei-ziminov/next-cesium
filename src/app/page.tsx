// pages/index.js
import React from 'react';
import dynamic from 'next/dynamic';
import { CesiumViewer } from '@/app/cesium-viewer';

import CesiumWrapper from './components/cesium-wrapper';

async function getPosition() {
  //Mimic server-side stuff...
  return {
    position: {
      lat: 39.953436,
      lng: -75.164356,
    },
    // lat: 49.4799,
    // lng: 8.4693,
  };
}

export default async function Home() {
  const fetchedPosition = await getPosition();
  return (
    <div>
      <h1>Cesium.js 3D Viewer</h1>
      {/* Render the CesiumViewer component */}
      <CesiumWrapper positions={[fetchedPosition.position]} />
    </div>
  );
}
