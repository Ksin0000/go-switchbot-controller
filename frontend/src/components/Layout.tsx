import { Link, Outlet } from 'react-router-dom';
import '../App.css'; // for .back-link style

export default function Layout() {
  return (
    <div>
      <Link to="/" className="back-link">＜ ホームに戻る</Link>
      <Outlet />
    </div>
  );
}

