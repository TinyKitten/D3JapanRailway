import * as topojson from 'topojson-client';
import * as d3 from 'd3';
import { GeoJsonProperties, Geometry, FeatureCollection } from 'geojson';
import japanGeoPath from './geo/japan.topojson';
import React, { useCallback, useEffect, useRef } from 'react';
import { gql, useQuery } from '@apollo/client';
import Station from './models/Station';
import LoadingOverlay from './components/LoadingOverlay';
import { D3ZoomEvent } from 'd3';

const MAP_WIDTH = window.innerWidth;
const MAP_HEIGHT = window.innerHeight;
const INITIAL_SCALE = 1200;

const ALL_STATIONS = gql`
  query GetAllStations {
    allStations {
      latitude
      longitude
    }
  }
`;

const projection = d3
  .geoEquirectangular()
  .scale(MAP_WIDTH)
  .rotate([0, 0])
  .center([136.0, 35.6])
  .translate([MAP_WIDTH / 2, MAP_HEIGHT / 2])
  .scale(INITIAL_SCALE);

const path = d3.geoPath(projection).projection(projection);

const App: React.FC = () => {
  const { loading, error, data } = useQuery(ALL_STATIONS);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (error) {
      alert(error.message);
    }
  }, [error]);

  const renderMap = useCallback(async () => {
    const topo = await d3.json<
      TopoJSON.Topology<TopoJSON.Objects<GeoJsonProperties>>
    >(japanGeoPath);

    if (!topo || !data) {
      return;
    }

    const geojson = topojson.feature(
      topo,
      topo.objects.japan
    ) as FeatureCollection<Geometry, GeoJsonProperties>;
    const svg = d3
      .select(svgRef?.current as Element)
      .attr('width', MAP_WIDTH)
      .attr('height', MAP_HEIGHT);

    const zoomLayer = svg.append('g');

    zoomLayer
      .append('g')
      .selectAll('path')
      .data(geojson.features)
      .enter()
      .append('path')
      .attr('d', path)
      .attr('stroke', 'white')
      .attr('fill', 'black')
      .attr('cursor', 'grab');
    const stations = data.allStations as Station[];

    const dots = zoomLayer
      .append('g')
      .selectAll('circle')
      .data(stations)
      .enter()
      .append('circle')
      .attr(
        'transform',
        (d) => `translate(${projection([d.longitude, d.latitude])})`
      )
      .attr('r', 0.5)
      .attr('fill', ' red');

    const zoomed = (e: D3ZoomEvent<Element, null>) => {
      zoomLayer.attr('transform', e.transform.toString());
      if (e.transform.k < 8) {
        dots.attr('r', 0.5);
      } else if (e.transform.k < 16) {
        dots.attr('r', 0.25);
      } else if (e.transform.k < 32) {
        dots.attr('r', 0.1);
      } else if (e.transform.k <= 64) {
        dots.attr('r', 0.05);
      }
    };

    const dragstarted = () => {
      zoomLayer.attr('cursor', 'grabbing');
    };

    function dragended() {
      zoomLayer.attr('cursor', 'grab');
    }

    svg.call(
      d3
        .zoom()
        .extent([
          [0, 0],
          [MAP_WIDTH, MAP_HEIGHT],
        ])
        .scaleExtent([0, 64])
        .on('zoom', zoomed)
    );
    svg.call(d3.drag().on('start', dragstarted).on('end', dragended));
  }, [data]);

  useEffect(() => {
    renderMap();
  }, [renderMap]);

  return (
    <>
      {loading && <LoadingOverlay />}
      <svg style={{ cursor: 'drag' }} ref={svgRef}></svg>
    </>
  );
};

export default App;
