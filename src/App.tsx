import { useEffect, useState, useRef } from 'react';
import * as d3 from 'd3';

interface Producto {
  id: number;
  title: string;
  price: number;
  category: string;
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
      const barPadding = 5;
      const barWidth = width / productos.length - barPadding;

      svg
        .selectAll('rect')
        .data(productos)
        .join('rect')
        .attr('x', (d, i) => i * (barWidth + barPadding)) // Posición X basada en el índice
        .attr('y', (d) => height - d.price / 10)
        .attr('width', barWidth)
        .attr('height', (d) => d.price / 10)
        .attr('fill', '#60a5fa');
    }
  }, [productos]);

  useEffect(() => {
    fetch('https://fakestoreapi.com/products?limit=5')
      .then((res) => res.json())
      .then((data) => {
        console.log('Datos recibidos:', data);
        setProductos(data);
      });
  }, []);
  return (
    <div className='min-h-screen bg-slate-900 text-white p-8'>
      <h1 className='text-3xl text-center mb-8 text-blue-400 font-bold'>
        DataPulse Dashboard
      </h1>
      <div className='bg-slate-800 p-6 rounded-xl shadow-lg mb-8 flex justify-center border border-slate-700'>
        <svg
          ref={svgRef}
          width='300'
          height='150'
          className='bg-slate-900 rounded border border-slate-700'></svg>
      </div>
      <div className='grid grid-cols-1 gap-4 max-w-2xl mx-auto'>
        {productos.map((p) => (
          <div
            key={p.id}
            className='bg-slate-800 p-4 rounded-lg shadow-md border border-slate-700'>
            <p className='font-bold text-lg'>{p.title}</p>
            <p className='text-blue-400 font-mono'>${p.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
