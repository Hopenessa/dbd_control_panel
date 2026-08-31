import { ControlPanel } from './components/ControlPanel/ControlPanel';
import { Overlay } from './components/Overlay/Overlay';
import './App.css';

function App() {
  const isOverlayPath = window.location.pathname.endsWith('/overlay');
  const isOverlayHash = window.location.hash === '#/overlay';

  return isOverlayPath || isOverlayHash ? <Overlay /> : <ControlPanel />;
}

export default App;
