import React, { useState, useEffect } from 'react';
import { useProducts } from '../../context/ProductContext';
import './Dashboard.css';

const Dashboard = () => {
  const { products } = useProducts();
  const [orders, setOrders] = useState([]);
  
  // Date range state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dateRangeLabel, setDateRangeLabel] = useState('Hôm nay');

  // Load orders từ localStorage
  useEffect(() => {
    document.title = 'Dashboard - Thống Kê';
    
    const savedOrders = localStorage.getItem('ecommerce_orders');
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    }
  }, []);

  // Set default date range (hôm nay)
  useEffect(() => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    setStartDate(todayStr);
    setEndDate(todayStr);
  }, []);

  // Lọc đơn hàng theo khoảng ngày
  const getFilteredOrders = () => {
    if (!startDate || !endDate) return orders;

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    return orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= start && orderDate <= end;
    });
  };

  const filteredOrders = getFilteredOrders();

  // Tính doanh thu
  const calculateRevenue = (ordersList) => {
    return ordersList
      .filter(o => o.status === 'completed' || o.status === 'paid')
      .reduce((sum, o) => sum + o.pricing.total, 0);
  };

  const totalRevenue = calculateRevenue(filteredOrders);

  // Số khách hàng unique
  const totalCustomers = new Set(
    filteredOrders
      .filter(o => o.customer.phone)
      .map(o => o.customer.phone)
  ).size;

  // Số sản phẩm đã bán
  const totalProductsSold = filteredOrders
    .filter(o => o.status === 'completed' || o.status === 'paid')
    .reduce((sum, order) => {
      return sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
    }, 0);

  // Giá trị trung bình đơn hàng
  const avgOrderValue = filteredOrders.length > 0 
    ? totalRevenue / filteredOrders.length 
    : 0;

  // Doanh thu 7 ngày gần nhất
  const getLast7DaysRevenue = () => {
    const days = [];
    const baseDate = endDate ? new Date(endDate) : new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(baseDate);
      date.setDate(date.getDate() - i);
      const dateStart = new Date(date);
      dateStart.setHours(0, 0, 0, 0);
      const dateEnd = new Date(date);
      dateEnd.setHours(23, 59, 59, 999);
      
      const dayOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= dateStart && orderDate <= dateEnd;
      });
      
      days.push({
        date: date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
        fullDate: date.toLocaleDateString('vi-VN'),
        revenue: calculateRevenue(dayOrders),
        orders: dayOrders.length
      });
    }
    return days;
  };

  const last7Days = getLast7DaysRevenue();
  const maxRevenue = Math.max(...last7Days.map(d => d.revenue), 1);

  // Top 5 sản phẩm bán chạy
  const getTopProducts = () => {
    const productStats = {};
    
    filteredOrders.forEach(order => {
      if (order.status === 'completed' || order.status === 'paid') {
        order.items.forEach(item => {
          if (!productStats[item.productId]) {
            productStats[item.productId] = {
              id: item.productId,
              name: item.name,
              quantity: 0,
              revenue: 0
            };
          }
          productStats[item.productId].quantity += item.quantity;
          productStats[item.productId].revenue += item.subtotal;
        });
      }
    });

    return Object.values(productStats)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  };

  const topProducts = getTopProducts();

  // Quick select date ranges
  const setQuickDateRange = (range) => {
    const today = new Date();
    let start, end;

    switch(range) {
      case 'today':
        start = end = today;
        setDateRangeLabel('Hôm nay');
        break;
      case 'yesterday':
        start = end = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        setDateRangeLabel('Hôm qua');
        break;
      case 'week':
        start = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        end = today;
        setDateRangeLabel('7 ngày qua');
        break;
      case 'month':
        start = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        end = today;
        setDateRangeLabel('30 ngày qua');
        break;
      case 'thisMonth':
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = today;
        setDateRangeLabel('Tháng này');
        break;
      default:
        return;
    }

    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  const handleDateChange = () => {
    setDateRangeLabel('Tùy chỉnh');
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1> Tổng Quan Dashboard</h1>
          <p className="dashboard-subtitle">
          
          </p>
        </div>
        <div className="current-date">
          <span>{new Date().toLocaleDateString('vi-VN', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</span>
        </div>
      </div>

      {/* Date Range Selector */}
      <div className="date-range-selector">
        <div className="date-range-header">
          <h3> Chọn khoảng thời gian</h3>
          <span className="current-range">{dateRangeLabel}</span>
        </div>

        <div className="date-range-controls">
          <div className="quick-select-buttons">
            <button className="quick-btn" onClick={() => setQuickDateRange('today')}>
              Hôm nay
            </button>
            <button className="quick-btn" onClick={() => setQuickDateRange('yesterday')}>
              Hôm qua
            </button>
            <button className="quick-btn" onClick={() => setQuickDateRange('week')}>
              7 ngày qua
            </button>
            <button className="quick-btn" onClick={() => setQuickDateRange('month')}>
              30 ngày qua
            </button>
            <button className="quick-btn" onClick={() => setQuickDateRange('thisMonth')}>
              Tháng này
            </button>
          </div>

          <div className="custom-date-inputs">
            <div className="date-input-group">
              <label>Từ ngày:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  handleDateChange();
                }}
                max={endDate}
              />
            </div>
            <span className="date-separator">→</span>
            <div className="date-input-group">
              <label>Đến ngày:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  handleDateChange();
                }}
                min={startDate}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="quick-stats">
        <div className="stat-card revenue-card">
          <div className="stat-icon-wrapper">
          </div>
          <div className="stat-content">
            <span className="stat-label">Doanh thu</span>
            <span className="stat-value">{totalRevenue.toLocaleString('vi-VN')} ₫</span>
            <span className="stat-description">
              Từ {filteredOrders.length} đơn hàng
            </span>
          </div>
        </div>

        <div className="stat-card orders-card">
          <div className="stat-icon-wrapper">
          </div>
          <div className="stat-content">
            <span className="stat-label">Số đơn hàng</span>
            <span className="stat-value">{filteredOrders.length}</span>
            <span className="stat-description">
              {filteredOrders.filter(o => o.status === 'completed').length} hoàn thành
            </span>
          </div>
        </div>

        <div className="stat-card customers-card">
          <div className="stat-icon-wrapper">
          </div>
          <div className="stat-content">
            <span className="stat-label">Khách hàng</span>
            <span className="stat-value">{totalCustomers}</span>
            <span className="stat-description">Đã mua hàng</span>
          </div>
        </div>

        <div className="stat-card products-card">
          <div className="stat-icon-wrapper">
          </div>
          <div className="stat-content">
            <span className="stat-label">Sản phẩm đã bán</span>
            <span className="stat-value">{totalProductsSold}</span>
            <span className="stat-description">Tổng số lượng</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">
        {/* Biểu đồ doanh thu */}
        <div className="dashboard-card chart-card">
          <div className="card-header">
            <div>
              <h3>📈 Doanh thu 7 ngày gần nhất</h3>
              <p className="card-subtitle">
                Tính từ {endDate ? new Date(endDate).toLocaleDateString('vi-VN') : 'hôm nay'} trở về trước
              </p>
            </div>
          </div>
          
          <div className="revenue-chart">
            {last7Days.map((day, index) => (
              <div key={index} className="chart-column">
                <div className="chart-bar-wrapper">
                  <div 
                    className="chart-bar"
                    style={{ height: `${(day.revenue / maxRevenue) * 100}%` }}
                  >
                    <div className="bar-tooltip">
                      <strong>{day.fullDate}</strong>
                      <span>{day.revenue.toLocaleString('vi-VN')} ₫</span>
                      <span>{day.orders} đơn hàng</span>
                    </div>
                  </div>
                  <div className="bar-value">
                    {day.revenue > 0 ? `${(day.revenue / 1000).toFixed(0)}K` : '0'}
                  </div>
                </div>
                <div className="chart-label">{day.date}</div>
                <div className="chart-orders">{day.orders} đơn</div>
              </div>
            ))}
          </div>
        </div>

        {/* Top 5 sản phẩm bán chạy */}
        <div className="dashboard-card top-products-card">
          <div className="card-header">
            <div>
              <h3>🏆 Top 5 Sản Phẩm Bán Chạy</h3>
              <p className="card-subtitle">
                Trong khoảng: {startDate && endDate 
                  ? `${new Date(startDate).toLocaleDateString('vi-VN')} - ${new Date(endDate).toLocaleDateString('vi-VN')}`
                  : 'Hôm nay'
                }
              </p>
            </div>
          </div>

          <div className="top-products-list">
            {topProducts.length === 0 ? (
              <div className="empty-state">
                <p>Không có sản phẩm nào được bán</p>
                <span>Trong khoảng thời gian đã chọn</span>
              </div>
            ) : (
              topProducts.map((product, index) => (
                <div key={product.id} className="product-item">
                  <div className="product-rank">
                    <span className={`rank-badge rank-${index + 1}`}>
                      {index + 1}
                    </span>
                  </div>
                  
                  <div className="product-info">
                    <h4 className="product-name">{product.name}</h4>
                    <div className="product-stats">
                      <div className="stat-item">
                        <span className="stat-icon-small">📊</span>
                        <span>Đã bán: <strong>{product.quantity}</strong></span>
                      </div>
                      <div className="stat-item">
                        <span>Doanh thu: <strong>{product.revenue.toLocaleString('vi-VN')} ₫</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="product-progress">
                    <div 
                      className="progress-bar"
                      style={{ 
                        width: `${(product.quantity / topProducts[0].quantity) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Summary Footer */}
      <div className="dashboard-summary">
        <div className="summary-card">
          <span className="summary-label"> Giá trị TB/Đơn:</span>
          <span className="summary-value">{avgOrderValue.toLocaleString('vi-VN')} ₫</span>
        </div>
        <div className="summary-card">
          <span className="summary-label"> Tỷ lệ hoàn thành:</span>
          <span className="summary-value">
            {filteredOrders.length > 0 
              ? ((filteredOrders.filter(o => o.status === 'completed').length / filteredOrders.length) * 100).toFixed(1)
              : 0}%
          </span>
        </div>
        <div className="summary-card">
          <span className="summary-label"> Tổng sản phẩm:</span>
          <span className="summary-value">{products.length}</span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;