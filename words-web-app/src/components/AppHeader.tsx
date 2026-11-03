import { Link } from 'react-router-dom';
import './AppHeader.css';

interface AppHeaderProps {
  email: string;
  onLogout: () => void;
}

export function AppHeader({ email, onLogout }: AppHeaderProps) {
  return (
    <header className="app-header">
      <div className="app-header-inner">
        <Link className="brand" to="/" aria-label="Words home">
          Words
        </Link>
        <div className="header-account">
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
