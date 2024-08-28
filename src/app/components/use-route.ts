import { useEffect } from 'react';
import type { CesiumType } from '../types/cesium';
import { Cartesian3, JulianDate, Viewer } from 'cesium';

export const usePolygonLine = (
  CesiumJs: CesiumType,
  viewer: Viewer,
  startDegrees: { lng: number; lat: number },
  endDegrees: { lng: number; lat: number }
) => {
  const startShowCase = async () => {
    // const route = await fetchGoogleDirectionRoute(startDegrees, endDegrees);
    // const routePositions = route.map((point) =>
    //   CesiumJs.Cartesian3.fromDegrees(point.lng, point.lat)
    // );
    // viewer.entities.add({
    //   polyline: {
    //     positions: routePositions,
    //     width: 5,
    //     material: CesiumJs.Color.BLUE,
    //     clampToGround: true,
    //   },
    // });
    // await showcaseRoute(viewer, CesiumJs, routePositions);
  };

  const addDirectionPins = () => {
    const start = CesiumJs.Cartesian3.fromDegrees(
      startDegrees.lng,
      startDegrees.lat
    );

    const end = CesiumJs.Cartesian3.fromDegrees(endDegrees.lng, endDegrees.lat);

    viewer.entities.add({
      position: start,
      billboard: {
        image: '/location-pointer.png', // Your custom image for the start point
        verticalOrigin: CesiumJs.VerticalOrigin.BOTTOM,
        heightReference: CesiumJs.HeightReference.CLAMP_TO_GROUND,
        scale: 0.2,
      },
      label: {
        text: 'Start',
        font: '14pt sans-serif',
        style: CesiumJs.LabelStyle.FILL_AND_OUTLINE,
        outlineWidth: 2,
        verticalOrigin: CesiumJs.VerticalOrigin.BOTTOM,
        pixelOffset: new CesiumJs.Cartesian2(0, -120), // Adjust to position the label above the billboard
        heightReference: CesiumJs.HeightReference.CLAMP_TO_GROUND,
      },
    });

    viewer.entities.add({
      position: end,
      billboard: {
        image: '/location-pointer.png',
        verticalOrigin: CesiumJs.VerticalOrigin.BOTTOM,
        heightReference: CesiumJs.HeightReference.CLAMP_TO_GROUND,
        scale: 0.2,
      },
      label: {
        text: 'Ziel',
        font: '14pt sans-serif',
        style: CesiumJs.LabelStyle.FILL_AND_OUTLINE,
        outlineWidth: 2,
        verticalOrigin: CesiumJs.VerticalOrigin.BOTTOM,
        pixelOffset: new CesiumJs.Cartesian2(0, -120), // Adjust to position the label above the billboard
        heightReference: CesiumJs.HeightReference.CLAMP_TO_GROUND,
      },
    });
  };

  const adddirectionRoute = async () => {
    const route = await fetchGoogleDirectionRoute(startDegrees, endDegrees);

    const routePositions = route.map((point) =>
      CesiumJs.Cartesian3.fromDegrees(point.lng, point.lat)
    );
    viewer.entities.add({
      polyline: {
        positions: routePositions,
        width: 5,
        material: CesiumJs.Color.BLUE,
        clampToGround: true,
      },
    });
  };

  const spinAroungPoint = (centerPosition: Cartesian3) => {
    const centerCartographic =
      CesiumJs.Cartographic.fromCartesian(centerPosition);

    return new Promise<void>((resolve) => {
      const spinDuration = 15.0; // Duration of the spin in seconds
      let startTime = Date.now();

      function spin() {
        let elapsed = (Date.now() - startTime) / 1000.0;
        let angle = CesiumJs.Math.toRadians((elapsed / spinDuration) * 360.0);

        viewer.camera.lookAt(
          centerPosition,
          new CesiumJs.HeadingPitchRange(
            angle,
            CesiumJs.Math.toRadians(-30),
            3000
          )
        );

        if (elapsed < spinDuration) {
          requestAnimationFrame(spin);
        } else {
          viewer.camera.lookAtTransform(CesiumJs.Matrix4.IDENTITY);
          resolve();
        }
      }

      spin();
    });
  };

  useEffect(() => {
    if (viewer) {
      adddirectionRoute();
      addDirectionPins();
    }
  }, [viewer]);

  return {
    startShowCase,
    spinAroungPoint,
  };
};

async function fetchGoogleDirectionRoute(
  start: { lng: number; lat: number },
  end: { lng: number; lat: number }
) {
  const response = await fetch(
    `/api/getDirections?origin=${start.lat},${start.lng}&destination=${end.lat},${end.lng}`
  );
  const data = await response.json();

  const route = data.routes[0].overview_polyline.points;
  return decodePolyline(route);
}

// Function to decode the polyline from Google Maps

const decodePolyline = (encoded) => {
  let points = [];
  let index = 0,
    len = encoded.length;
  let lat = 0,
    lng = 0;

  while (index < len) {
    let b,
      shift = 0,
      result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    points.push({
      lat: lat / 1e5,
      lng: lng / 1e5,
    });
  }

  return points;
};

