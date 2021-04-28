import React, { useEffect, useState } from 'react';
import { gql, useQuery } from '@apollo/client';
import DeckGL from '@deck.gl/react';
import {
  GeoJsonLayer,
  GeoJsonLayerProps,
  ScatterplotLayer,
  ScatterplotLayerProps,
} from '@deck.gl/layers';
import * as topojson from 'topojson-client';
import * as d3 from 'd3';
import { GeoJsonProperties, FeatureCollection, Geometry } from 'geojson';
import japanGeoPath from './geo/japan.topojson';
import LoadingOverlay from './components/LoadingOverlay';
import Station from './models/Station';
import ErrorOverlay from './components/ErrorOverlay';

const ALL_STATIONS = gql`
  query GetAllStations {
    allStations {
      name
      latitude
      longitude
      address
    }
  }
`;

type StationLayerData = {
  name: string;
  coordinates: [number, number];
  exits: number;
  address: string;
};

const App: React.FC = () => {
  const { loading, error, data } = useQuery(ALL_STATIONS);

  const initialViewState = {
    latitude: 35.6,
    longitude: 136.0,
    zoom: 4,
    bearing: 0,
    pitch: 0,
  };

  const [geoJSONLayer, setGeoJSONLayer] = useState<
    GeoJsonLayer<
      FeatureCollection<Geometry, GeoJsonProperties>,
      GeoJsonLayerProps<FeatureCollection<Geometry, GeoJsonProperties>>
    >
  >();
  const [scatterplotLayer, setScatterplotLayer] = useState<
    ScatterplotLayer<StationLayerData, ScatterplotLayerProps<StationLayerData>>
  >();

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

    const layer = new ScatterplotLayer<StationLayerData>({
      id: 'scatterplot-layer',
      data: data.allStations.map((s: Station) => ({
        name: s.name,
        coordinates: [s.longitude, s.latitude],
        exits: 4214,
        address: s.address,
      })),
      pickable: true,
      opacity: 0.8,
      stroked: true,
      filled: true,
      radiusScale: 6,
      radiusMinPixels: 1,
      radiusMaxPixels: 100,
      lineWidthMinPixels: 1,
      getPosition: (d) => d.coordinates,
      getRadius: (d) => Math.sqrt(d.exits),
      getFillColor: () => [255, 140, 0],
    });
    setScatterplotLayer(layer);
  }, [data]);

  if (!geoJSONLayer || !scatterplotLayer) {
    return <LoadingOverlay />;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const UntypedDeckGL = DeckGL as any;

  return (
    <>
      {loading && <LoadingOverlay />}
      {error && <ErrorOverlay />}
      <UntypedDeckGL
        initialViewState={initialViewState}
        controller={true}
        layers={[geoJSONLayer, scatterplotLayer]}
        width={window.innerWidth}
        height={window.innerHeight}
        getTooltip={({ object }: { object: StationLayerData }) =>
          object &&
          `${object.name}駅\n${object.address}\n緯度: ${object.coordinates[0]}\n経度: ${object.coordinates[1]}`
        }
      />
    </>
  );
};

export default App;
