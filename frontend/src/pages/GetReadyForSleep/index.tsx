import {useEffect, useMemo, useState} from 'react';
import '../../App.css';
import './style.css';
import { InitSwitchBotAndFetchDevices, ControlInfraredRemote, ShutdownNow, SleepNow } from '../../../wailsjs/go/main/App';
import { main } from '../../../wailsjs/go/models';

type LogType = 'info' | 'error';

interface LogEntry { timestamp: string; message: string; type: LogType }
interface CombinedDevice { id: string; name: string; kind: 'infrared' | 'physical'; deviceType: string }

function GetReadyForSleep() {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [devices, setDevices] = useState<CombinedDevice[]>([]);
    const [selected, setSelected] = useState<Record<string, boolean>>({});
    const [minutes, setMinutes] = useState<number>(30);
    const [remaining, setRemaining] = useState<number | null>(null);
    const [running, setRunning] = useState(false);
    const [pcAction, setPcAction] = useState<'shutdown' | 'sleep'>('shutdown');

    const addLog = (message: string, type: LogType = 'info') => {
        setLogs(prev => [{ timestamp: new Date().toLocaleTimeString(), message, type }, ...prev]);
    };

    useEffect(() => {
        const fetch = async () => {
            try {
                const list: main.DeviceLists = await InitSwitchBotAndFetchDevices();
                const phys: CombinedDevice[] = list.devices.map(d => ({ id: d.deviceId, name: d.deviceName, kind: 'physical', deviceType: d.deviceType }));
                const irs: CombinedDevice[] = list.infraredRemotes.map(r => ({ id: r.deviceId, name: r.deviceName, kind: 'infrared', deviceType: r.remoteType }));
                setDevices([...phys, ...irs]);
                addLog('デバイス一覧を取得しました。');
            } catch (e: any) {
                addLog(`デバイス取得に失敗しました: ${e?.message || String(e)}`, 'error');
            }
        };
        fetch();
    }, []);

    useEffect(() => {
        if (!running) return;
        const id = setInterval(() => setRemaining(t => (t ? t - 1 : t)), 1000);
        return () => clearInterval(id);
    }, [running]);

    useEffect(() => {
        if (remaining === 0) {
            setRunning(false);
            setRemaining(null);
            (async () => {
                addLog('選択したデバイスをオフにします...');
                const chosen = devices.filter(d => selected[d.id]);
                for (const d of chosen) {
                    try {
                        if (d.kind === 'infrared') {
                            const cmd = getPowerCommand(d.id);
                            addLog(`${d.name} に IRコマンド「${cmd}」を送信中...`);
                            await ControlInfraredRemote(d.id, cmd);
                        } else {
                            addLog("ボタンの動作は未実装");
                        }
                        addLog(`${d.name}: OK`);
                    } catch (e: any) {
                        addLog(`${d.name}: 失敗 ${e?.message || String(e)}`, 'error');
                    }
                }
                if (pcAction === 'shutdown') {
                    addLog('PCをシャットダウンします...');
                    await new Promise(r => setTimeout(r, 800));
                    ShutdownNow();
                } else {
                    addLog('PCをスリープします...');
                    await new Promise(r => setTimeout(r, 800));
                    SleepNow().then(msg => addLog(msg));
                }
            })();
        }
    }, [remaining]);

    const allInfrared = useMemo(() => devices.filter(d => d.kind === 'infrared'), [devices]);
    const allPhysical = useMemo(() => devices.filter(d => d.kind === 'physical'), [devices]);

    const start = () => {
        if (minutes <= 0) {
            addLog('分数は1以上を指定してください。', 'error');
            return;
        }
        setRemaining(minutes * 60);
        setRunning(true);
        addLog(`${minutes}分後にデバイスOFF → シャットダウンを実行します。`);
    };

    const cancel = () => {
        setRunning(false);
        setRemaining(null);
        addLog('タイマーをキャンセルしました。');
    };

    const toggle = (id: string) => setSelected(prev => ({ ...prev, [id]: !prev[id] }));

    // IR電源コマンド（デフォルト: turnOff だが任意で上書き可能）
    const getPowerCommand = (deviceId: string) => {
        const v = localStorage.getItem(`power_cmd:${deviceId}`);
        return v && v.trim() ? v : 'turnOff';
    };
    const setPowerCommand = (deviceId: string, deviceName: string) => {
        const cur = getPowerCommand(deviceId);
        const next = window.prompt(`${deviceName} の電源コマンド名を入力してください`, cur);
        if (next == null) return; // cancel
        const val = next.trim();
        if (!val) {
            localStorage.removeItem(`power_cmd:${deviceId}`);
            addLog(`${deviceName} の電源コマンド名をデフォルト(turnOff)に戻しました。`);
        } else {
            localStorage.setItem(`power_cmd:${deviceId}`, val);
            addLog(`${deviceName} の電源コマンド名を「${val}」に設定しました。`);
        }
    };

    return (
        <div className="page-container">
            <div className="main-content">
                <h1>寝る準備</h1>
                <p>指定時間後に選択したデバイスをオフにし、PCを指定の動作で処理します。</p>

                <div className="control-row">
                    <label>実行までの分数: </label>
                    <input type="number" min={1} step={1} value={minutes}
                           onChange={e => setMinutes(parseInt(e.target.value || '0'))}
                           style={{width: 80}}/>
                    {!running ? (
                        <button className="btn" onClick={start}>開始</button>
                    ) : (
                        <>
                            <span>残り {Math.floor((remaining||0)/60)}:{('0'+((remaining||0)%60)).slice(-2)}</span>
                            <button className="btn cancel-btn" onClick={cancel}>キャンセル</button>
                        </>
                    )}
                </div>

                {!running && (
                    <div className="preset-grid">
                        {[30,60,90,120].map(v => (
                            <button key={v} className="btn" onClick={() => setMinutes(v)}>{v}分</button>
                        ))}
                    </div>
                )}

                {!running && (
                    <div className="control-row">
                        <label>PCの動作:</label>
                        <label><input type="radio" name="pc-action" checked={pcAction==='shutdown'} onChange={() => setPcAction('shutdown')} /> シャットダウン</label>
                        <label><input type="radio" name="pc-action" checked={pcAction==='sleep'} onChange={() => setPcAction('sleep')} /> スリープ</label>
                    </div>
                )}

                <div style={{display:'flex', gap: 24, alignItems:'flex-start'}}>
                    <div style={{flex:1}}>
                        <h3>赤外線リモコン</h3>
                        {allInfrared.length === 0 && <div>なし</div>}
                        {allInfrared.map(d => (
                            <div key={d.id} style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid #333'}}>
                                <label style={{display:'flex', alignItems:'center', gap:8}}>
                                    <input type="checkbox" checked={!!selected[d.id]} onChange={() => toggle(d.id)} />
                                    <span>{d.name}</span>
                                </label>
                                <div style={{display:'flex', alignItems:'center', gap:8}}>
                                    <span style={{opacity:.7}}>電源コマンド: {getPowerCommand(d.id)}</span>
                                    <button className="btn" onClick={() => setPowerCommand(d.id, d.name)}>変更</button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{flex:1}}>
                        <h3>物理デバイス</h3>
                        {allPhysical.length === 0 && <div>なし</div>}
                        {allPhysical.map(d => (
                            <div key={d.id} style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid #333'}}>
                                <label style={{display:'flex', alignItems:'center', gap:8}}>
                                    <input type="checkbox" checked={!!selected[d.id]} onChange={() => toggle(d.id)} />
                                    <span>{d.name}</span>
                                </label>
                                <span style={{opacity:.7}}>{d.deviceType}</span>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
            <div className="log-panel">
                <h2>ログ</h2>
                <ul className="log-list">
                    {logs.map((l, idx) => (
                        <li key={idx} className={`log-entry ${l.type === 'error' ? 'log-error' : ''}`}>
                            <span className="log-timestamp">[{l.timestamp}]</span>
                            <span className="log-message">{l.message}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default GetReadyForSleep;