const showcaseRoute = (
  cesiumViewer: Viewer,
  CesiumJs: CesiumType,
  routePositions: Cartesian3[]
) => {
  if (!cesiumViewer || routePositions.length < 2) return;

  const start = routePositions[0];

  // Convert the first position from Cartesian3 to Cartographic (longitude, latitude, height)
  const startCartographic = CesiumJs.Cartographic.fromCartesian(start);

  // Function to spin around the start point
  function spinAroundStart() {
    return new Promise<void>((resolve) => {
      const spinDuration = 15.0; // Duration of the spin in seconds
      let startTime = Date.now();

      function spin() {
        let elapsed = (Date.now() - startTime) / 1000.0;
        let angle = CesiumJs.Math.toRadians((elapsed / spinDuration) * 360.0);

        cesiumViewer.camera.lookAt(
          start,
          new CesiumJs.HeadingPitchRange(
            angle,
            CesiumJs.Math.toRadians(-30),
            500
          )
        );

        if (elapsed < spinDuration) {
          requestAnimationFrame(spin);
        } else {
          cesiumViewer.camera.lookAtTransform(CesiumJs.Matrix4.IDENTITY);
          resolve();
        }
      }

      spin();
    });
  }

  // Smooth transition after spin to the first point of the route
  function transitionToRouteStart() {
    return new Promise((resolve) => {
      const destination = CesiumJs.Cartesian3.fromRadians(
        startCartographic.longitude,
        startCartographic.latitude,
        500 // Altitude for bird's-eye view
      );

      cesiumViewer.camera.flyTo({
        destination,
        orientation: {
          heading: CesiumJs.Math.toRadians(0.0), // Set the initial heading for the route
          pitch: CesiumJs.Math.toRadians(-90.0), // Bird's-eye view
          roll: 0.0,
        },
        duration: 2.0, // Smooth transition duration
        complete: resolve,
      });
    });
  }

  // Function to smoothly follow the route from a bird's-eye view without easing
  function flyAlongRouteSmoothly() {
    let index = 0;

    function flyToNextPoint() {
      if (index >= routePositions.length - 1) {
        return; // End of the route
      }

      const currentPosition = routePositions[index];
      const nextPosition = routePositions[index + 1];

      const currentCartographic =
        CesiumJs.Cartographic.fromCartesian(currentPosition);
      const nextCartographic =
        CesiumJs.Cartographic.fromCartesian(nextPosition);

      // Calculate heading between points
      const headingStart = CesiumJs.Math.toDegrees(
        Math.atan2(
          nextCartographic.longitude - currentCartographic.longitude,
          nextCartographic.latitude - currentCartographic.latitude
        )
      );

      const nextNextPosition = routePositions[index + 2] || nextPosition;
      const nextNextCartographic =
        CesiumJs.Cartographic.fromCartesian(nextNextPosition);

      const headingEnd = CesiumJs.Math.toDegrees(
        Math.atan2(
          nextNextCartographic.longitude - nextCartographic.longitude,
          nextNextCartographic.latitude - nextCartographic.latitude
        )
      );

      const distance = CesiumJs.Cartesian3.distance(
        currentPosition,
        nextPosition
      );
      const speed = 30.0; // Adjust this to control overall speed
      const duration = distance / speed;

      let t = 0;

      function moveCamera() {
        t += 1 / (duration * 60); // 60 FPS

        if (t >= 1.0) {
          t = 1.0;
        }

        const interpolatedLongitude = CesiumJs.Math.lerp(
          currentCartographic.longitude,
          nextCartographic.longitude,
          t
        );
        const interpolatedLatitude = CesiumJs.Math.lerp(
          currentCartographic.latitude,
          nextCartographic.latitude,
          t
        );
        const interpolatedHeading = CesiumJs.Math.lerp(
          headingStart,
          headingEnd,
          t
        );

        const destination = CesiumJs.Cartesian3.fromRadians(
          interpolatedLongitude,
          interpolatedLatitude,
          500
        );

        cesiumViewer.camera.setView({
          destination,
          orientation: {
            heading: CesiumJs.Math.toRadians(interpolatedHeading),
            pitch: CesiumJs.Math.toRadians(-90.0), // Looking straight down
            roll: 0.0,
          },
        });

        if (t < 1.0) {
          requestAnimationFrame(moveCamera);
        } else {
          index++;
          flyToNextPoint();
        }
      }

      moveCamera(); // Start moving the camera
    }

    flyToNextPoint(); // Start the flight sequence
  }

  // Execute the spin, smooth transition, and flyover sequence
  spinAroundStart()
    .then(() => transitionToRouteStart())
    .then(() => flyAlongRouteSmoothly());
};

//   export function dateToJulianDate(
//     CesiumJs: CesiumType,
//     date: Date
//   ): JulianDate {
//     return CesiumJs.JulianDate.fromDate(date);
//   }
