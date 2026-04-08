import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { Producto } from '../App';

interface ChartProps {
  data: Producto[];
  isDark: boolean;
}

export const Chart = ({ data, isDark }: ChartProps) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 800;
    const height = 400;
    const margin = { top: 40, right: 30, bottom: 80, left: 60 };
    const iW = width - margin.left - margin.right;
    const iH = height - margin.top - margin.bottom;

    const y = d3.scaleLinear().domain([0, 1000]).range([iH, 0]);
    const x = d3
      .scaleBand()
      .domain(data.map((d) => d.title))
      .range([0, iW])
      .padding(0.4);

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    g.append('g')
      .attr('opacity', isDark ? 0.05 : 0.1)
      .call(
        d3
          .axisLeft(y)
          .tickSize(-iW)
          .tickFormat(() => '')
      )
      .selectAll('line')
      .attr('stroke', isDark ? 'white' : 'black');

    g.append('g').call(d3.axisLeft(y).ticks(5)).attr('color', '#848e9c');

    g.append('g')
      .attr('transform', `translate(0,${iH})`)
      .call(
        d3
          .axisBottom(x)
          .tickFormat((d) => (d.length > 8 ? d.slice(0, 8) + '..' : d))
      )
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end')
      .attr('color', '#848e9c');

    g.selectAll('rect')
      .data(data)
      .join('rect')
      .attr('x', (d) => x(d.title)!)
      .attr('width', x.bandwidth())
      .attr('fill', (d) =>
        d.rating.count >= 500
          ? '#2ebd85'
          : d.rating.count >= 200
            ? '#f0b90b'
            : '#f6465d'
      )
      .attr('y', iH)
      .attr('height', 0)
      .transition()
      .duration(800)
      .attr('y', (d) => y(Math.min(d.rating.count, 1000)))
      .attr('height', (d) => iH - y(Math.min(d.rating.count, 1000)));
  }, [data, isDark]);

  return <svg ref={svgRef} viewBox='0 0 800 400' className='w-full h-full' />;
};
