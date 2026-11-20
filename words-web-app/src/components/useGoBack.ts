import type { MouseEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export type GoBack = (event: MouseEvent<HTMLAnchorElement>) => void;

export function useGoBack(): GoBack {
  const navigate = useNavigate();
  const location = useLocation();
  const hasAppHistory = location.key !== 'default';

  return function goBack(event) {
    const opensNewTab =
      event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey;
    if (!hasAppHistory || opensNewTab) {
      return;
    }
    event.preventDefault();
    void navigate(-1);
  };
}
