import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/common';

function MainLayout() {
  return (
    <>
      <Navbar variant="default" />
      <main>
        <Outlet />
      </main>
    </>
  );
}

export default MainLayout;
