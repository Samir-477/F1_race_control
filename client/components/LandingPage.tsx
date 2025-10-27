import React, { useState, useRef } from 'react';
import type { Team, Race, Driver } from '../types';
import RaceResults from './RaceResults';

interface LandingPageProps {
  teams: Team[];
  races: Race[];
}

interface TopPerformerCardProps {
  driver: Driver;
  team: Team;
  isVisible: boolean;
}

const TopPerformerCard: React.FC<TopPerformerCardProps> = ({ driver, team, isVisible }) => {
  return (
    <div className={`relative w-full max-w-md transition-all duration-700 ease-in-out text-left ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="flex flex-col items-start">
            <h3 className="text-3xl font-bold">{driver.name}</h3>
            <p className="text-md text-gray-400 mt-2">Top Performer</p>
            <div className="w-1/4 border-t border-white/30 my-6"></div>
            <p className="text-gray-300 text-base leading-relaxed">
              {team.description}
            </p>
        </div>
    </div>
  );
};


const LandingPage: React.FC<LandingPageProps> = ({ teams, races }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animating, setAnimating] = useState(false);
  const raceResultsRef = useRef<HTMLDivElement>(null);

  const handleNext = (e: React.MouseEvent<HTMLDivElement>) => {
    // Prevent cycling teams if a click is on the header/nav elements
    if ((e.target as HTMLElement).closest('nav')) {
      return;
    }
    if (animating) return;
    setAnimating(true);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % teams.length);
      setAnimating(false);
    }, 800);
  };
  
  const currentTeam = teams[currentIndex];
  const topPerformer = currentTeam.topPerformer;

  const exploreNow = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // Prevents the main container's onClick from firing
    raceResultsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  return (
    <>
      <div className="relative w-full h-screen overflow-hidden" onClick={handleNext}>
        <div id="back" className="absolute inset-0">
          {teams.map((team, index) => (
            <div
              key={team.id}
              className={`absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ${index === currentIndex ? 'opacity-100' : 'opacity-0'}`}
              style={{ backgroundImage: `url('${team.backgroundImageUrl}')` }}
              aria-hidden={index === currentIndex ? 'false' : 'true'}
            >
              {/* lowered overlay opacity so background image is more visible */}
              <div className="absolute inset-0 bg-black/30"></div>
            </div>
          ))}
        </div>

        <div id="top" className="relative z-10 w-full h-full flex items-center">
          <div id="workingarea" className="w-[90%] max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center text-white">
            <div id="heroleft" className="w-full">
              <div className="relative h-[8.5vw] overflow-hidden">
                {teams.map((team, index) => (
                  <h1
                    key={team.id}
                    className={`absolute top-0 left-0 text-[8.5vw] font-black leading-none uppercase transition-transform duration-700 ease-in-out
                      ${currentIndex === index ? 'translate-y-0' : 'translate-y-full'}
                      ${(currentIndex - 1 + teams.length) % teams.length === index ? '-translate-y-full' : ''}`}
                    style={{ WebkitTextStroke: '2px white', color: 'transparent' }}
                  >
                    {team.sponsors.length > 0 ? team.sponsors[0].name : team.name}
                  </h1>
                ))}
              </div>
              <div className="relative h-[8.5vw] overflow-hidden">
                 {teams.map((team, index) => (
                  <h1
                    key={team.id}
                    className={`absolute top-0 left-0 text-[8.5vw] font-black leading-none uppercase transition-transform duration-700 ease-in-out
                      ${currentIndex === index ? 'translate-y-0' : 'translate-y-full'}
                      ${(currentIndex - 1 + teams.length) % teams.length === index ? '-translate-y-full' : ''}`}
                  >
                     {team.sponsors.length > 0 ? team.name : ''}
                  </h1>
                ))}
              </div>
              <button onClick={exploreNow} className="pointer-events-auto mt-8 px-8 py-3 text-xl font-bold uppercase bg-white text-black border-2 border-white hover:bg-transparent hover:text-white transition-all duration-300">
                Explore Now
              </button>
            </div>
            <div id="heroright" className="w-full hidden md:flex justify-end">
              <TopPerformerCard driver={topPerformer} team={currentTeam} isVisible={!animating} />
            </div>
          </div>
        </div>
      </div>
      <div ref={raceResultsRef}>
        <RaceResults races={races} />
      </div>
    </>
  );
};

export default LandingPage;