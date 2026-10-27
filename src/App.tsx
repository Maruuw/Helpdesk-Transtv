import { useState } from 'react';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage, initialLatestRequests } from './pages/DashboardPage';
import type { TicketRequestItem } from './pages/DashboardPage';
import { CreateTicketPage } from './pages/CreateTicketPage';
import { MyTicketsPage } from './pages/MyTicketsPage';
import { TicketDetailPage } from './pages/TicketDetailPage';
import { MasterCategoryPage } from './pages/MasterCategoryPage';

export type AppView = 'login' | 'dashboard' | 'create-ticket' | 'my-tickets' | 'ticket-detail' | 'master-category';

function App() {
  const [currentView, setCurrentView] = useState<AppView>('login');
  const [tickets, setTickets] = useState<TicketRequestItem[]>(initialLatestRequests);
  const [selectedTicket, setSelectedTicket] = useState<TicketRequestItem | null>(null);

  const handleTicketCreated = (newTicket: {
    subject: string;
    group: string;
    category: string;
    description: string;
  }) => {
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
      requester: 'Raden Azhar Fadhlur Rohman',
      nik: '231270322',
      department: 'Information Technology',
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

  const handleUpdateTicket = (
    ticketId: string,
    newStatus: 'Solved' | 'In progress' | 'Return' | 'Reject',
    responseMessage: string,
    handlerName: string = 'Raden Azhar Fadhlur Rohman',
    responderRole: 'IT Support' | 'User' = 'IT Support'
  ) => {
    const now = new Date();
    const dateFormatted = `${now.getDate()} ${now.toLocaleString('id-ID', { month: 'short' })} ${now.getFullYear()}, ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const newResponse = {
      id: `resp-${Date.now()}`,
      responder: handlerName,
      role: responderRole,
      submitted: dateFormatted,
      status: responderRole === 'User' ? undefined : newStatus,
      message: responseMessage,
    };

    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          return {
            ...t,
            // User cannot change status or handler! Only admin can change status.
            status: responderRole === 'User' ? t.status : newStatus,
            handler: responderRole === 'User' ? t.handler : handlerName,
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
        status: responderRole === 'User' ? prev.status : newStatus,
        handler: responderRole === 'User' ? prev.handler : handlerName,
        responses: [...(prev.responses || []), newResponse],
      };
    });
  };

  return (
    <div className="w-full min-h-screen">
      {currentView === 'login' && (
        <LoginPage onLoginSuccess={() => setCurrentView('dashboard')} />
      )}

      {currentView === 'dashboard' && (
        <DashboardPage
          tickets={tickets}
          onLogout={() => setCurrentView('login')}
          onCreateTicket={() => setCurrentView('create-ticket')}
          onViewAllTickets={() => setCurrentView('my-tickets')}
          onNavigateMasterCategory={() => setCurrentView('master-category')}
          onSelectTicket={handleSelectTicket}
        />
      )}

      {currentView === 'create-ticket' && (
        <CreateTicketPage
          onCancel={() => setCurrentView('dashboard')}
          onLogout={() => setCurrentView('login')}
          onNavigate={(view) => setCurrentView(view)}
          onSubmitSuccess={handleTicketCreated}
        />
      )}

      {currentView === 'my-tickets' && (
        <MyTicketsPage
          tickets={tickets}
          onLogout={() => setCurrentView('login')}
          onNavigate={(view) => setCurrentView(view)}
          onCreateTicket={() => setCurrentView('create-ticket')}
          onSelectTicket={handleSelectTicket}
        />
      )}

      {currentView === 'ticket-detail' && selectedTicket && (
        <TicketDetailPage
          ticket={selectedTicket}
          onBack={() => setCurrentView('my-tickets')}
          onNavigate={(view) => setCurrentView(view)}
          onLogout={() => setCurrentView('login')}
          onUpdateTicket={handleUpdateTicket}
        />
      )}

      {currentView === 'master-category' && (
        <MasterCategoryPage
          onLogout={() => setCurrentView('login')}
          onNavigate={(view) => setCurrentView(view)}
        />
      )}
    </div>
  );
}

export default App;
