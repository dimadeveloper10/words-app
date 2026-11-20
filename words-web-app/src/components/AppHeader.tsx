import { type JSX, useState } from 'react';
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

export function AppHeader({ email, onLogout }: AppHeaderProps): JSX.Element {
  const isOnline = useOnlineStatus();
  const unsyncedCount = useUnsyncedAnswersCount();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const isConfirmVisible = confirmOpen && unsyncedCount > 0;

  function handleSignOut(): void {
    if (unsyncedCount > 0) {
      setConfirmOpen(true);
    } else {
      onLogout();
    }
  }

  return (
    <header className="app-header">
      <div className="app-header__inner">
        <Link
          className="brand app-header__brand"
          to="/"
          aria-label="Words home"
        >
          Words
        </Link>
        <div className="app-header__account">
          <div className="app-header__badges" role="status">
            {!isOnline && (
              <span className="app-header__badge app-header__badge--offline">
                Offline
              </span>
            )}
            {unsyncedCount > 0 && (
              <span className="app-header__badge app-header__badge--unsynced">
                {unsyncedCount} not synced
              </span>
            )}
          </div>
          <span className="app-header__email" title={email}>
            {email}
          </span>
          <button
            className="button button--primary app-header__sign-out"
            type="button"
            onClick={handleSignOut}
          >
            Sign out
          </button>
        </div>
      </div>
      <ConfirmDialog
        open={isConfirmVisible}
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
          className="button button--primary"
          autoFocus
          onClick={() => setConfirmOpen(false)}
        >
          Stay
        </button>
        <button
          type="button"
          className="button button--secondary"
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
