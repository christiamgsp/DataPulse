import { useEffect, useState, useRef } from 'react';
import * as d3 from 'd3';

interface Producto {
  id: number;
  title: string;
  price: number;
  category: string;
  rating: {
    rate: number;
    count: number;
  };
}

function App() {
  const [productos, setProductos] = useState<Producto[]>([]);

  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (productos.length > 0 && svgRef.current) {
      const svg = d3.select(svgRef.current);
      const tooltip = d3.select('#tooltip'); // Seleccionamos nuestro div
      svg.selectAll('*').remove();

      const width = 300;
      const height = 150;
      const margin = { top: 20, right: 10, bottom: 40, left: 40 };

      const yScale = d3
        .scaleLinear()
        .domain([0, d3.max(productos, (d) => d.price) || 1000])
        .range([height - margin.bottom, margin.top]);

      const xScale = d3
        .scaleBand()
        .domain(productos.map((_, i) => i.toString()))
        .range([margin.left, width - margin.right])
        .padding(0.2);

      const yAxis = d3
        .axisLeft(yScale)
        .ticks(5)
        .tickFormat((d) => `$${d}`);
      svg
        .append('g')
        .attr('transform', `translate(${margin.left},0)`)
        .call(yAxis)
        .attr('font-size', '6px');

      // DIBUJAR BARRAS CON ANIMACIÓN E INTERACTIVIDAD
      svg
        .selectAll('rect')
        .data(productos)
        .join('rect')
        .attr('x', (_, i) => xScale(i.toString())!)
        .attr('width', xScale.bandwidth())
        .attr('fill', (d) =>
          d.price < 100 ? '#ef4444' : d.price <= 300 ? '#3b82f6' : '#22c55e'
        )
        // --- ANIMACIÓN ---
        .attr('y', height - margin.bottom) // Empiezan abajo
        .attr('height', 0)
        .transition()
        .duration(800)
        .attr('y', (d) => yScale(d.price))
        .attr('height', (d) => height - margin.bottom - yScale(d.price));

      // --- INTERACTIVIDAD (TOOLTIP) ---
      svg
        .selectAll('rect')
        .on('mouseenter', (event, d) => {
          tooltip.transition().duration(200).style('opacity', 0.9);
          tooltip
            .html(`<strong>${d.title}</strong><br/>Precio: $${d.price}`)
            .style('left', event.pageX + 10 + 'px')
            .style('top', event.pageY - 28 + 'px');
        })
        .on('mouseleave', () => {
          tooltip.transition().duration(500).style('opacity', 0);
        });

      // ETIQUETAS (Las mismas de antes)
      svg
        .selectAll('.label')
        .data(productos)
        .join('text')
        .attr('class', 'label')
        .attr('x', (_, i) => xScale(i.toString())! + xScale.bandwidth() / 2)
        .attr('y', height - margin.bottom + 5)
        .attr('transform', (_, i) => {
          const x = xScale(i.toString())! + xScale.bandwidth() / 2;
          const y = height - margin.bottom + 5;
          return `rotate(-45, ${x}, ${y})`;
        })
        .text((d) => d.title.substring(0, 8))
        .attr('font-size', '4px')
        .attr('fill', '#475569');
    }
  }, [productos]);
  useEffect(() => {
    fetch('https://fakestoreapi.com/products?limit=20')
      .then((res) => res.json())
      .then((data) => {
        setProductos(data);
      });
  }, []);
  return (
    <div className='min-h-screen bg-slate-50 text-slate-800 p-8'>
      <h1 className='text-3xl text-center mb-8 text-blue-400 font-bold'>
        DataPulse Dashboard
      </h1>
      <div className='bg-white p-6 rounded-xl shadow-md mb-8 border border-slate-200 w-full max-w-4xl mx-auto'>
        <svg
          ref={svgRef}
          viewBox='0 0 300 150'
          className='w-full h-auto bg-white'></svg>
      </div>
      <div className='grid grid-cols-1 gap-4 max-w-2xl mx-auto'>
        {productos.map((p) => (
          <div
            key={p.id}
            className='bg-white p-4 rounded-lg shadow-md border border-slate-700'>
            <p className='font-bold text-lg'>{p.title}</p>
            <p className='text-blue-400 font-mono'>${p.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
