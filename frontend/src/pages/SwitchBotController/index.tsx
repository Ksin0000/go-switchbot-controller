import { useState, useEffect } from 'react';
import '../../App.css'; // 共通スタイルをインポート
import { MdPowerSettingsNew, MdOpenInFull, MdCloseFullscreen, MdExpandMore, MdExpandLess } from 'react-icons/md';
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

type AirconMode = 1 | 2 | 3 | 4 | 5; // 1:auto, 2:cool, 3:dry, 4:fan, 5:heat
type FanSpeed = 1 | 2 | 3 | 4; // 1:auto, 2:low, 3:medium, 4:high
interface AirconSetting { temperature: number; mode: AirconMode; fanSpeed: FanSpeed; power: 'on' | 'off'; }

function SwitchBotController() {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [allDevices, setAllDevices] = useState<CombinedDevice[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [acSettings, setAcSettings] = useState<Record<string, AirconSetting>>({});
    const [detailsOpen, setDetailsOpen] = useState<Record<string, boolean>>({});

    const modeOptions: { val: AirconMode; label: string }[] = [
        { val: 1, label: 'Auto' },
        { val: 2, label: 'Cool' },
        { val: 3, label: 'Dry' },
        { val: 4, label: 'Fan' },
        { val: 5, label: 'Heat' },
    ];
    const fanOptions: { val: FanSpeed; label: string }[] = [
        { val: 1, label: 'Auto' },
        { val: 2, label: 'Low' },
        { val: 3, label: 'Med' },
        { val: 4, label: 'High' },
    ];

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
                // ACデバイスに初期値を設定
                const initAC: Record<string, AirconSetting> = {};
                remotes.filter(r => r.deviceType.includes('Air Conditioner')).forEach(r => {
                    initAC[r.id] = { temperature: 26, mode: 1, fanSpeed: 1, power: 'on' };
                });
                setAcSettings(prev => ({ ...initAC, ...prev }));
                // 詳細パネルの初期状態（全て閉）
                const initDetails: Record<string, boolean> = {};
                [...physicals, ...remotes].forEach(d => { initDetails[d.id] = false; });
                setDetailsOpen(prev => ({ ...initDetails, ...prev }));
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

    const handleAirconSend = (device: CombinedDevice) => {
        const st = acSettings[device.id] || { temperature: 26, mode: 1 as AirconMode, fanSpeed: 1 as FanSpeed, power: 'on' as const };
        const param = `${st.temperature},${st.mode},${st.fanSpeed},${st.power}`;
        handleRemoteControl(device.id, `setAll:${param}`, device.name);
    };

    const adjustTemp = (deviceId: string, delta: number) => {
        setAcSettings(prev => {
            const base: AirconSetting = prev[deviceId] || { temperature: 26, mode: 1 as AirconMode, fanSpeed: 1 as FanSpeed, power: 'on' };
            const next = Math.max(16, Math.min(30, base.temperature + delta));
            return { ...prev, [deviceId]: { ...base, temperature: next } };
        });
    };

    const toggleDetails = (deviceId: string) => {
        setDetailsOpen(prev => ({ ...prev, [deviceId]: !prev[deviceId] }));
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
                                <li key={device.id} className="device-item">
                                    <div className="device-row">
                                        <span className="device-name-container">
                                            <button
                                                className="details-toggle"
                                                aria-expanded={!!detailsOpen[device.id]}
                                                onClick={() => toggleDetails(device.id)}
                                                title={detailsOpen[device.id] ? '詳細を閉じる' : '詳細を開く'}
                                            >
                                                {detailsOpen[device.id] ? <MdExpandLess/> : <MdExpandMore/>}
                                            </button>
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
                                                    <button
                                                        onClick={() => handleRemoteControl(device.id, "turnOn", device.name)}
                                                        title="電源"
                                                    >
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
                                    </div>

                                    {detailsOpen[device.id] && (
                                        <div className="device-details">
                                            {(device.type === 'infrared' && (device.deviceType.includes('Air Conditioner'))) ? (
                                                <div className="ac-detail-grid">
                                                    {/* 電源（先頭・トグル） */}
                                                    <div className="form-row">
                                                        <span>電源</span>
                                                        <span className="row-controls">
                                                            <button
                                                                className={`power-toggle ${((acSettings[device.id]?.power ?? 'on') === 'on') ? 'on' : 'off'}`}
                                                                role="switch"
                                                                aria-label="電源"
                                                                aria-checked={(acSettings[device.id]?.power ?? 'on') === 'on'}
                                                                onClick={() => setAcSettings(prev => ({
                                                                    ...prev,
                                                                    [device.id]: { ...(prev[device.id] || { temperature: 26, mode: 1, fanSpeed: 1, power: 'on' }), power: (prev[device.id]?.power ?? 'on') === 'on' ? 'off' : 'on' }
                                                                }))}
                                                            />
                                                            <button className="send-inline" onClick={() => handleAirconSend(device)}>送信</button>
                                                        </span>
                                                    </div>
                                                    {((acSettings[device.id]?.power ?? 'on') === 'on') && (
                                                        <>
                                                            <div className="form-row">
                                                                <span>温度</span>
                                                                <span className="temp-controls">
                                                                    <button
                                                                        type="button"
                                                                        className="temp-btn wide"
                                                                        aria-label="Decrease temperature by 5"
                                                                        onClick={() => adjustTemp(device.id, -5)}
                                                                        disabled={(acSettings[device.id]?.temperature ?? 26) <= 16}
                                                                    >
                                                                        {'<<'}
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        className="temp-btn"
                                                                        aria-label="Decrease temperature"
                                                                        onClick={() => adjustTemp(device.id, -1)}
                                                                        disabled={(acSettings[device.id]?.temperature ?? 26) <= 16}
                                                                    >
                                                                        {'<'}
                                                                    </button>
                                                                    <span className="temp-value">{acSettings[device.id]?.temperature ?? 26}°C</span>
                                                                    <button
                                                                        type="button"
                                                                        className="temp-btn"
                                                                        aria-label="Increase temperature"
                                                                        onClick={() => adjustTemp(device.id, +1)}
                                                                        disabled={(acSettings[device.id]?.temperature ?? 26) >= 30}
                                                                    >
                                                                        {'>'}
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        className="temp-btn wide"
                                                                        aria-label="Increase temperature by 5"
                                                                        onClick={() => adjustTemp(device.id, +5)}
                                                                        disabled={(acSettings[device.id]?.temperature ?? 26) >= 30}
                                                                    >
                                                                        {'>>'}
                                                                    </button>
                                                                </span>
                                                            </div>
                                                            <div className="form-row">
                                                                <span>モード</span>
                                                                <div className="segmented" role="radiogroup" aria-label="Mode">
                                                                    {modeOptions.map(({ val, label }) => (
                                                                        <button
                                                                            key={val}
                                                                            type="button"
                                                                            role="radio"
                                                                            aria-checked={(acSettings[device.id]?.mode ?? 1) === val}
                                                                            className={`seg ${((acSettings[device.id]?.mode ?? 1) === val) ? 'active' : ''}`}
                                                                            onClick={() => setAcSettings(prev => ({
                                                                                ...prev,
                                                                                [device.id]: { ...(prev[device.id] || { temperature: 26, mode: 1, fanSpeed: 1, power: 'on' }), mode: val }
                                                                            }))}
                                                                        >
                                                                            <span className="seg-label">{label}</span>
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            <div className="form-row">
                                                                <span>風量</span>
                                                                <div className="segmented" role="radiogroup" aria-label="Fan Speed">
                                                                    {fanOptions.map(({ val, label }) => (
                                                                        <button
                                                                            key={val}
                                                                            type="button"
                                                                            role="radio"
                                                                            aria-checked={(acSettings[device.id]?.fanSpeed ?? 1) === val}
                                                                            className={`seg ${((acSettings[device.id]?.fanSpeed ?? 1) === val) ? 'active' : ''}`}
                                                                            onClick={() => setAcSettings(prev => ({
                                                                                ...prev,
                                                                                [device.id]: { ...(prev[device.id] || { temperature: 26, mode: 1, fanSpeed: 1, power: 'on' }), fanSpeed: val }
                                                                            }))}
                                                                        >
                                                                            <span className="seg-label">{label}</span>
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="detail-empty">このデバイスの詳細設定は未実装です。</div>
                                            )}
                                        </div>
                                    )}
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
