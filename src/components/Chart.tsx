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
    const margin = { top: 20, right: 20, bottom: 60, left: 50 };
    const iW = width - margin.left - margin.right;
    const iH = height - margin.top - margin.bottom;

    const maxVal = d3.max(data, (d) => d.rating.count) || 1000;
    const y = d3
      .scaleLinear()
      .domain([0, maxVal * 1.1])
      .range([iH, 0]);
    const x = d3
      .scaleBand()
      .domain(data.map((d) => d.title))
      .range([0, iW])
      .padding(0.3);

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
    g.append('g')
      .call(d3.axisLeft(y).ticks(5))
      .attr('color', '#848e9c')
      .style('font-size', '12px');

    g.append('g')
      .attr('transform', `translate(0,${iH})`)
      .call(
        d3
          .axisBottom(x)
          .tickFormat((d) => (d.length > 10 ? d.slice(0, 10) + '..' : d))
      )
      .selectAll('text')
      .attr('transform', 'rotate(-30)')
      .style('text-anchor', 'end')
      .attr('color', '#848e9c')
      .style('font-size', '10px');

    g.selectAll('rect')
      .data(data)
      .join('rect')
      .attr('x', (d) => x(d.title)!)
      .attr('width', x.bandwidth())
      .attr('fill', (d) =>
        d.rating.count >= 400
          ? '#2ebd85'
          : d.rating.count >= 150
            ? '#f0b90b'
            : '#f6465d'
      )
      .attr('rx', 4)
      .attr('y', iH)
      .attr('height', 0)
      .transition()
      .duration(1000)
      .ease(d3.easeElasticOut)
      .attr('y', (d) => y(d.rating.count))
      .attr('height', (d) => iH - y(d.rating.count));
  }, [data, isDark]);

  return (
    <svg
      ref={svgRef}
      viewBox='0 0 800 400'
      preserveAspectRatio='xMidYMid meet'
      className='w-full h-full'
    />
  );
};
