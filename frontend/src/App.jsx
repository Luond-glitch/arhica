import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Programmes from './pages/Programmes';
import { Board, Management, Teams } from './pages/Organization';
import Stories, { StoryDetail } from './pages/Stories';
import Events from './pages/Events';
import Videos from './pages/Videos';
import Gallery from './pages/Gallery';
import Donate from './pages/Donate';
import { Contact, NotFound } from './pages/Contact';
import Admin from './admin/Admin';

export default function App() {
  return (
    <Routes>
      <Route path="/admin" element={<Admin />} />
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="programmes" element={<Programmes />} />
        <Route path="organization" element={<Navigate to="/organization/board" replace />} />
        <Route path="organization/board" element={<Board />} />
        <Route path="organization/management" element={<Management />} />
        <Route path="organization/teams" element={<Teams />} />
        <Route path="stories" element={<Stories />} />
        <Route path="stories/:slug" element={<StoryDetail />} />
        <Route path="events" element={<Events />} />
        <Route path="videos" element={<Videos />} />
        <Route path="gallery" element={<Gallery />} />
        <Route path="donate" element={<Donate />} />
        <Route path="contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
