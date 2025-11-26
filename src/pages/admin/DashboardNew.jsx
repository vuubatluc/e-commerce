import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../../services/api';
import './DashboardNew.css';

const DashboardNew = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Date range state
  const [dateRange, setDateRange] = useState({
    summary: { from: '', to: '' },
    dailyRevenue: { from: '', to: '' },
    topProducts: { from: '', to: '' }
  });
  
  // Dashboard data
  const [summary, setSummary] = useState({
    revenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProductsSold: 0
  });
  const [dailyRevenue, setDailyRevenue] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

  // Initialize date ranges
  useEffect(() => {
    document.title = 'Dashboard - Tổng Quan';
    
    // Get today's date in local timezone
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;
    
    console.log('Current date:', todayStr, '- Raw date:', today);
    
    // Summary: Last 30 days
    const summary30DaysAgo = new Date(today);
    summary30DaysAgo.setDate(summary30DaysAgo.getDate() - 29);
    const summaryFromStr = `${summary30DaysAgo.getFullYear()}-${String(summary30DaysAgo.getMonth() + 1).padStart(2, '0')}-${String(summary30DaysAgo.getDate()).padStart(2, '0')}`;
    
    // Daily Revenue: Last 7 days
    const daily7DaysAgo = new Date(today);
    daily7DaysAgo.setDate(daily7DaysAgo.getDate() - 6);
    const dailyFromStr = `${daily7DaysAgo.getFullYear()}-${String(daily7DaysAgo.getMonth() + 1).padStart(2, '0')}-${String(daily7DaysAgo.getDate()).padStart(2, '0')}`;
    
    // Top Products: Last 30 days
    const top30DaysAgo = new Date(today);
    top30DaysAgo.setDate(top30DaysAgo.getDate() - 29);
    const topFromStr = `${top30DaysAgo.getFullYear()}-${String(top30DaysAgo.getMonth() + 1).padStart(2, '0')}-${String(top30DaysAgo.getDate()).padStart(2, '0')}`;
    
    setDateRange({
      summary: {
        from: summaryFromStr,
        to: todayStr
      },
      dailyRevenue: {
        from: dailyFromStr,
        to: todayStr
      },
      topProducts: {
        from: topFromStr,
        to: todayStr
      }
    });
  }, []);

  // Load all dashboard data
  useEffect(() => {
    if (dateRange.summary.from && dateRange.summary.to) {
      loadAllData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange.summary.from, dateRange.summary.to, dateRange.dailyRevenue.from, dateRange.dailyRevenue.to, dateRange.topProducts.from, dateRange.topProducts.to]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      setError('');

      console.log('=== LOADING DASHBOARD DATA ===');
      console.log('Date ranges:', {
        summary: `${dateRange.summary.from} to ${dateRange.summary.to}`,
        dailyRevenue: `${dateRange.dailyRevenue.from} to ${dateRange.dailyRevenue.to}`,
        topProducts: `${dateRange.topProducts.from} to ${dateRange.topProducts.to}`
      });

      const [summaryRes, dailyRevenueRes, topProductsRes] = await Promise.all([
        dashboardAPI.getSummary(dateRange.summary.from, dateRange.summary.to),
        dashboardAPI.getDailyRevenue(dateRange.dailyRevenue.from, dateRange.dailyRevenue.to),
        dashboardAPI.getTopProducts(dateRange.topProducts.from, dateRange.topProducts.to, 10)
      ]);

      console.log('=== API RESPONSES ===');
      console.log('Summary:', summaryRes);
      console.log('Daily Revenue:', dailyRevenueRes);
      console.log('Top Products:', topProductsRes);

      if (summaryRes.code === 1000) {
        console.log('✓ Summary data loaded:', summaryRes.result);
        setSummary(summaryRes.result);
      } else {
        console.error('✗ Summary API failed:', summaryRes.message);
      }

      if (dailyRevenueRes.code === 1000) {
        console.log(`✓ Daily revenue loaded: ${dailyRevenueRes.result?.length || 0} days`);
        setDailyRevenue(dailyRevenueRes.result || []);
      } else {
        console.error('✗ Daily revenue API failed:', dailyRevenueRes.message);
      }

      if (topProductsRes.code === 1000) {
        console.log(`✓ Top products loaded: ${topProductsRes.result?.length || 0} products`);
        setTopProducts(topProductsRes.result || []);
      } else {
        console.error('✗ Top products API failed:', topProductsRes.message);
      }
    } catch (err) {
      console.error('=== ERROR LOADING DASHBOARD ===');
      console.error('Error details:', err);
      console.error('Error message:', err.message);
      console.error('Error stack:', err.stack);
      setError(`Không thể tải dữ liệu dashboard: ${err.message}`);
    } finally {
      console.log('=== LOADING COMPLETE ===');
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    // Backend returns format "dd-MM" (e.g., "26-11")
    // Just return it as-is since it's already formatted
    return dateString;
  };

  const handleDateRangeChange = (type, field, value) => {
    setDateRange(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value
      }
    }));
  };

  if (loading) {
    return (
      <div className="dashboard-new">
        <div className="loading">
          <div className="spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-new">
      <div className="dashboard-header">
        <h1>Dashboard - Tổng Quan</h1>
        <p className="dashboard-subtitle">Thống kê và phân tích dữ liệu kinh doanh</p>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
          <button onClick={() => setError('')} className="alert-close">✕</button>
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          {error}
          <button onClick={() => setError('')} className="alert-close">✕</button>
        </div>
      )}

      {/* Summary Cards Section */}
      <section className="summary-section">
        <div className="section-header">
          <h2>Tổng Quan</h2>
          <div className="date-range-picker">
            <input
              type="date"
              value={dateRange.summary.from}
              onChange={(e) => handleDateRangeChange('summary', 'from', e.target.value)}
              className="date-input"
              max={new Date().toISOString().split('T')[0]}
            />
            <span>đến</span>
            <input
              type="date"
              value={dateRange.summary.to}
              onChange={(e) => handleDateRangeChange('summary', 'to', e.target.value)}
              className="date-input"
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>

        <div className="summary-cards">
          <div className="summary-card revenue-card">
            <div className="card-icon"></div>
            <div className="card-content">
              <h3>Doanh Thu</h3>
              <p className="card-value">{formatCurrency(summary.revenue)}</p>
              <span className="card-label">Tổng doanh thu</span>
            </div>
          </div>

          <div className="summary-card orders-card">
            <div className="card-icon"></div>
            <div className="card-content">
              <h3>Đơn Hàng</h3>
              <p className="card-value">{summary.totalOrders}</p>
              <span className="card-label">Tổng đơn hàng</span>
            </div>
          </div>

          <div className="summary-card customers-card">
            <div className="card-icon"></div>
            <div className="card-content">
              <h3>Khách Hàng</h3>
              <p className="card-value">{summary.totalCustomers}</p>
              <span className="card-label">Số khách hàng</span>
            </div>
          </div>

          <div className="summary-card products-card">
            <div className="card-icon"></div>
            <div className="card-content">
              <h3>Sản Phẩm Đã Bán</h3>
              <p className="card-value">{summary.totalProductsSold}</p>
              <span className="card-label">Tổng số lượng</span>
            </div>
          </div>
        </div>
      </section>

      {/* Daily Revenue Chart Section */}
      <section className="chart-section">
        <div className="section-header">
          <h2>Doanh Thu Theo Ngày</h2>
          <div className="date-range-picker">
            <input
              type="date"
              value={dateRange.dailyRevenue.from}
              onChange={(e) => handleDateRangeChange('dailyRevenue', 'from', e.target.value)}
              className="date-input"
              max={new Date().toISOString().split('T')[0]}
            />
            <span>đến</span>
            <input
              type="date"
              value={dateRange.dailyRevenue.to}
              onChange={(e) => handleDateRangeChange('dailyRevenue', 'to', e.target.value)}
              className="date-input"
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>

        {dailyRevenue.length === 0 ? (
          <div className="no-data">
            <p>Không có dữ liệu doanh thu trong khoảng thời gian này</p>
          </div>
        ) : (
          <div className="revenue-chart">
            <div className="chart-bars">
              {dailyRevenue.map((item, index) => {
                const maxRevenue = Math.max(...dailyRevenue.map(d => d.revenue));
                const heightPercent = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
                
                return (
                  <div key={index} className="chart-bar-container">
                    <div className="chart-bar-wrapper">
                      <div
                        className="chart-bar"
                        style={{ height: `${heightPercent}%` }}
                        title={formatCurrency(item.revenue)}
                      >
                        <span className="bar-value">{formatCurrency(item.revenue)}</span>
                      </div>
                    </div>
                    <span className="bar-label">{formatDate(item.date)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* Top Products Section */}
      <section className="top-products-section">
        <div className="section-header">
          <h2>Top Sản Phẩm Bán Chạy</h2>
          <div className="date-range-picker">
            <input
              type="date"
              value={dateRange.topProducts.from}
              onChange={(e) => handleDateRangeChange('topProducts', 'from', e.target.value)}
              className="date-input"
              max={new Date().toISOString().split('T')[0]}
            />
            <span>đến</span>
            <input
              type="date"
              value={dateRange.topProducts.to}
              onChange={(e) => handleDateRangeChange('topProducts', 'to', e.target.value)}
              className="date-input"
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>

        {topProducts.length === 0 ? (
          <div className="no-data">
            <p>Không có dữ liệu sản phẩm trong khoảng thời gian này</p>
          </div>
        ) : (
          <div className="top-products-list">
            {topProducts.map((product, index) => (
              <div key={index} className="product-item">
                <div className="product-rank">#{index + 1}</div>
                <div className="product-image">
                  {product.productImage ? (
                    <img src={product.productImage} alt={product.productName} />
                  ) : (
                    <div className="no-image"></div>
                  )}
                </div>
                <div className="product-info">
                  <h4>{product.productName}</h4>
                  <span className="product-id">ID: {product.productId}</span>
                </div>
                <div className="product-stats">
                  <span className="quantity-sold">
                    <strong>{product.quantitySold}</strong> đã bán
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default DashboardNew;