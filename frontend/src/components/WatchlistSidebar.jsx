import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import Icon from './Icon';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

/**
 * WatchlistContent: Shared list and search interface used in both desktop sidebar
 * and mobile Sheet navigation drawer.
 * Warm cream palette: active item is tan (#E8DCC2) with ring/tan border (#B89B6A).
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
    <div className="flex flex-col h-full bg-card select-none">
      {/* Sidebar Header */}
      <div className="px-4 py-3.5 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon name="apartment" size={16} className="text-foreground" />
          <span className="font-semibold text-xs tracking-wider uppercase text-foreground">Watchlist</span>
        </div>
        <Badge variant="secondary" className="font-mono text-xs font-semibold px-2 py-0 text-foreground bg-muted border border-border">
          {watchlist.length}
        </Badge>
      </div>

      {/* Navigation Top Links & Search */}
      <div className="p-3 space-y-2 border-b border-border">
        <NavLink
          to="/"
          end
          onClick={onItemClick}
          className={({ isActive }) =>
            `flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors min-h-[40px] ${
              isActive
                ? 'bg-accent text-accent-foreground font-semibold border border-border'
                : 'text-foreground/80 hover:bg-muted hover:text-foreground'
            }`
          }
        >
          <Icon name="dashboard" size={16} className="text-muted-foreground shrink-0" />
          <span>Dashboard Overview</span>
        </NavLink>

        <div className="relative">
          <Icon name="search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder="Search companies or tickers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 h-9 text-xs bg-muted border-border focus-visible:bg-card"
          />
        </div>
      </div>

      {/* Watchlist Item Navigation */}
      <ScrollArea className="flex-1 px-3 py-2">
        <div className="space-y-1">
          {filteredWatchlist.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
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
                      ? 'bg-accent text-accent-foreground border-l-2 border-[#B89B6A] font-medium'
                      : 'text-foreground/80 hover:bg-muted hover:text-foreground'
                  }`
                }
              >
                <div className="flex flex-col min-w-0 pr-2">
                  <span className="text-sm truncate leading-snug">{item.name}</span>
                  {item.ticker && (
                    <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wide">
                      {item.ticker}
                    </span>
                  )}
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 min-h-[40px] min-w-[40px] text-muted-foreground hover:text-[#9B3B2E] hover:bg-[#F5E0DB] rounded shrink-0 opacity-80 group-hover:opacity-100 flex items-center justify-center"
                  onClick={(e) => handleDelete(e, item)}
                  title={`Remove ${item.name} from watchlist`}
                  aria-label={`Remove ${item.name}`}
                >
                  <Icon name="delete" size={16} />
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
    <aside className="hidden lg:flex w-72 xl:w-80 border-r border-border bg-card flex-col h-[calc(100vh-57px)] sticky top-[57px] shrink-0 z-20">
      <WatchlistContent
        watchlist={watchlist}
        onDeleteCompany={onDeleteCompany}
      />
    </aside>
  );
}
