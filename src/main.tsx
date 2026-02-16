import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Khởi động Capacitor khi chạy trên Android native
const startApp = async () => {
  // Nếu đang chạy trên Android native, khởi tạo các plugin Capacitor
  try {
    const { isNative, setStatusBarDark } = await import('./services/capacitorService');
    if (isNative()) {
      // Đặt màu status bar tối
      await setStatusBarDark();

      // Ẩn splash screen của Capacitor (nếu dùng native splash)
      try {
        const { SplashScreen } = await import('@capacitor/splash-screen');
        await SplashScreen.hide({ fadeOutDuration: 500 });
      } catch {
        // SplashScreen plugin không bắt buộc
      }
    }
  } catch {
    // Chạy trên web thường, bỏ qua
  }

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
};

startApp();
