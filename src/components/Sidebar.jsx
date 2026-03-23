import { useState } from 'react';

export default function Sidebar({ children }) {
  const [open, setOpen] = useState(false);
  const toggle = () => setOpen(o => !o);

  return (
    <>
      <button className="hamburger-btn" onClick={toggle} title="Menu">☰</button>

      <div className={`sidebar-overlay${open ? ' open' : ''}`} onClick={toggle} />
      <div className={`sidebar-nav${open ? ' open' : ''}`}>
        <div className="sidebar-header">
          <h3>Menu</h3>
          <button className="close-sidebar-btn" onClick={toggle}>&times;</button>
        </div>
        <div className="sidebar-content">
          {typeof children === 'function' ? children(toggle) : children}
        </div>
      </div>
    </>
  );
}

export function SidebarBtn({ children, onClick, style, id }) {
  return (
    <button id={id} className="sidebar-btn" onClick={onClick} style={style}>
      {children}
    </button>
  );
}
