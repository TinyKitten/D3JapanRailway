import * as topojson from 'topojson-client';
import { select as d3Select, json as d3Json, Selection } from 'd3';
import { geoCircle, geoMercator, geoPath } from 'd3-geo';
import { GeoJsonProperties, Geometry, FeatureCollection } from 'geojson';
import japanGeoPath from './geo/japan.topojson';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { gql, useQuery } from '@apollo/client';
import Station from './models/Station';

const MAP_WIDTH = window.innerWidth;
const MAP_HEIGHT = window.innerHeight;
const MAP_SCALE = 1200;

const ALL_STATIONS = gql`
  query GetAllStations {
    allStations {
      name
      latitude
      longitude
    }
  }
`;

const projection = geoMercator()
  .center([136.0, 35.6])
  .translate([MAP_WIDTH / 2, MAP_HEIGHT / 2])
  .scale(MAP_SCALE);
const path = geoPath(projection).projection(projection);

const App: React.FC = () => {
  const { /*loading,*/ error, data } = useQuery(ALL_STATIONS);
  const [rootGroup, setRootGroup] = useState<
    Selection<SVGGElement, unknown, null, undefined>
  >();

  useEffect(() => {
    if (error) {
      alert(error.message);
    }
  }, [error]);

  const svgRef = useRef<SVGSVGElement>(null);
  useEffect(() => {
    if (!rootGroup) {
      return;
    }
    data?.allStations.forEach((s: Station) => {
      const circle = geoCircle()
        .center([s.longitude, s.latitude])
        .radius(0.025);
      rootGroup
        .append('path')
        .datum(circle)
        .attr('class', 'circle')
        .attr('d', path)
        .attr('fill', 'red');
    });
  }, [data, rootGroup]);

  const createMap = useCallback(async () => {
    const svg = d3Select(svgRef.current)
      .attr('width', MAP_WIDTH)
      .attr('height', MAP_HEIGHT);
    const topo = await d3Json<
      TopoJSON.Topology<TopoJSON.Objects<GeoJsonProperties>>
    >(japanGeoPath);

    if (!topo) {
      return;
    }
    const geojson = topojson.feature(
      topo,
      topo.objects.japan
    ) as FeatureCollection<Geometry, GeoJsonProperties>;
    const g = svg.append('g');
    g.selectAll('path')
      .data(geojson.features)
      .enter()
      .append('path')
      .attr('d', path)
      .attr('stroke', 'white')
      .attr('fill', 'black');

    setRootGroup(g);
  }, []);

  useEffect(() => {
    createMap();
  }, [createMap]);
  return (
    <div className="App">
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default App;
