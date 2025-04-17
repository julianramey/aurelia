
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// This component handles smooth scrolling to anchor links
export const ScrollToSection = () => {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [hash]);

  return null;
};

export default ScrollToSection;
