import { useState, useEffect } from 'react';
import '../../App.css'; // 共通スタイルをインポート
import { MdPowerSettingsNew, MdOpenInFull, MdCloseFullscreen } from 'react-icons/md';
import './style.css';
import { InitSwitchBotAndFetchDevices, ControlInfraredRemote } from '../../../wailsjs/go/main/App';
import { main } from '../../../wailsjs/go/models';

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
            addLog('SwitchBotの初期化を開始します...');
            try {
                const deviceLists: main.DeviceLists = await InitSwitchBotAndFetchDevices();

                const physicals: CombinedDevice[] = deviceLists.devices.map(d => ({
                    id: d.deviceId,
                    name: d.deviceName,
                    type: 'physical',
                    deviceType: d.deviceType,
                }));

                const remotes: CombinedDevice[] = deviceLists.infraredRemotes.map(r => ({
                    id: r.deviceId,
                    name: r.deviceName,
                    type: 'infrared',
                    deviceType: r.remoteType,
                }));

                setAllDevices([...physicals, ...remotes]);
                if (!sessionStorage.getItem('SB_AUTH_LOGGED')) {
                    addLog('SwitchBotの認証情報を確認しました。');
                    addLog('SwitchBot APIへの接続を確認しました。');
                    sessionStorage.setItem('SB_AUTH_LOGGED', '1');
                }
                addLog('デバイスリストを取得しました。');
            } catch (err: any) {
                addLog(`${err?.message || String(err)}`, 'error');
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
                                    <div className="remote-buttons">
                                        {(device.deviceType.includes('Hub')) && (
                                            <>
                                                ここに湿度、温度、照度を表示する
                                            </>
                                        )}
                                        {(device.type === 'infrared' && (device.deviceType.includes('Light'))) && (
                                            <>
                                                <button onClick={() => handleRemoteControl(device.id, "turnOn", device.name)} title="電源">
                                                    <MdPowerSettingsNew />
                                                </button>
                                            </>
                                        )}
                                        {(device.type === 'infrared' && (device.deviceType.includes('TV'))) && (
                                            <>
                                                <button
                                                    onClick={() => handleRemoteControl(device.id, "turnOn", device.name)}
                                                    title="電源"
                                                >
                                                    <MdPowerSettingsNew />
                                                </button>
                                            </>
                                        )}
                                        {(device.type === 'infrared' && (device.deviceType.includes('Air Conditioner'))) && (
                                            <>
                                                <button onClick={() => { addLog("ボタンの動作は未実装") }} title="温度↑">
                                                    <>↑</>
                                                </button>
                                                <button onClick={() => { addLog("ボタンの動作は未実装") }} title="温度↓">
                                                    <>↓</>
                                                </button>
                                                <button onClick={() => handleRemoteControl(device.id, "turnOn", device.name)} title="電源">
                                                    <MdPowerSettingsNew />
                                                </button>
                                            </>
                                        )}
                                        {device.deviceType.includes('Curtain') && (
                                            <>
                                                <button onClick={() => { addLog("ボタンの動作は未実装") }} title="開ける">
                                                    <MdOpenInFull />
                                                </button>
                                                <button onClick={() => { addLog("ボタンの動作は未実装") }} title="閉める">
                                                    <MdCloseFullscreen />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>デバイスが見つかりません。</p>
                    )}
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
