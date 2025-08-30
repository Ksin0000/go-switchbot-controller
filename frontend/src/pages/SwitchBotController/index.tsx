import { useState, useEffect } from 'react';
import '../../App.css'; // 共通スタイルをインポート
import { GiCeilingLight } from 'react-icons/gi';
import { LuTv } from 'react-icons/lu';
import './style.css';
import { HandleCeilingLight, HandleTv, GetDeviceList } from '../../../wailsjs/go/main/App';
import { switchbot } from '../../../wailsjs/go/models';

function SwitchBotController() {
    const [message, setMessage] = useState('ボタンを押して操作します。');
    const [devices, setDevices] = useState<switchbot.Device[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDevices = async () => {
            try {
                setMessage('デバイスリストを取得中...');
                const deviceList = await GetDeviceList();
                setDevices(deviceList);
                setMessage('デバイスリストを取得しました。');
            } catch (err: any) {
                setError(err.message || String(err));
                setMessage('デバイスリストの取得に失敗しました。');
            }
        };

        fetchDevices();
    }, []);

    const handleCeilingLightClick = async () => {
        await HandleCeilingLight();
        setMessage('シーリングライトのボタンがクリックされました。');
    };

    const handleTvClick = async () => {
        await HandleTv();
        setMessage('テレビのボタンがクリックされました。');
    };

    return (
        <div className="controller-container">
            <h1>SwitchBot Controller</h1>
            <p>{message}</p>
            {error && <p className="error-message">Error: {error}</p>}
            <div className="device-list">
                <h2>デバイス一覧</h2>
                {devices.length > 0 ? (
                    <ul>
                        {devices.map((device) => (
                            <li key={device.deviceId}>
                                {device.deviceName} ({device.deviceType})
                            </li>
                        ))}
                    </ul>
                ) : (
                    !error && <p>デバイスが見つかりません。</p>
                )}
            </div>
            <div className="button-grid">
                <button className="control-button" onClick={handleCeilingLightClick}>
                    <span className="icon"><GiCeilingLight /></span>
                    <span>シーリングライト</span>
                </button>
                <button className="control-button" onClick={handleTvClick}>
                    <span className="icon"><LuTv /></span>
                    <span>テレビ</span>
                </button>
            </div>
        </div>
    );
}

export default SwitchBotController;