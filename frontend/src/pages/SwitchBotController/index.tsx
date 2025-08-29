import { useState } from 'react';
import '../../App.css'; // 共通スタイルをインポート
import { GiCeilingLight } from 'react-icons/gi';
import { LuTv } from 'react-icons/lu';
import './style.css';
import { HandleCeilingLight, HandleTv } from '../../../wailsjs/go/main/App';

function SwitchBotController() {
    const [message, setMessage] = useState('ボタンを押して操作します。');

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