import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

// --- Interfaces basadas en tu API ---
interface ProductoInfo {
  nombre: string;
  precio: number;
}

interface PedidoInfo {
  fecha_pedido: string;
  cliente_nombre: string;
}

interface DetallePedido {
  id: number;
  pedido_id: number;
  producto_id: number;
  cantidad: number;
  producto: ProductoInfo;
  pedido: PedidoInfo;
  subtotal: number;
}

interface DetallePedidoFormData {
  pedido_id: string;
  producto_id: string;
  cantidad: string;
}

// Interfaces para poblar los <select> del formulario
interface PedidoParaSelect {
  id: number;
  cliente: { nombre: string };
  fecha_pedido: string;
}

interface ProductoParaSelect {
  id: number;
  nombre: string;
}

const DetallePedidos: React.FC = () => {
  const [detalles, setDetalles] = useState<DetallePedido[]>([]);
  const [pedidos, setPedidos] = useState<PedidoParaSelect[]>([]);
  const [productos, setProductos] = useState<ProductoParaSelect[]>([]);
  const [formData, setFormData] = useState<DetallePedidoFormData>({
    pedido_id: '',
    producto_id: '',
    cantidad: '1'
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // --- URLs de las APIs ---
  const API_DETALLES_URL = '/api/api/detalles-pedidos';
  const API_PEDIDOS_URL = '/api/api/pedidos';
  const API_PRODUCTOS_URL = '/api/api/productos';

  // --- Cargar todos los datos necesarios al iniciar ---
  useEffect(() => {
    fetchDetalles();
    fetchPedidosParaSelect();
    fetchProductosParaSelect();
  }, []);

  const fetchDetalles = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_DETALLES_URL);
      const data = await response.json();
      setDetalles(response.ok ? data.records || [] : []);
    } catch (error) {
        console.error('Error:', error);
      Swal.fire('Error', 'No se pudo conectar para cargar los detalles de pedidos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchPedidosParaSelect = async () => {
    try {
      const response = await fetch(API_PEDIDOS_URL);
      const data = await response.json();
      if (response.ok) setPedidos(data.records || []);
    } catch (error) { console.error("Error cargando pedidos:", error); }
  };

  const fetchProductosParaSelect = async () => {
    try {
      const response = await fetch(API_PRODUCTOS_URL);
      const data = await response.json();
      if (response.ok) setProductos(data.records || []);
    } catch (error) { console.error("Error cargando productos:", error); }
  };

  // --- Lógica CRUD ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const createDetalle = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_DETALLES_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pedido_id: parseInt(formData.pedido_id),
          producto_id: parseInt(formData.producto_id),
          cantidad: parseInt(formData.cantidad)
        }),
      });
      const data = await response.json();
      if (response.status === 201) {
        await fetchDetalles();
        clearForm();
        Swal.fire('¡Éxito!', data.message, 'success');
      } else {
        Swal.fire('Error', data.message || 'Error al crear el detalle', 'error');
      }
    } catch (error) {
        console.error('Error:', error);
      Swal.fire('Error', 'Error de conexión al crear el detalle', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateDetalle = async () => {
    if (!editingId) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_DETALLES_URL}/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pedido_id: parseInt(formData.pedido_id),
          producto_id: parseInt(formData.producto_id),
          cantidad: parseInt(formData.cantidad)
        }),
      });
      const data = await response.json();
      if (response.ok) {
        await fetchDetalles();
        clearForm();
        Swal.fire('¡Éxito!', data.message, 'success');
      } else {
        Swal.fire('Error', data.message || 'Error al actualizar', 'error');
      }
    } catch (error) {
        console.error('Error:', error);
      Swal.fire('Error', 'Error de conexión al actualizar', 'error');
    } finally {
      setLoading(false);
    }
  };

    const deleteDetalle = async (id: number) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar el detalle con ID #${id}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      setLoading(true);
      try {
        const response = await fetch(`${API_DETALLES_URL}/${id}`, { method: 'DELETE' });
        if (response.ok) {
          await fetchDetalles();
          Swal.fire('¡Eliminado!', 'El detalle ha sido eliminado.', 'success');
        } else {
          Swal.fire('Error', 'Error al eliminar el detalle', 'error');
        }
      } catch (error) {
        console.error('Error:', error);
        Swal.fire('Error', 'Error de conexión al eliminar', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const editDetalle = (detalle: DetallePedido) => {
    setIsEditing(true);
    setEditingId(detalle.id);
    setFormData({
      pedido_id: detalle.pedido_id.toString(),
      producto_id: detalle.producto_id.toString(),
      cantidad: detalle.cantidad.toString()
    });
    document.getElementById('form-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const clearForm = () => {
    setFormData({ pedido_id: '', producto_id: '', cantidad: '1' });
    setIsEditing(false);
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      updateDetalle();
    } else {
      createDetalle();
    }
  };


  return (
    <>
      <header className="header">
        <h1>Administración de Detalles de Pedidos</h1>
        <div className="header-line"></div>
      </header>
      
      <section id="form-section" className="form-section">
        <div className="container">
          <div className="form-card">
            <h2>{isEditing ? 'Editar Detalle' : 'Nuevo Detalle de Pedido'}</h2>
            <form onSubmit={handleSubmit} className="client-form">
              <div className="form-group select-wrapper">
                <label htmlFor="pedido_id">Pedido</label>
                <select id="pedido_id" name="pedido_id" value={formData.pedido_id} onChange={handleInputChange} required>
                  <option value="" disabled>Selecciona un pedido</option>
                  {pedidos.map(p => (
                    <option key={p.id} value={p.id}>
                      ID: {p.id} - {p.cliente.nombre} ({new Date(p.fecha_pedido).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group select-wrapper">
                  <label htmlFor="producto_id">Producto</label>
                  <select id="producto_id" name="producto_id" value={formData.producto_id} onChange={handleInputChange} required>
                    <option value="" disabled>Selecciona un producto</option>
                    {productos.map(prod => <option key={prod.id} value={prod.id}>{prod.nombre}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="cantidad">Cantidad</label>
                  <input type="number" id="cantidad" name="cantidad" value={formData.cantidad} onChange={handleInputChange} required min="1" />
                </div>
              </div>
              <div className="form-buttons">
                <button type="submit" className={`btn ${isEditing ? 'btn-update' : 'btn-create'}`} disabled={loading}>
                  {loading ? '⏳' : isEditing ? '✏️ Actualizar' : '➕ Crear'}
                </button>
                {isEditing && <button type="button" className="btn btn-cancel" onClick={clearForm}>❌ Cancelar</button>}
              </div>
            </form>
          </div>
        </div>
      </section>

      <section className="list-section">
        <div className="container">
          <div className="list-header">
            <h2>Lista de Detalles</h2>
            <span className="client-count">{detalles.length} registro{detalles.length !== 1 ? 's' : ''}</span>
          </div>
          {loading && <div className="loading"><div className="spinner"></div><p>Cargando...</p></div>}
          <div className="clients-table-container">
            {!loading && detalles.length === 0 ? (
              <div className="no-clients">
                <div className="no-clients-icon">📝</div>
                <h3>No hay detalles de pedidos</h3>
                <p>Agrega el primer detalle usando el formulario</p>
              </div>
            ) : (
              <div className="clients-table-card">
                <table className="clients-table">
                  <thead>
                    <tr>
                      <th>ID Detalle</th>
                      <th>ID Pedido</th>
                      <th>Cliente</th>
                      <th>Producto</th>
                      <th>Cantidad</th>
                      <th>Subtotal</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detalles.map(d => (
                      <tr key={d.id}>
                        <td><span className="id-badge">{d.id}</span></td>
                        <td>{d.pedido_id}</td>
                        <td>{d.pedido.cliente_nombre}</td>
                        <td className="client-name">{d.producto.nombre}</td>
                        <td>{d.cantidad}</td>
                        <td>${d.subtotal.toFixed(2)}</td>
                        <td>
                          <div className="actions-container">
                            <button className="btn-action btn-edit" title="Editar detalle" onClick={() => editDetalle(d)}>✏️</button>
                            <button className="btn-action btn-delete" title="Eliminar detalle" onClick={() => deleteDetalle(d.id)}>🗑️</button>
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

export default DetallePedidos;