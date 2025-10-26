
import React from 'react';

const F1Logo: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 100 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 40V0H30L35 15H5V40H0Z" fill="white"/>
    <path d="M40 0H45V40H40V0Z" fill="white"/>
    <path d="M55 0L70 40H60L50 10L55 0Z" fill="#E10600"/>
    <path d="M75 0H100L95 20H80V0H75Z" fill="white"/>
    <path d="M80 25H95L90 40H75V25H80Z" fill="white"/>
  </svg>
);

export default F1Logo;
