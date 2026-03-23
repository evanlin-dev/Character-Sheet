import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HeroUIProvider } from '@heroui/react';
import { CharacterProvider } from 'src/context/CharacterContext';
import CharacterSheetPage from 'src/pages/CharacterSheetPage';
import DMScreenPage from 'src/pages/DMScreenPage';
import DataViewerPage from 'src/pages/DataViewerPage';
import CharacterCreatorPage from 'src/pages/CharacterCreatorPage';
import LoginPage from 'src/pages/LoginPage';
import NPCPage from 'src/pages/NPCPage';
import RoomsPage from 'src/pages/RoomsPage';
import RoomViewPage from 'src/pages/RoomViewPage';
import CompendiumPage from 'src/pages/CompendiumPage';
import DataTutorialPage from 'src/pages/DataTutorialPage';
import 'src/styles.css';
import 'src/tailwind.css';

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
          <Route path="/login" element={<LoginPage />} />
          <Route path="/npcs" element={<NPCPage />} />
          <Route path="/compendium" element={<CompendiumPage />} />
          <Route path="/data-tutorial" element={<DataTutorialPage />} />
          <Route path="/rooms" element={<RoomsPage />} />
          <Route path="/rooms/:roomId" element={<RoomViewPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </HeroUIProvider>
  );
}

export default App;
