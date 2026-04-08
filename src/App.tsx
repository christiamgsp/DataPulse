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
      svg.selectAll('*').remove();

      const width = 300;
      const height = 150;
      const margin = { top: 20, right: 10, bottom: 40, left: 40 }; // Espacio para los ejes

      // 1. CREAR ESCALAS
      const yScale = d3
        .scaleLinear()
        .domain([0, d3.max(productos, (d) => d.price) || 1000]) // De 0 al precio más alto
        .range([height - margin.bottom, margin.top]); // De abajo hacia arriba

      const xScale = d3
        .scaleBand()
        .domain(productos.map((_, i) => i.toString()))
        .range([margin.left, width - margin.right])
        .padding(0.2);

      // 2. DIBUJAR EJES
      const yAxis = d3
        .axisLeft(yScale)
        .ticks(5)
        .tickFormat((d) => `$${d}`);
      svg
        .append('g')
        .attr('transform', `translate(${margin.left},0)`)
        .call(yAxis)
        .attr('font-size', '6px');

      // 3. DIBUJAR BARRAS (Usando las escalas)
      svg
        .selectAll('rect')
        .data(productos)
        .join('rect')
        .attr('x', (_, i) => xScale(i.toString())!)
        .attr('y', (d) => yScale(d.price))
        .attr('width', xScale.bandwidth())
        .attr('height', (d) => height - margin.bottom - yScale(d.price))
        .attr('fill', (d) => {
          if (d.price < 100) return '#ef4444';
          if (d.price <= 300) return '#3b82f6';
          return '#22c55e';
        });

      // 4. ETIQUETAS ROTADAS (Ajustadas a la nueva escala)
      svg
        .selectAll('.label')
        .data(productos)
        .join('text')
        .attr('class', 'label')
        .attr('x', (_, i) => xScale(i.toString())! + xScale.bandwidth() / 2)
        .attr('y', height - margin.bottom + 10)
        .attr('transform', (_, i) => {
          const x = xScale(i.toString())! + xScale.bandwidth() / 2;
          const y = height - margin.bottom + 10;
          return `rotate(-45, ${x}, ${y})`; // 45 grados para que sea más fácil leer
        })
        .text((d) => d.title.substring(0, 10))
        .attr('font-size', '5px')
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
