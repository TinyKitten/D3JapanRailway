/* eslint-disable @typescript-eslint/no-explicit-any */
import { GeoJsonLayer, ScatterplotLayer, TextLayer } from '@deck.gl/layers';
import DeckGL from '@deck.gl/react';
import { IconButton, Snackbar } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import * as d3 from 'd3';
import { FeatureCollection, GeoJsonProperties, Geometry } from 'geojson';
import React, { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import * as topojson from 'topojson-client';
import locationState from './atoms/location';
import Credit from './components/Credit';
import ErrorOverlay from './components/ErrorOverlay';
import LoadingOverlay from './components/LoadingOverlay';
import Tools from './components/Tools';
import japanGeoPath from './data/japan.topojson';
import PREF_OFFICES from './data/prefOffices.json';
import { Station } from './gen/stationapi_pb';
import { useFetchAllStations } from './hooks/useFetchAllStations';

type StationLayerData = {
  type: 'station';
  name: string;
  coordinates: [number, number];
  exits: number;
  address: string;
  id: number;
};

type UserLocationLayerData = {
  type: 'userLocation';
  coordinates: [number, number];
  exits: number;
};

type PrefOffice = {
  pref: string;
  prefEn: string;
  url: string;
  address: string;
  latitude: number;
  longitude: number;
};

const prefNameCharacters = PREF_OFFICES.reduce((acc, cur) => {
  const splitted = cur.pref.split('');
  splitted.forEach((c) => acc.push(c));
  return acc;
}, []).reduce((acc, cur) => {
  if (acc.indexOf(cur) !== -1) {
    return acc;
  } else {
    acc.push(cur);
  }

  return acc;
}, []);

const SCALE_FACTOR = 500;

type ViewState = {
  latitude: number;
  longitude: number;
  zoom: number;
  bearing: number;
  pitch: number;
};

const App: React.FC = () => {
  const [hasLocationError, setHasLocationError] = useState(false);
  const [centerCoordinates, setCenterCoordinates] = useState<[number, number]>([
    136.0,
    35.6,
  ]);
  const [{ location, followLocation }, setLocationFromState] = useRecoilState(
    locationState
  );

  const initialViewState: ViewState = {
    latitude: centerCoordinates[1],
    longitude: centerCoordinates[0],
    zoom: location ? 12 : 4,
    bearing: 0,
    pitch: 0,
  };

  const [geoJSONLayer, setGeoJSONLayer] = useState<any>();
  const [scatterplotLayer, setScatterplotLayer] = useState<any>();
  const [
    userLocationScatterplotLayer,
    setUserLocationScatterplotLayer,
  ] = useState<any>();

  const { stations, loading, error } = useFetchAllStations();

  useEffect(() => {
    if (!location) {
      return;
    }
    const layer = new ScatterplotLayer({
      id: 'scatterplot-layer-my-location',
      data: [
        {
          type: 'userLocation',
          coordinates: [location.coords.longitude, location.coords.latitude],
          exits: SCALE_FACTOR,
        },
      ] as UserLocationLayerData[],
      pickable: true,
      opacity: 0.8,
      stroked: true,
      filled: true,
      radiusScale: 6,
      radiusMinPixels: 1,
      radiusMaxPixels: 100,
      lineWidthMinPixels: 1,
      getLineColor: () => [255, 255, 255],
      getPosition: (d: UserLocationLayerData) =>
        (d as UserLocationLayerData).coordinates,
      getRadius: (d: UserLocationLayerData) =>
        Math.sqrt((d as UserLocationLayerData).exits),
      getFillColor: () => [0, 143, 254],
    });
    setUserLocationScatterplotLayer(layer);
  }, [location]);

  useEffect(() => {
    const initAsync = async () => {
      const topo = await d3.json<
        TopoJSON.Topology<TopoJSON.Objects<GeoJsonProperties>>
      >(japanGeoPath);

      if (!topo) {
        return;
      }

      const geojson = topojson.feature(
        topo,
        topo.objects.japan
      ) as FeatureCollection<Geometry, GeoJsonProperties>;

      const layer = new GeoJsonLayer({
        id: 'geojson-layer',
        data: geojson,
        getFillColor: [160, 160, 180, 200],
        stroked: true,
        extruded: false,
        wireframe: true,
        lineJointRounded: true,
        lineWidthMinPixels: 1,
      });
      setGeoJSONLayer(layer);
    };
    initAsync();
  }, []);

  useEffect(() => {
    if (!stations.length) {
      return;
    }

    const layer = new ScatterplotLayer({
      id: 'scatterplot-layer',
      data: stations.map(
        (s: Station.AsObject) =>
          ({
            type: 'station',
            name: s.name,
            coordinates: [s.longitude, s.latitude],
            exits: SCALE_FACTOR,
            address: s.address,
            id: s.groupId,
          } as StationLayerData)
      ),
      pickable: true,
      opacity: 0.8,
      stroked: true,
      filled: true,
      radiusScale: 6,
      radiusMinPixels: 1,
      radiusMaxPixels: 100,
      lineWidthMinPixels: 1,
      getPosition: (d: StationLayerData) => (d as StationLayerData).coordinates,
      getRadius: (d: StationLayerData) =>
        Math.sqrt((d as StationLayerData).exits),
      getFillColor: () => [255, 140, 0],
      onClick: (d: { object: unknown | StationLayerData }) =>
        window.open(
          `https://near.tinykitten.me/station/${
            (d.object as StationLayerData).id
          }`
        ),
      getLineColor: () => [33, 33, 33],
    });
    setScatterplotLayer(layer);
  }, [stations]);

  useEffect(() => {
    setLocationFromState((prev) => ({
      ...prev,
    }));
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setLocationFromState((prev) => ({
          ...prev,
          location: pos,
        }));
      },
      () => {
        setHasLocationError(true);
      },
      {
        enableHighAccuracy: true,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [setLocationFromState]);

  useEffect(() => {
    if (!location) {
      return;
    }
    const {
      coords: { latitude, longitude },
    } = location;
    if (followLocation) {
      setCenterCoordinates([longitude, latitude]);
    }
  }, [followLocation, location, setLocationFromState]);

  if (!geoJSONLayer || !scatterplotLayer) {
    return <LoadingOverlay />;
  }

  const closeLocationErrorSnackbar = () => setHasLocationError(false);

  const UntypedDeckGL = DeckGL as any;

  const getTooltip = ({
    object,
  }: {
    object: StationLayerData | UserLocationLayerData;
  }) => {
    if (!object) {
      return;
    }

    switch (object.type) {
      case 'station':
        return `${object.name}駅\n${object.address}\n緯度: ${object.coordinates[1]}\n経度: ${object.coordinates[0]}`;
      case 'userLocation':
        return `現在地\n緯度: ${object.coordinates[1]}\n経度: ${object.coordinates[0]}`;
      default:
        return;
    }
  };

  const prefOfficeTextLayer = new TextLayer({
    id: 'pref-office-text-layer',
    data: PREF_OFFICES,
    pickable: true,
    getPosition: (d: PrefOffice) => [d.longitude, d.latitude],
    getText: (d: PrefOffice) => d.pref,
    getSize: Math.sqrt(SCALE_FACTOR),
    getAngle: 0,
    getTextAnchor: 'middle',
    getAlignmentBaseline: 'center',
    characterSet: prefNameCharacters,
    getColor: [238, 238, 238, 200],
  });

  const handleDragEnd = () =>
    setLocationFromState((prev) => ({ ...prev, followLocation: false }));

  return (
    <>
      {loading && <LoadingOverlay />}
      {error && <ErrorOverlay />}
      <UntypedDeckGL
        initialViewState={initialViewState}
        controller={true}
        layers={[
          geoJSONLayer,
          scatterplotLayer,
          userLocationScatterplotLayer,
          prefOfficeTextLayer,
        ]}
        getTooltip={getTooltip}
        onDragEnd={handleDragEnd}
      />
      <Credit />
      <Tools />
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        open={hasLocationError}
        autoHideDuration={6000}
        onClose={() => setHasLocationError(false)}
        message="位置情報を取得できませんでした"
        action={
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={closeLocationErrorSnackbar}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      />
    </>
  );
};

export default App;
