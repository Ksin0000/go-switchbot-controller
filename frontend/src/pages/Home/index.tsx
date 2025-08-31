import { Link } from 'react-router-dom';
import { FaBed, FaRobot } from 'react-icons/fa';
import { CgSleep, CgDebug } from 'react-icons/cg';
import './style.css';

function Home() {
    return (
        <div className="home-container">
            <h1>Go SwitchBot Controller</h1>
            <div className="app-grid">
                <Link to="/sleep-timer" className="app-icon">
                    <span className="icon"><FaBed /></span>
                    <span>PCスリープ</span>
                </Link>
                <Link to="/switchbot" className="app-icon">
                    <span className="icon"><FaRobot /></span>
                    <span>SwitchBot操作</span>
                </Link>
                <Link to="/get-ready-for-sleep" className="app-icon">
                    <span className="icon"><CgSleep /></span>
                    <span>寝る準備</span>
                </Link>
                <Link to="/debug" className="app-icon">
                    <span className="icon"><CgDebug /></span>
                    <span>デバック用</span>
                </Link>
            </div>
        </div>
    );
}

export default Home;