import Sidebar from './Sidebar.jsx';
import { Toaster } from 'react-hot-toast';

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 min-h-screen">
        {children}
      </main>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { fontSize: '14px', fontFamily: 'Inter' },
          success: { iconTheme: { primary: '#4A8022', secondary: '#fff' } },
        }}
      />
    </div>
  );
}
