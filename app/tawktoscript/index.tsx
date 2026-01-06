'use client';

import { useEffect } from 'react';

const TawkToScript = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://embed.tawk.to/68487270377411190a404de8/1itdfu1rf';
    script.charset = 'UTF-8';
    script.setAttribute('crossorigin', '*');
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script); // Clean up if needed
    };
  }, []);

  return null;
};


export default TawkToScript;
