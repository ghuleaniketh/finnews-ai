import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Search,
  Plus,
  Trash2,
  X,
  LayoutDashboard,
  Building2,
} from 'lucide-react';
import AddCompanyForm from './AddCompanyForm';

/**
 * WatchlistSidebar: sidebar navigation listing tracked companies/topics,
 * quick search filter, delete actions, and company onboarding form.
 */
export default function WatchlistSidebar({
  watchlist = [],
  selectedId,
  onDeleteCompany,
  onAddCompany,
  isOpen = false,
  onClose,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const navigate = useNavigate();

  const filteredWatchlist = watchlist.filter((item) => {
    const term = searchTerm.toLowerCase();
    return (
      item.name.toLowerCase().includes(term) ||
      (item.ticker && item.ticker.toLowerCase().includes(term))
    );
  });

  const handleDelete = (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm(`Remove ${item.name} from watchlist?`)) {
      onDeleteCompany(item.id);
      if (String(selectedId) === String(item.id)) {
        navigate('/');
      }
    }
  };

  return (
    <aside className={`sidebar-container ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-title-row">
          <Building2 size={16} style={{ color: 'var(--accent-primary)' }} />
          <span className="sidebar-title">Watchlist</span>
          <span className="sidebar-count-badge">{watchlist.length}</span>
        </div>
        {onClose && (
          <button
            type="button"
            className="mobile-menu-btn"
            style={{ display: isOpen ? 'block' : 'none' }}
            onClick={onClose}
            aria-label="Close menu"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div className="sidebar-content">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `watchlist-nav-item ${isActive ? 'active' : ''}`
          }
          onClick={onClose}
          end
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LayoutDashboard size={15} style={{ color: 'var(--accent-cyan)' }} />
            <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>Dashboard Overview</span>
          </div>
        </NavLink>

        <div className="sidebar-search-box">
          <Search size={14} className="sidebar-search-icon" />
          <input
            type="text"
            className="sidebar-search-input"
            placeholder="Search companies or tickers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="watchlist-nav-list">
          {filteredWatchlist.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', padding: '12px 8px', textAlign: 'center' }}>
              {searchTerm ? 'No matching companies' : 'Watchlist is empty'}
            </div>
          ) : (
            filteredWatchlist.map((item) => (
              <NavLink
                key={item.id}
                to={`/company/${item.id}`}
                className={({ isActive }) =>
                  `watchlist-nav-item ${isActive ? 'active' : ''}`
                }
                onClick={onClose}
              >
                <div className="watchlist-item-info">
                  <span className="watchlist-item-name">{item.name}</span>
                  {item.ticker && (
                    <span className="watchlist-item-ticker">{item.ticker}</span>
                  )}
                </div>
                <button
                  type="button"
                  className="watchlist-item-delete"
                  onClick={(e) => handleDelete(e, item)}
                  title={`Remove ${item.name}`}
                  aria-label={`Remove ${item.name}`}
                >
                  <Trash2 size={13} />
                </button>
              </NavLink>
            ))
          )}
        </div>
      </div>

      <div className="sidebar-footer">
        {showAddForm ? (
          <AddCompanyForm
            onAdd={onAddCompany}
            onCancel={() => setShowAddForm(false)}
          />
        ) : (
          <button
            type="button"
            className="add-company-toggle-btn"
            onClick={() => setShowAddForm(true)}
          >
            <Plus size={15} />
            <span>Add Company / Topic</span>
          </button>
        )}
      </div>
    </aside>
  );
}
