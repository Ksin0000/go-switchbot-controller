import { Routes, Route } from "react-router-dom";
import HomePage from './pages/HomePage';
import SleepTimer from './pages/SleepTimer';
import SwitchBotController from './pages/SwitchBotController';
import GetReadyForSleep from './pages/GetReadyForSleep';
import DebugPage from './pages/DebugPage';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

function App() {
    return (
        <div id="app">
            <ErrorBoundary>
                <Routes>
                  <Route path="/" element={<HomePage/>}/>
                  <Route element={<Layout />}>
                    <Route path="/sleep-timer" element={<SleepTimer/>}/>
                    <Route path="/switchbot" element={<SwitchBotController/>}/>
                    <Route path="/get-ready-for-sleep" element={<GetReadyForSleep/>}/>
                    <Route path="/debug" element={<DebugPage/>}/>
                  </Route>
                </Routes>
            </ErrorBoundary>
        </div>
    )
}

export default App
