import Providers from './provider';
import { MainApp } from './components/MainApp';
import LandingPage from './components/LandingPage';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

export default function App() {
  return (
    <Providers>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/mainpage" element={<MainApp />} />
        </Routes>
      </BrowserRouter>
    </Providers>
  );
}