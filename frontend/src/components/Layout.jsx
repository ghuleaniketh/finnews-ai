import React, { useState, useEffect, createContext, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from './Icon';
import WatchlistSidebar, { WatchlistContent } from './WatchlistSidebar';
import AddCompanyForm from './AddCompanyForm';
import { getHealth } from '../api/endpoints';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Toaster } from '@/components/ui/sonner';

// Shared Context to allow any child (e.g. Dashboard empty state) to trigger the Add Company Dialog
export const AddCompanyContext = createContext({
  openAddDialog: () => {},
});

export const useAddCompany = () => useContext(AddCompanyContext);

/**
 * Layout: Warm cream minimal formal application shell.
 * - Sticky top header with brand, connection status badge, mobile menu, and primary Add Company button.
 * - Desktop static left sidebar and mobile left Sheet.
 * - Add Company Dialog reusable across header and dashboard empty states.
 */
export default function Layout({
  children,
  watchlist = [],
  onDeleteCompany,
  onAddCompany,
}) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [healthStatus, setHealthStatus] = useState('checking');
  const location = useLocation();

  const isMock = import.meta.env.VITE_USE_MOCK === 'true';

  useEffect(() => {
    let mounted = true;
    async function checkBackend() {
      try {
        const res = await getHealth();
        if (mounted && (res?.status === 'ok' || res?.mock)) {
          setHealthStatus('connected');
        } else if (mounted) {
          setHealthStatus('online');
        }
      } catch (err) {
        if (mounted) {
          setHealthStatus('disconnected');
        }
      }
    }
    checkBackend();
    return () => {
      mounted = false;
    };
  }, []);

  // Close mobile drawer on route transition
  useEffect(() => {
    setSheetOpen(false);
  }, [location.pathname]);

  const openAddDialog = () => setDialogOpen(true);

  return (
    <AddCompanyContext.Provider value={{ openAddDialog }}>
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        {/* Sticky Top Header */}
        <header className="sticky top-0 z-40 w-full border-b border-border bg-card shadow-2xs">
          <div className="flex h-14 items-center justify-between px-3 sm:px-6 max-w-7xl mx-auto w-full gap-2">
            {/* Left: Mobile Menu Trigger + Brand */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden h-10 w-10 shrink-0 text-foreground hover:bg-muted"
                onClick={() => setSheetOpen(true)}
                aria-label="Open navigation menu"
              >
                <Icon name="menu" size={20} />
              </Button>

              <Link
                to="/"
                className="flex items-center gap-2 text-foreground hover:opacity-90 transition-opacity"
              >
                <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground shrink-0 shadow-xs">
                  <Icon name="trending_up" size={18} />
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-bold text-base tracking-tight text-foreground">FinNews</span>
                  <span className="font-semibold text-xs tracking-wider text-foreground uppercase bg-accent border border-border px-1.5 py-0.2 rounded">
                    AI
                  </span>
                </div>
              </Link>
            </div>

            {/* Right: Connection Status & Primary Add Company Button */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Connection Status Badge */}
              {isMock ? (
                <Badge
                  variant="outline"
                  className="bg-[#EFE6D2] text-[#6B5B45] border-[#DFD3B9] px-2 py-0.5 text-xs font-medium flex items-center gap-1.5"
                  title="Operating in mock mode with sample financial dataset"
                >
                  <Icon name="analytics" size={13} className="shrink-0" />
                  <span className="hidden sm:inline">Mock Mode</span>
                  <span className="sm:hidden">Mock</span>
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="bg-[#E4EFDF] text-[#3F6B35] border-[#C9DEC2] px-2 py-0.5 text-xs font-medium flex items-center gap-1.5"
                  title={`Live API connected (${healthStatus})`}
                >
                  <span
                    className={`h-2 w-2 rounded-full shrink-0 ${
                      healthStatus === 'connected' || healthStatus === 'online'
                        ? 'bg-[#3F6B35]'
                        : 'bg-[#9B3B2E]'
                    }`}
                  />
                  <span className="hidden sm:inline">Live API</span>
                  <span className="sm:hidden">Live</span>
                </Badge>
              )}

              {/* Primary Add Company Button: always visible on every screen size */}
              <Button
                onClick={openAddDialog}
                className="h-10 min-h-[40px] px-3 sm:px-4 bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-xs transition-colors"
                aria-label="Add company to watchlist"
              >
                <Icon name="add" size={16} className="mr-1 sm:mr-1.5 shrink-0" />
                <span className="hidden sm:inline text-sm">Add Company</span>
                <span className="sm:hidden text-xs">Add</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Body Shell with Sidebar + Main content */}
        <div className="flex-1 flex w-full max-w-7xl mx-auto">
          {/* Desktop Sidebar */}
          <WatchlistSidebar
            watchlist={watchlist}
            onDeleteCompany={onDeleteCompany}
          />

          {/* Mobile Navigation Sheet */}
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetContent side="left" className="p-0 w-80 max-w-[85vw] border-r border-border bg-card">
              <SheetHeader className="sr-only">
                <SheetTitle>Navigation Menu</SheetTitle>
              </SheetHeader>
              <WatchlistContent
                watchlist={watchlist}
                onDeleteCompany={onDeleteCompany}
                onItemClick={() => setSheetOpen(false)}
              />
            </SheetContent>
          </Sheet>

          {/* Main View Area */}
          <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>

        {/* Global Add Company Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-[425px] w-[92vw] max-w-md p-6 bg-card border border-border shadow-lg rounded-lg">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold tracking-tight text-foreground">
                Add Company or Topic
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Track financial news, monitor sentiment trajectory, and accumulate institutional memory.
              </DialogDescription>
            </DialogHeader>
            <AddCompanyForm
              onAdd={onAddCompany}
              onSuccess={() => setDialogOpen(false)}
              onCancel={() => setDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>

        <Toaster />
      </div>
    </AddCompanyContext.Provider>
  );
}
