import { useState, useEffect } from 'react';
import '../../App.css'; // 共通スタイルをインポート
import { MdPowerSettingsNew } from 'react-icons/md';
import './style.css';
import { GetAllDeviceLists, ControlInfraredRemote, TurnFirstLight} from '../../../wailsjs/go/main/App';
import { main, switchbot } from '../../../wailsjs/go/models';

interface LogEntry {
    timestamp: string;
    message: string;
    type: 'info' | 'error';
}

interface CombinedDevice {
    id: string;
    name: string;
    type: 'physical' | 'infrared';
    deviceType: string;
    isControllable: boolean;
}

function SwitchBotController() {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [allDevices, setAllDevices] = useState<CombinedDevice[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const addLog = (message: string, type: 'info' | 'error' = 'info') => {
        const newLog: LogEntry = {
            timestamp: new Date().toLocaleTimeString(),
            message,
            type,
        };
        setLogs(prevLogs => [newLog, ...prevLogs]);
    };

    useEffect(() => {
        const fetchAllDevices = async () => {
            setIsLoading(true);
            addLog('デバイスリストを取得中...');
            try {
                const deviceLists: main.DeviceLists = await GetAllDeviceLists();

                const physicals: CombinedDevice[] = deviceLists.devices.map(d => ({
                    id: d.deviceId,
                    name: d.deviceName,
                    type: 'physical',
                    deviceType: d.deviceType,
                    isControllable: false,
                }));

                const remotes: CombinedDevice[] = deviceLists.infraredRemotes.map(r => ({
                    id: r.deviceId,
                    name: r.deviceName,
                    type: 'infrared',
                    deviceType: r.remoteType,
                    isControllable: r.remoteType === 'TV' || r.remoteType === 'Light',
                }));

                setAllDevices([...physicals, ...remotes]);
                addLog('デバイスリストを取得しました。');
            } catch (err: any) {
                addLog(`デバイスリストの取得に失敗しました: ${err.message || String(err)}`, 'error');
            } finally {
                setIsLoading(false);
            }
        };

        fetchAllDevices();
    }, []);

    const handleRemoteControl = async (deviceId: string, command: string, deviceName: string) => {
        try {
            addLog(`${deviceName}に「${command}」コマンドを送信中...`);
            await ControlInfraredRemote(deviceId, command);
            addLog(`${deviceName}に「${command}」コマンドを送信しました。`);
        } catch (err: any) {
            addLog(`${deviceName}へのコマンド送信に失敗しました: ${err.message || String(err)}`, 'error');
        }
    };

    const handleTurnOnFirstLightClick = async () => {
        try {
            addLog('最初の照明をオンにしています...');
            const resultMessage = await TurnFirstLight();
            addLog(resultMessage);
        } catch (err: any) {
            addLog(`照明の操作に失敗しました: ${err.message || String(err)}`, 'error');
        }
    };

    return (
        <div className="page-container">
            <div className="main-content">
                <h1>SwitchBot Controller</h1>
                <div className="device-list">
                    <h2>デバイス一覧</h2>
                    {isLoading ? (
                        <p>読み込み中...</p>
                    ) : allDevices.length > 0 ? (
                        <ul>
                            {allDevices.map((device) => (
                                <li key={device.id}>
                                    <span className="device-name-container">
                                        {device.name}
                                        <span className="device-type-label">({device.type === 'physical' ? '物理' : '赤外線'}: {device.deviceType})</span>
                                    </span>
                                    {device.isControllable && (
                                        <div className="remote-buttons">
                                            <button onClick={() => handleRemoteControl(device.id, 'turnOn', device.name)} title="オン">
                                                <MdPowerSettingsNew /> オン
                                            </button>
                                            <button onClick={() => handleRemoteControl(device.id, 'turnOff', device.name)} title="オフ">
                                                <MdPowerSettingsNew /> オフ
                                            </button>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>デバイスが見つかりません。</p>
                    )}
                </div>
                <div className="device-list">
                    <h2>一括操作</h2>
                    <button className="batch-button" onClick={handleTurnOnFirstLightClick}>
                        最初の照明をオンにする
                    </button>
                </div>
            </div>
            <div className="log-panel">
                <h2>操作ログ</h2>
                <ul className="log-list">
                    {logs.map((log, index) => (
                        <li key={index} className={`log-entry log-${log.type}`}>
                            <span className="log-timestamp">{log.timestamp}</span>
                            <span className="log-message">{log.message}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default SwitchBotController;