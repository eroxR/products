import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

// Interfaces basadas en tu ProductoController.php
interface Producto {
  id: number;
  nombre: string;
  precio: number;
  descripcion: string;
}

interface ProductoFormData {
  nombre: string;
  precio: string; // Se maneja como string en el formulario para facilitar la edición
  descripcion: string;
}

const Productos: React.FC = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [formData, setFormData] = useState<ProductoFormData>({
    nombre: '',
    precio: '',
    descripcion: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // URL de la API de Productos
  const API_BASE_URL = '/api/api/productos';

  // Cargar productos al iniciar
  useEffect(() => {
    fetchProductos();
  }, []);

  // Obtener todos los productos
  const fetchProductos = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_BASE_URL);
      if (response.ok) {
        const data = await response.json();
        setProductos(data.records || []);
      } else {
        console.error('Error al cargar productos');
        setProductos([]);
      }
    } catch (error) {
      console.error('Error de conexión:', error);
      Swal.fire('Error', 'No se pudo conectar con el servidor para cargar productos', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Crear producto
  const createProducto = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            ...formData,
            precio: parseFloat(formData.precio) // Convertir a número antes de enviar
        }),
      });

      if (response.status === 201) {
        await fetchProductos();
        clearForm();
        Swal.fire('¡Éxito!', 'Producto creado correctamente', 'success');
      } else {
        const errorData = await response.json();
        Swal.fire('Error', errorData.message || 'Error al crear el producto', 'error');
      }
    } catch (error) {
        console.error('Error:', error);
      Swal.fire('Error', 'Error de conexión al crear el producto', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Actualizar producto
  const updateProducto = async () => {
    if (!editingId) return;
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            ...formData,
            precio: parseFloat(formData.precio)
        }),
      });

      if (response.ok) {
        await fetchProductos();
        clearForm();
        Swal.fire('¡Éxito!', 'Producto actualizado correctamente', 'success');
      } else {
        const errorData = await response.json();
        Swal.fire('Error', errorData.message || 'Error al actualizar el producto', 'error');
      }
    } catch (error) {
        console.error('Error:', error);
      Swal.fire('Error', 'Error de conexión al actualizar el producto', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Eliminar producto
  const deleteProducto = async (id: number, nombre: string) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar el producto "${nombre}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/${id}`, { method: 'DELETE' });
        if (response.ok) {
          await fetchProductos();
          Swal.fire('¡Eliminado!', 'Producto eliminado correctamente.', 'success');
        } else {
          Swal.fire('Error', 'Error al eliminar el producto', 'error');
        }
      } catch (error) {
        console.error('Error:', error);
        Swal.fire('Error', 'Error de conexión al eliminar el producto', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  // Preparar formulario para edición
  const editProducto = (producto: Producto) => {
    setIsEditing(true);
    setEditingId(producto.id);
    setFormData({
      nombre: producto.nombre,
      precio: producto.precio.toString(),
      descripcion: producto.descripcion || ''
    });
    document.getElementById('form-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Limpiar formulario
  const clearForm = () => {
    setFormData({ nombre: '', precio: '', descripcion: '' });
    setIsEditing(false);
    setEditingId(null);
  };

  // Manejar envío del formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      updateProducto();
    } else {
      createProducto();
    }
  };

  return (
    <>
      <header className="header">
        <h1>Administración de Productos</h1>
        <div className="header-line"></div>
      </header>

      <section id="form-section" className="form-section">
        <div className="container">
          <div className="form-card">
            <h2>{isEditing ? 'Editar Producto' : 'Nuevo Producto'}</h2>
            <form onSubmit={handleSubmit} className="client-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="nombre">Nombre del Producto</label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    required
                    placeholder="Ej: Laptop, Teclado, etc."
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="precio">Precio</label>
                  <input
                    type="number"
                    id="precio"
                    name="precio"
                    value={formData.precio}
                    onChange={handleInputChange}
                    required
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="descripcion">Descripción (Opcional)</label>
                  <textarea
                    id="descripcion"
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Breve descripción del producto"
                  />
                </div>
              </div>

              <div className="form-buttons">
                <button type="submit" className={`btn ${isEditing ? 'btn-update' : 'btn-create'}`} disabled={loading}>
                  {loading ? '⏳' : isEditing ? '✏️ Actualizar' : '➕ Crear'}
                </button>
                {isEditing && (
                  <button type="button" className="btn btn-cancel" onClick={clearForm}>
                    ❌ Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </section>

      <section className="list-section">
        <div className="container">
          <div className="list-header">
            <h2>Lista de Productos</h2>
            <span className="client-count">{productos.length} producto{productos.length !== 1 ? 's' : ''}</span>
          </div>
          {loading && (
            <div className="loading"><div className="spinner"></div><p>Cargando...</p></div>
          )}
          <div className="clients-table-container">
            {productos.length === 0 && !loading ? (
              <div className="no-clients">
                <div className="no-clients-icon">📦</div>
                <h3>No hay productos registrados</h3>
                <p>Agrega tu primer producto usando el formulario de arriba</p>
              </div>
            ) : (
              <div className="clients-table-card">
                <table className="clients-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nombre</th>
                      <th>Descripción</th>
                      <th>Precio</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productos.map(producto => (
                      <tr key={producto.id}>
                        <td><span className="id-badge">{producto.id}</span></td>
                        <td className="client-name">{producto.nombre}</td>
                        <td>{producto.descripcion || <span className="no-phone">Sin descripción</span>}</td>
                        <td>${producto.precio.toFixed(2)}</td>
                        <td>
                          <div className="actions-container">
                            <button className="btn-action btn-edit" title="Editar producto" onClick={() => editProducto(producto)}>✏️</button>
                            <button className="btn-action btn-delete" title="Eliminar producto" onClick={() => deleteProducto(producto.id, producto.nombre)}>🗑️</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default Productos;