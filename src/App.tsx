import { useEffect, useState } from 'react';

interface Producto {
  id: number;
  title: string;
  price?: number;
  category: string;
}

function App() {
  const [productos, setProductos] = useState<Producto[]>([]);

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
