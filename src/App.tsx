import { useState, useEffect } from 'react';
import { LoginPage } from './pages/LoginPage';
import type { AuthUser } from './pages/LoginPage';
import { DashboardPage, initialLatestRequests } from './pages/DashboardPage';
import type { TicketRequestItem } from './pages/DashboardPage';
import { CreateTicketPage } from './pages/CreateTicketPage';
import { MyTicketsPage } from './pages/MyTicketsPage';
import { TicketDetailPage } from './pages/TicketDetailPage';
import { MasterCategoryPage } from './pages/MasterCategoryPage';
import { ReportPage } from './pages/ReportPage';
import { helpdeskApi } from './services/api';

export type AppView = 'login' | 'dashboard' | 'create-ticket' | 'my-tickets' | 'ticket-detail' | 'master-category' | 'report';

function App() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('helpdesk_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.role === 'admin' && (parsed.name === 'Tri Wahyudi' || parsed.nik === '100000001')) {
          parsed.name = 'Raden Azhar';
          localStorage.setItem('helpdesk_user', JSON.stringify(parsed));
        }
        return parsed;
      } catch {
        return null;
      }
    }
    return null;
  });

  const [currentView, setCurrentView] = useState<AppView>(() => {
    const saved = localStorage.getItem('helpdesk_user');
    return saved ? 'dashboard' : 'login';
  });

  const [tickets, setTickets] = useState<TicketRequestItem[]>(initialLatestRequests);
  const [selectedTicket, setSelectedTicket] = useState<TicketRequestItem | null>(null);

  // Ambil tiket live dari backend Laravel (MySQL db_helpdesk)
  useEffect(() => {
    let isMounted = true;
    const fetchLiveTickets = async () => {
      try {
        const res = await helpdeskApi.getTickets({ limit: 100 });
        if (isMounted && res.success && Array.isArray(res.data) && res.data.length > 0) {
          setTickets(res.data);
        }
      } catch (err) {
        console.warn('Backend API belum terhubung, menggunakan data fallback lokal:', err);
      }
    };
    fetchLiveTickets();
    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  const handleLoginSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('helpdesk_user');
    setCurrentUser(null);
    setCurrentView('login');
  };

  const handleNavigate = (view: AppView) => {
    // Route guard: User biasa tidak diizinkan mengakses report & master-category
    if (currentUser?.role === 'user' && (view === 'report' || view === 'master-category')) {
      setCurrentView('dashboard');
      return;
    }
    setCurrentView(view);
  };

  const handleTicketCreated = async (newTicket: {
    subject: string;
    group: string;
    category: string;
    description: string;
    groupId?: number;
    categoryId?: number;
    dataform?: any;
  }) => {
    // 1. Refresh tiket terbaru dari Backend Laravel
    try {
      const res = await helpdeskApi.getTickets({ limit: 100 });
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setTickets(res.data);
        setCurrentView('dashboard');
        return;
      }
    } catch (e) {
      console.warn('API getTickets error setelah createTicket, fallback lokal:', e);
    }

    // 2. Fallback lokal jika backend tidak terjangkau
    const now = new Date();
    const dateFormatted = `${now.getDate()} ${now.toLocaleString('id-ID', { month: 'short' })} ${now.getFullYear()}, ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const createdItem: TicketRequestItem = {
      id: `REQ-${Date.now().toString().slice(-4)}`,
      no: 1,
      subject: newTicket.subject,
      description: newTicket.description,
      category: newTicket.group,
      subcategory: newTicket.category,
      submitted: dateFormatted,
      status: 'Open',
      handler: 'Awaiting IT Assignment',
      requester: currentUser?.name || 'Raden Azhar Fadhlur',
      nik: currentUser?.nik || '231270322',
      department: currentUser?.department || 'Information Technology',
    };

    setTickets((prev) => [
      createdItem,
      ...prev.map((t) => ({ ...t, no: t.no + 1 })),
    ]);
    setCurrentView('dashboard');
  };

  const handleSelectTicket = (ticket: TicketRequestItem) => {
    setSelectedTicket(ticket);
    setCurrentView('ticket-detail');
  };

  const handleUpdateTicket = async (
    ticketId: string,
    newStatus: 'Solved' | 'In progress' | 'Return' | 'Reject',
    responseMessage: string,
    handlerName?: string,
    responderRole?: 'IT Support' | 'User'
  ) => {
    // 1. Simpan respon ke Backend Laravel
    try {
      await helpdeskApi.addResponse(ticketId, {
        message: responseMessage,
        author_nik: currentUser?.nik || '231270322',
        status: newStatus,
        handler_nik: currentUser?.role === 'admin' ? currentUser.nik : undefined,
      });
      const res = await helpdeskApi.getTickets({ limit: 100 });
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setTickets(res.data);
      }
    } catch (e) {
      console.warn('API addResponse error, fallback lokal:', e);
    }

    // 2. Fallback state lokal
    const now = new Date();
    const dateFormatted = `${now.getDate()} ${now.toLocaleString('id-ID', { month: 'short' })} ${now.getFullYear()}, ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const role = responderRole || (currentUser?.role === 'admin' ? 'IT Support' : 'User');
    const author = handlerName || (currentUser?.name || 'Staff');

    const newResponse = {
      id: `resp-${Date.now()}`,
      responder: author,
      role: role,
      submitted: dateFormatted,
      status: role === 'User' ? undefined : newStatus,
      message: responseMessage,
    };

    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          return {
            ...t,
            status: role === 'User' ? t.status : newStatus,
            handler: role === 'User' ? t.handler : author,
            responses: [...(t.responses || []), newResponse],
          };
        }
        return t;
      })
    );

    setSelectedTicket((prev) => {
      if (!prev || prev.id !== ticketId) return prev;
      return {
        ...prev,
        status: role === 'User' ? prev.status : newStatus,
        handler: role === 'User' ? prev.handler : author,
        responses: [...(prev.responses || []), newResponse],
      };
    });
  };

  return (
    <div className="w-full min-h-screen">
      {currentView === 'login' && (
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      )}

      {currentView === 'dashboard' && (
        <DashboardPage
          currentUser={currentUser || undefined}
          tickets={tickets}
          onLogout={handleLogout}
          onCreateTicket={() => setCurrentView('create-ticket')}
          onViewAllTickets={() => setCurrentView('my-tickets')}
          onNavigateMasterCategory={() => handleNavigate('master-category')}
          onNavigate={handleNavigate}
          onSelectTicket={handleSelectTicket}
          onUpdateTicket={handleUpdateTicket}
        />
      )}

      {currentView === 'create-ticket' && (
        <CreateTicketPage
          currentUser={currentUser || undefined}
          onCancel={() => setCurrentView('dashboard')}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
          onSubmitSuccess={handleTicketCreated}
        />
      )}

      {currentView === 'my-tickets' && (
        <MyTicketsPage
          currentUser={currentUser || undefined}
          tickets={tickets}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
          onCreateTicket={() => setCurrentView('create-ticket')}
          onSelectTicket={handleSelectTicket}
        />
      )}

      {currentView === 'ticket-detail' && selectedTicket && (
        <TicketDetailPage
          currentUser={currentUser || undefined}
          ticket={selectedTicket}
          onBack={() => setCurrentView('my-tickets')}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
          onUpdateTicket={handleUpdateTicket}
        />
      )}

      {currentView === 'master-category' && (
        <MasterCategoryPage
          currentUser={currentUser || undefined}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
        />
      )}

      {currentView === 'report' && (
        <ReportPage
          currentUser={currentUser || undefined}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
        />
      )}
    </div>
  );
}

export default App;
