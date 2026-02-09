import React from 'react';

const Contact: React.FC = () => {
    return (
        <div className="bg-slate-50 min-h-screen">
            {/* Header Section */}
            <div className="bg-[#003366] text-white py-16 px-4">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-4xl font-bold mb-4">Contactați-ne</h1>
                    <p className="text-slate-300 max-w-2xl mx-auto text-lg leading-relaxed">
                        Suntem aici să vă răspundem la orice întrebare legată de platforma e-Electoral și procesul de certificare.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Contact;