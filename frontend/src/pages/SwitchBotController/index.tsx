import { useState, useEffect } from 'react';
import '../../App.css'; // 共通スタイルをインポート
import { GiCeilingLight } from 'react-icons/gi';
import { LuTv } from 'react-icons/lu';
import { MdPowerSettingsNew } from 'react-icons/md';
import './style.css';
import { GetAllDeviceLists, ControlInfraredRemote, TurnFirstLight} from '../../../wailsjs/go/main/App';
import { main, switchbot } from '../../../wailsjs/go/models';

function SwitchBotController() {
    const [message, setMessage] = useState('ボタンを押して操作します。');
    const [devices, setDevices] = useState<switchbot.Device[]>([]);
    const [infraredRemotes, setInfraredRemotes] = useState<switchbot.InfraredDevice[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAllDevices = async () => {
            try {
                setMessage('デバイスリストを取得中...');
                const allDevices: main.DeviceLists = await GetAllDeviceLists();
                setDevices(allDevices.devices);
                setInfraredRemotes(allDevices.infraredRemotes);
                setMessage('デバイスリストを取得しました。');
            } catch (err: any) {
                setError(err.message || String(err));
                setMessage('デバイスリストの取得に失敗しました。');
            }
        };

        fetchAllDevices();
    }, []);

    const handleRemoteControl = async (deviceId: string, command: string, deviceName: string) => {
        try {
            setMessage(`${deviceName}に「${command}」コマンドを送信中...`);
            await ControlInfraredRemote(deviceId, command);
            setMessage(`${deviceName}に「${command}」コマンドを送信しました。`);
        } catch (err: any) {
            setError(err.message || String(err));
            setMessage(`${deviceName}へのコマンド送信に失敗しました。`);
        }
    };

    const handleTurnOnFirstLightClick = async () => {
        try {
            setMessage('最初の照明をオンにしています...');
            const resultMessage = await TurnFirstLight();
            setMessage(resultMessage);
        } catch (err: any) {
            setError(err.message || String(err));
            setMessage('照明の操作に失敗しました。');
        }
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
                                <span>{device.deviceName} ({device.deviceType})</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    !error && <p>デバイスが見つかりません。</p>
                )}
            </div>
            <div className="device-list">
                <h2>赤外線リモコン一覧</h2>
                {infraredRemotes.length > 0 ? (
                    <ul>
                        {infraredRemotes.map((remote) => (
                            <li key={remote.deviceId}>
                                <span className="device-name-container">
                                    {remote.remoteType === 'Light' && <GiCeilingLight className="list-icon" />}
                                    {remote.remoteType === 'TV' && <LuTv className="list-icon" />}
                                    {remote.deviceName}
                                </span>
                                {(remote.remoteType === 'TV' || remote.remoteType === 'Light') && (
                                    <div className="remote-buttons">
                                        <button onClick={() => handleRemoteControl(remote.deviceId, 'turnOn', remote.deviceName)} title="オン">
                                            <MdPowerSettingsNew /> オン
                                        </button>
                                        <button onClick={() => handleRemoteControl(remote.deviceId, 'turnOff', remote.deviceName)} title="オフ">
                                            <MdPowerSettingsNew /> オフ
                                        </button>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                ) : (
                    !error && <p>赤外線リモコンが見つかりません。</p>
                )}
            </div>
            <div className="device-list">
                <h2>一括操作</h2>
                <button className="batch-button" onClick={handleTurnOnFirstLightClick}>
                    最初の照明をオンにする
                </button>
            </div>
        </div>
    );
}

export default SwitchBotController;