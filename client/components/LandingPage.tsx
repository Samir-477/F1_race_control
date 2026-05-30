import React, { useEffect, useRef } from 'react';
import API_URL from '../lib/config';
import type { Team } from '../types';
import RaceResults from './RaceResults';

interface LandingPageProps { teams: Team[]; }

const LandingPage: React.FC<LandingPageProps> = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sectionRef.current) sectionRef.current.id = 'explore-section';
  }, []);

  return (
    <div ref={sectionRef}>
      <RaceResults />
    </div>
  );
};

export default LandingPage;
