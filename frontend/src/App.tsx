import { Routes, Route } from "react-router-dom";
import Home from './pages/Home';
import SleepTimer from './pages/SleepTimer';
import SwitchBotController from './pages/SwitchBotController';
import Layout from './components/Layout';
import './App.css';

function App() {
    return (
        <div id="app">
            <Routes>
              <Route path="/" element={<Home/>}/>
              <Route element={<Layout />}>
                <Route path="/sleep-timer" element={<SleepTimer/>}/>
                <Route path="/switchbot" element={<SwitchBotController/>}/>
              </Route>
            </Routes>
        </div>
    )
}

export default App
