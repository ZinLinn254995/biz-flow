import { BrowserRouter } from 'react-router-dom';
import ErrorBoundary from '@/components/ErrorBoundary';
import { ServiceProvider } from '@/hooks/common';
import AppRoutes from '@/routes/AppRoutes';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ServiceProvider>
          <AppRoutes />
        </ServiceProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
