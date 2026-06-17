import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';

const LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/log', label: 'Log activity' },
  { to: '/history', label: 'History' },
  { to: '/insights', label: 'Insights' },
  { to: '/goals', label: 'Goals' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const linkClass = ({ isActive }) =>
    `rounded-card px-3 py-2 text-sm font-medium transition-colors ${
      isActive ? 'bg-primary text-white' : 'text-ink/80 hover:bg-primary/10'
    }`;

  return (
    <header className="border-b border-line bg-white">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3" aria-label="Main">
        <NavLink to={user ? '/dashboard' : '/'} className="font-display text-lg font-bold text-primary-dark">
          Carbon Budget
        </NavLink>

        {user && (
          <>
            <button
              type="button"
              className="rounded-card border border-line p-2 md:hidden"
              aria-expanded={open}
              aria-controls="primary-nav-links"
              aria-label={open ? 'Close menu' : 'Open menu'}
              onClick={() => setOpen((o) => !o)}
            >
              <span aria-hidden="true">{open ? '✕' : '☰'}</span>
            </button>

            <div
              id="primary-nav-links"
              className={`${open ? 'flex' : 'hidden'} absolute left-0 top-[57px] w-full flex-col gap-1 border-b border-line bg-white p-3 md:static md:flex md:w-auto md:flex-row md:items-center md:gap-2 md:border-none md:p-0`}
            >
              {LINKS.map((link) => (
                <NavLink key={link.to} to={link.to} className={linkClass} onClick={() => setOpen(false)}>
                  {link.label}
                </NavLink>
              ))}
              <Button variant="ghost" onClick={handleLogout} className="md:ml-2">
                Log out
              </Button>
            </div>
          </>
        )}
      </nav>
    </header>
  );
}
