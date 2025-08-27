import {useState, useEffect} from 'react';
import './App.css';
import {SleepNow} from "../wailsjs/go/main/App";

function App() {
    const [resultText, setResultText] = useState("スリープタイマーを選択してください。");
    const [remainingTime, setRemainingTime] = useState<number | null>(null);

    const updateResultText = (result: string) => setResultText(result);

    useEffect(() => {
        // タイマーが作動していない場合は何もしない
        if (remainingTime === null) {
            return;
        }

        // タイマーが0になったらPCをスリープさせ、タイマーをリセット
        if (remainingTime <= 0) {
            setResultText("PCをスリープさせます...");
            SleepNow().then(updateResultText);
            setRemainingTime(null);
            return;
        }

        // 1秒ごとに残り時間を減らすタイマーを設定
        const intervalId = setInterval(() => {
            setRemainingTime(time => (time ? time - 1 : 0));
        }, 1000);

        // コンポーネントのアンマウント時やremainingTimeが変化した時にタイマーをクリア
        return () => clearInterval(intervalId);
    }, [remainingTime]);

    function handleTimerStart(minutes: number) {
        setResultText(`${minutes}分後にPCをスリープします。`);
        setRemainingTime(minutes * 60);
    }

    function handleCancel() {
        setRemainingTime(null); // タイマーを停止
        setResultText("タイマーをキャンセルしました。");
    }

    return (
        <div id="App">
            <div id="result" className="result">{resultText}</div>
            {remainingTime !== null ? (
                <div className="countdown-container">
                    <div className="countdown-display">{Math.floor(remainingTime / 60)}:{('0' + (remainingTime % 60)).slice(-2)}</div>
                    <button className="btn cancel-btn" onClick={handleCancel}>キャンセル</button>
                </div>
            ) : (
                <div className="button-grid">
                    <button className="btn" onClick={() => handleTimerStart(1)}>1分後</button>
                    <button className="btn" onClick={() => handleTimerStart(30)}>30分後</button>
                    <button className="btn" onClick={() => handleTimerStart(60)}>1時間後</button>
                    <button className="btn" onClick={() => handleTimerStart(90)}>1.5時間後</button>
                </div>
            )}
        </div>
    )
}

export default App
