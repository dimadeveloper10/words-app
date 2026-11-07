import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useUnsyncedAnswersCount } from '../features/word-answers/useWordAnswers';
import { useOnlineStatus } from '../lib/useOnlineStatus';
import { ConfirmDialog } from './ConfirmDialog';
import './AppHeader.css';

interface AppHeaderProps {
  email: string;
  onLogout: () => void;
}

function unsyncedTitle(count: number): string {
  return count === 1
    ? "1 answer hasn't synced yet"
    : `${count} answers haven't synced yet`;
}

export function AppHeader({ email, onLogout }: AppHeaderProps) {
  const isOnline = useOnlineStatus();
  const unsyncedCount = useUnsyncedAnswersCount();
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (confirmOpen && unsyncedCount === 0) {
    setConfirmOpen(false);
  }

  function handleSignOut() {
    if (unsyncedCount > 0) {
      setConfirmOpen(true);
    } else {
      onLogout();
    }
  }

  return (
    <header className="app-header">
      <div className="app-header-inner">
        <Link className="brand" to="/" aria-label="Words home">
          Words
        </Link>
        <div className="header-account">
          <div className="header-badges" role="status">
            {!isOnline && <span className="header-offline">Offline</span>}
            {unsyncedCount > 0 && (
              <span className="header-unsynced">
                {unsyncedCount} not synced
              </span>
            )}
          </div>
          <span className="header-email" title={email}>
            {email}
          </span>
          <button className="auth-submit" type="button" onClick={handleSignOut}>
            Sign out
          </button>
        </div>
      </div>
      <ConfirmDialog
        open={confirmOpen}
        title={unsyncedTitle(unsyncedCount)}
        description={
          isOnline
            ? 'Signing out now will delete them. Wait a moment so they can sync.'
            : 'Signing out will delete them. Go online so they can sync first.'
        }
        onCancel={() => setConfirmOpen(false)}
      >
        <button
          type="button"
          className="auth-submit"
          autoFocus
          onClick={() => setConfirmOpen(false)}
        >
          Stay
        </button>
        <button
          type="button"
          className="confirm-dialog-secondary"
          onClick={() => {
            setConfirmOpen(false);
            onLogout();
          }}
        >
          Sign out anyway
        </button>
      </ConfirmDialog>
    </header>
  );
}
