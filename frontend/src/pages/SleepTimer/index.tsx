import {useState, useEffect} from 'react';
import './style.css';
import {SleepNow} from "../../../wailsjs/go/main/App";

function SleepTimer() {
    const [resultText, setResultText] = useState("スリープタイマーを選択してください。");
    const [remainingTime, setRemainingTime] = useState<number | null>(null);
    const [isTimerRunning, setIsTimerRunning] = useState(false);

    // タイマーのカウントダウンを管理するEffect
    useEffect(() => {
        if (!isTimerRunning) {
            return;
        }

        const intervalId = setInterval(() => {
            setRemainingTime(time => (time ? time - 1 : null));
        }, 1000);

        return () => clearInterval(intervalId);
    }, [isTimerRunning]);

    // 残り時間が0になった時の処理を管理するEffect
    useEffect(() => {
        if (remainingTime === 0) {
            setIsTimerRunning(false);
            setResultText("PCをスリープさせます...");
            SleepNow().then(setResultText);
            setRemainingTime(null);
        }
    }, [remainingTime]);

    function handleTimerStart(minutes: number) {
        setResultText(`${minutes}分後にPCをスリープします。`);
        setRemainingTime(minutes * 60);
        setIsTimerRunning(true);
    }

    function handleCancel() {
        setIsTimerRunning(false);
        setRemainingTime(null);
        setResultText("タイマーをキャンセルしました。");
    }

    return (
        <div className="sleep-timer-container">
            <h2>PCスリープタイマー</h2>
            <div id="result" className="result">{resultText}</div>
            {isTimerRunning && remainingTime !== null ? (
                <div className="countdown-container">
                    <div className="countdown-display">{Math.floor(remainingTime / 60)}:{('0' + (remainingTime % 60)).slice(-2)}</div>
                    <button className="btn cancel-btn" onClick={handleCancel}>キャンセル</button>
                </div>
            ) : (
                <div className="button-grid">
                    <button className="btn" onClick={() => handleTimerStart(30)}>30分</button>
                    <button className="btn" onClick={() => handleTimerStart(60)}>60分</button>
                    <button className="btn" onClick={() => handleTimerStart(90)}>90分</button>
                    <button className="btn" onClick={() => handleTimerStart(120)}>120分</button>
                </div>
            )}
        </div>
    )
}

export default SleepTimer;