import { ControlPanel } from './components/ControlPanel/ControlPanel';
import { Overlay } from './components/Overlay/Overlay';
import './App.css';

function App() {
  return window.location.pathname === '/overlay' ? <Overlay /> : <ControlPanel />;
}

export default App;
