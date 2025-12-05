import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Navbar, Nav, NavItem, Button } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';

const NavbarComponent = () => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const isLoginPage = location.pathname === '/login';

    return (
        <Navbar className="navbar navbar-expand-lg navbar-light bg-light">
            <Link to="/" className="navbar-brand">PayPilot</Link>
            <button className="navbar-toggler" type="button" onClick={toggleMenu}>
                <span className="navbar-toggler-icon"></span>
            </button>
            <div className={`collapse navbar-collapse ${isOpen ? 'show' : ''}`}>
                <Nav className="ml-auto">
                    {!isLoginPage && (
                        <>
                            <NavItem>
                                <Link to="#section1" className="nav-link" onClick={toggleMenu}>About</Link>
                            </NavItem>
                            <NavItem>
                                <Link to="#section4" className="nav-link" onClick={toggleMenu}>Products</Link>
                            </NavItem>
                            <NavItem>
                                <Link to="#section3" className="nav-link" onClick={toggleMenu}>For You</Link>
                            </NavItem>
                            <NavItem>
                                <Link to="#section5" className="nav-link" onClick={toggleMenu}>FAQ</Link>
                            </NavItem>
                        </>
                    )}
                    <NavItem>
                        <Link to="/login">
                            <Button color="primary" className="nav-btn">Login</Button>
                        </Link>
                    </NavItem>
                    <NavItem>
                        <Link to="/register">
                            <Button color="secondary" className="nav-btn">Signup</Button>
                        </Link>
                    </NavItem>
                </Nav>
            </div>
        </Navbar>
    );
};

export default NavbarComponent;