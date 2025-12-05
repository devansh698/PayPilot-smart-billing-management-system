import React from 'react';
import Lottie from "lottie-react";
import animationData from "./animation/Animation - loading.json";
import './LoadingPage.css'; // Import the CSS file

const defaultOptions = {
  loop: true,
  autoplay: true, 
  animationData: animationData,
  rendererSettings: {
    preserveAspectRatio: 'xMidYMid slice'
  }
};

const LoadingPage = () => {
  return (
    <div className="loading-container"> {/* Use the CSS class for styling */}
      <Lottie animationData={animationData} loop="true" autoPlay="true"  height={400} width={400} />
    </div>
  );
};

export default LoadingPage;
