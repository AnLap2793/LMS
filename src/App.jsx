import { Suspense } from 'react';
import { ConfigProvider } from 'antd';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import viVN from 'antd/locale/vi_VN';
import { theme } from './config/theme';
import { queryClient } from './config/queryClient';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import { router } from './routes';
import { Spin } from 'antd';
import './styles/global.css';

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ConfigProvider theme={theme} locale={viVN}>
          <AuthProvider>
            <Suspense fallback={
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: '100vh' 
              }}>
                <Spin size="large" />
              </div>
            }>
              <RouterProvider router={router} />
            </Suspense>
          </AuthProvider>
        </ConfigProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
