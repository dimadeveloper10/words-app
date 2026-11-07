import { Link } from 'react-router-dom';
import { useOnlineStatus } from '../lib/useOnlineStatus';
import './AppHeader.css';

interface AppHeaderProps {
  email: string;
  onLogout: () => void;
}

export function AppHeader({ email, onLogout }: AppHeaderProps) {
  const isOnline = useOnlineStatus();

  return (
    <header className="app-header">
      <div className="app-header-inner">
        <Link className="brand" to="/" aria-label="Words home">
          Words
        </Link>
        <div className="header-account">
          {!isOnline && (
            <span className="header-offline" role="status">
              Offline
            </span>
          )}
          <span className="header-email" title={email}>
            {email}
          </span>
          <button className="auth-submit" type="button" onClick={onLogout}>
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
