import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  Trash2,
  LayoutDashboard,
  Building2,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

/**
 * WatchlistContent: Shared list and search interface used in both desktop sidebar
 * and mobile Sheet navigation drawer.
 */
export function WatchlistContent({
  watchlist = [],
  onDeleteCompany,
  onItemClick,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

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
    if (window.confirm(`Remove "${item.name}" from your watchlist?`)) {
      onDeleteCompany(item.id);
      if (location.pathname === `/company/${item.id}`) {
        navigate('/');
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-white select-none">
      {/* Sidebar Header */}
      <div className="px-4 py-3.5 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-blue-700" />
          <span className="font-semibold text-xs tracking-wider uppercase text-slate-700">Watchlist</span>
        </div>
        <Badge variant="secondary" className="font-mono text-xs font-semibold px-2 py-0 text-slate-700 bg-slate-100">
          {watchlist.length}
        </Badge>
      </div>

      {/* Navigation Top Links & Search */}
      <div className="p-3 space-y-2 border-b border-border/60">
        <NavLink
          to="/"
          end
          onClick={onItemClick}
          className={({ isActive }) =>
            `flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors min-h-[40px] ${
              isActive
                ? 'bg-blue-50 text-blue-800 font-semibold border border-blue-200'
                : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
            }`
          }
        >
          <LayoutDashboard className="h-4 w-4 text-slate-500 shrink-0" />
          <span>Dashboard Overview</span>
        </NavLink>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          <Input
            type="text"
            placeholder="Search companies or tickers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 h-9 text-xs bg-slate-50 border-slate-200 focus-visible:bg-white"
          />
        </div>
      </div>

      {/* Watchlist Item Navigation */}
      <ScrollArea className="flex-1 px-3 py-2">
        <div className="space-y-1">
          {filteredWatchlist.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              {searchTerm ? 'No matching entities found' : 'Your watchlist is empty'}
            </div>
          ) : (
            filteredWatchlist.map((item) => (
              <NavLink
                key={item.id}
                to={`/company/${item.id}`}
                onClick={onItemClick}
                className={({ isActive }) =>
                  `group flex items-center justify-between px-3 py-2 rounded-md transition-colors min-h-[40px] ${
                    isActive
                      ? 'bg-blue-50 text-blue-900 border border-blue-200 font-medium'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                <div className="flex flex-col min-w-0 pr-2">
                  <span className="text-sm truncate leading-snug">{item.name}</span>
                  {item.ticker && (
                    <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wide">
                      {item.ticker}
                    </span>
                  )}
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 min-h-[40px] min-w-[40px] text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded shrink-0 opacity-80 group-hover:opacity-100 flex items-center justify-center"
                  onClick={(e) => handleDelete(e, item)}
                  title={`Remove ${item.name} from watchlist`}
                  aria-label={`Remove ${item.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </NavLink>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

/**
 * WatchlistSidebar: Desktop permanent left sidebar.
 */
export default function WatchlistSidebar({ watchlist = [], onDeleteCompany }) {
  return (
    <aside className="hidden lg:flex w-72 xl:w-80 border-r border-border bg-white flex-col h-[calc(100vh-57px)] sticky top-[57px] shrink-0 z-20">
      <WatchlistContent
        watchlist={watchlist}
        onDeleteCompany={onDeleteCompany}
      />
    </aside>
  );
}
