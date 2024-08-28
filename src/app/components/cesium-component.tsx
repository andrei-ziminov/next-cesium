'use client';

import React, { useEffect, useRef } from 'react';
import type { CesiumType } from '../types/cesium';
import type { Position } from '../types/position';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import { useCesium } from './use-cesium';
import { usePolygonLine } from './use-route';

export const CesiumComponent: React.FunctionComponent<{
  CesiumJs: CesiumType;
  positions: Position[];
}> = ({ CesiumJs, positions }) => {
  const { viewer, cesiumContainerRef } = useCesium(CesiumJs, positions[0]);

  //   const startDegrees = { lng: 8.4693, lat: 49.4799 };
  //   const endDegrees = { lng: 8.4622, lat: 49.483 };
  const startDegrees = { lng: -75.1635, lat: 39.9529 };
  const endDegrees = { lng: -75.1731, lat: 39.9582 };

  const { startShowCase, spinAroungPoint } = usePolygonLine(
    CesiumJs,
    viewer,
    startDegrees,
    endDegrees
  );

  return (
    <>
      <button onClick={startShowCase}>Showcase and Record</button>
      <button
        onClick={async () => {
          await spinAroungPoint(
            CesiumJs.Cartesian3.fromDegrees(-75.171, 39.9556)
          );
        }}
      >
        Lets Spin
      </button>
      <div
        ref={cesiumContainerRef}
        id='cesium-container'
        style={{ height: '100vh', width: '100vw' }}
      />
    </>
  );
};

export default CesiumComponent;
