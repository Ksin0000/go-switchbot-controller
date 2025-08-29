import { Link } from 'react-router-dom';
import { FaBed, FaRobot } from 'react-icons/fa';
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
            </div>
        </div>
    );
}

export default Home;