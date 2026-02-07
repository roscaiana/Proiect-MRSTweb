// @ts-ignore
import React from 'react';
import './Header.css';
const Header: React.FC = () => {
    return (
        <header className="main-header">
            <div className="container flex-between">
                <div className="logo-area">
                    <h1>EduElectoral</h1>
                </div>
                <nav className="main-nav">
                    <ul>
                        <li><a href="#" className="active">Acasă</a></li>
                        <li><a href="#">Cursuri</a></li>
                        <li><a href="#">Resurse</a></li>
                        <li><a href="#">Contact</a></li>
                    </ul>
                </nav>
            </div>
        </header>
    );
};

export default Header;