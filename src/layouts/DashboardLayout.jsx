import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/common';

function DashboardLayout() {
  return (
    <>
      <Navbar variant="dashboard" />
      <main>
        <Outlet />
      </main>
    </>
  );
}

export default DashboardLayout;
