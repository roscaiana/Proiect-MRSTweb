// @ts-ignore
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Support from './pages/Support';
import Contact from './pages/Contact';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/support" element={<Support />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/" element={<div>Pagina principala</div>} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
