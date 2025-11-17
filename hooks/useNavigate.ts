import { useCallback } from 'react';

// Custom hook for hash-based navigation
export const useNavigate = () => {
  const navigate = useCallback((path: string) => {
    window.location.hash = path;
  }, []); // Empty dependency array means this function is created once

  return navigate;
};