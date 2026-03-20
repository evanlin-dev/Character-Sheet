import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HeroUIProvider } from '@heroui/react';
import { CharacterProvider } from './context/CharacterContext';
import CharacterSheetPage from './pages/CharacterSheetPage';
import DMScreenPage from './pages/DMScreenPage';
import DataViewerPage from './pages/DataViewerPage';
import CharacterCreatorPage from './pages/CharacterCreatorPage';
import './styles.css';
import './tailwind.css';

function App() {
  return (
    <HeroUIProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={
            <CharacterProvider>
              <CharacterSheetPage />
            </CharacterProvider>
          } />
          <Route path="/dm" element={<DMScreenPage />} />
          <Route path="/data" element={<DataViewerPage />} />
          <Route path="/create" element={<CharacterCreatorPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </HeroUIProvider>
  );
}

export default App;
