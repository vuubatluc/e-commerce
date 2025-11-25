import React, { useState, useEffect } from 'react';
import AllOrders from './AllOrders';
import CreateOrder from './CreateOrder';
import EditOrder from './EditOrder';
import './OrdersManagement.css';

const OrdersManagement = () => {
  const [view, setView] = useState('list'); // 'list', 'create', 'edit'
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    document.title = 'Quản lý đơn hàng';
  }, []);

  const handleCreateSuccess = () => {
    setView('list');
  };

  const handleEdit = (order) => {
    setSelectedOrder(order);
    setView('edit');
  };

  const handleEditSuccess = () => {
    setView('list');
    setSelectedOrder(null);
  };

  return (
    <div className="orders-management">
      <div className="management-content">
        {view === 'list' && (
          <AllOrders 
            onAddNew={() => setView('create')}
            onEdit={handleEdit}
          />
        )}
        {view === 'create' && (
          <CreateOrder 
            onSuccess={handleCreateSuccess} 
            onCancel={() => setView('list')} 
          />
        )}
        {view === 'edit' && selectedOrder && (
          <EditOrder 
            order={selectedOrder}
            onSuccess={handleEditSuccess} 
            onCancel={() => {
              setView('list');
              setSelectedOrder(null);
            }} 
          />
        )}
      </div>
    </div>
  );
};

export default OrdersManagement;