import React from "react";
import Navbar from "./home/Navbar";
import Hero from "./home/Hero";
import Section1 from "./home/Section1";
import Section2 from "./home/Section2";
import Section3 from "./home/Section3";
import Section4 from "./home/Section4";
import Footer from "./home/Footer";
import FAX from "./home/FAX";
import { BrowserRouter, Route, Routes } from 'react-router-dom';

const Landing = () => {
  return (
    <div>
        <Navbar/>
        <Hero/>
        <Section1/>
        <Section2/>
        <Section3/>
        <Section4/>
        <FAX/>
        <Footer/>
        
    </div>
  )
}

export default Landing;