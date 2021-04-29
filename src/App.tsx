/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { gql, useQuery } from '@apollo/client';
import DeckGL from '@deck.gl/react';
import { GeoJsonLayer, ScatterplotLayer } from '@deck.gl/layers';
import * as topojson from 'topojson-client';
import * as d3 from 'd3';
import { GeoJsonProperties, FeatureCollection, Geometry } from 'geojson';
import japanGeoPath from './geo/japan.topojson';
import LoadingOverlay from './components/LoadingOverlay';
import Station from './models/Station';
import ErrorOverlay from './components/ErrorOverlay';
import Credit from './components/Credit';
import { IconButton, Snackbar } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import locationState from './atoms/location';
import { useRecoilState } from 'recoil';
import Tools from './components/Tools';

const ALL_STATIONS = gql`
  query GetAllStations {
    allStations {
      groupId
      name
      latitude
      longitude
      address
    }
  }
`;

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

const App: React.FC = () => {
  const { loading, error, data } = useQuery(ALL_STATIONS);
  const [hasLocationError, setHasLocationError] = useState(false);
  const [pendingLocationFetch, setPendingLocationFetch] = useState(true);
  const [{ location }, setLocationFromState] = useRecoilState(locationState);

  const initialViewState = {
    latitude: location?.coords.latitude || 35.6,
    longitude: location?.coords.longitude || 136.0,
    zoom: location ? 10 : 4,
    bearing: 0,
    pitch: 0,
  };

  const [geoJSONLayer, setGeoJSONLayer] = useState<any>();
  const [scatterplotLayer, setScatterplotLayer] = useState<any>();
  const [
    userLocationScatterplotLayer,
    setUserLocationScatterplotLayer,
  ] = useState<any>();

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
          exits: 4214,
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
    if (!data) {
      return;
    }

    const layer = new ScatterplotLayer({
      id: 'scatterplot-layer',
      data: data.allStations.map(
        (s: Station) =>
          ({
            type: 'station',
            name: s.name,
            coordinates: [s.longitude, s.latitude],
            exits: 4214,
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
  }, [data]);

  useEffect(() => {
    setLocationFromState((prev) => ({
      ...prev,
      fetching: true,
    }));
    navigator.geolocation.getCurrentPosition(
      (location) => {
        setLocationFromState((prev) => ({
          ...prev,
          location,
          fetching: false,
        }));
        setPendingLocationFetch(false);
      },
      () => {
        setHasLocationError(true);
        setPendingLocationFetch(false);
      }
    );
  }, [setLocationFromState]);

  if (pendingLocationFetch || !geoJSONLayer || !scatterplotLayer) {
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
        `${object.name}駅\n${object.address}\n緯度: ${object.coordinates[1]}\n経度: ${object.coordinates[0]}`;
        return;
      case 'userLocation':
        return `現在地\n緯度: ${object.coordinates[1]}\n経度: ${object.coordinates[0]}`;
      default:
        return;
    }
  };

  return (
    <>
      {loading && <LoadingOverlay />}
      {error && <ErrorOverlay />}
      <UntypedDeckGL
        initialViewState={initialViewState}
        controller={true}
        layers={[geoJSONLayer, scatterplotLayer, userLocationScatterplotLayer]}
        width={window.innerWidth}
        height={window.innerHeight}
        getTooltip={getTooltip}
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
