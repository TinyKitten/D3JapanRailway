import * as topojson from 'topojson-client';
import { select as d3Select, json as d3Json } from 'd3';
import { geoMercator, geoPath } from 'd3-geo';
import { GeoJsonProperties, Geometry, FeatureCollection } from 'geojson';
import japanGeoPath from './geo/japan.topojson';

import React, { useCallback, useEffect, useRef } from 'react';

const MAP_WIDTH = window.innerWidth;
const MAP_HEIGHT = window.innerHeight;
const MAP_SCALE = 1200;

const App: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const createMap = useCallback(async () => {
    const projection = geoMercator()
      .center([136.0, 35.6])
      .translate([MAP_WIDTH / 2, MAP_HEIGHT / 2])
      .scale(MAP_SCALE);

    const path = geoPath(projection).projection(projection);

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
    svg
      .append('g')
      .selectAll('path')
      .data(geojson.features)
      .enter()
      .append('path')
      .attr('d', path)
      .attr('stroke', 'black')
      .attr('fill', 'none');
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
