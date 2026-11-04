import type { MouseEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export function useGoBack() {
  const navigate = useNavigate();
  const location = useLocation();
  const hasAppHistory = location.key !== 'default';

  return function goBack(event: MouseEvent<HTMLAnchorElement>) {
    const opensNewTab =
      event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey;
    if (!hasAppHistory || opensNewTab) return;
    event.preventDefault();
    void navigate(-1);
  };
}
