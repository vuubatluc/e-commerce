import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/common';

function ProfileLayout() {
  // Kiểm tra role từ localStorage
  const roles = JSON.parse(localStorage.getItem('roles') || '[]');
  const isAdmin = roles.includes('ADMIN');

  return (
    <>
      <Navbar variant={isAdmin ? 'dashboard' : 'default'} />
      <main>
        <Outlet />
      </main>
    </>
  );
}

export default ProfileLayout;
