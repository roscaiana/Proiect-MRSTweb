type AppointmentStep4FormProps = {
    fullName: string;
    idOrPhone: string;
    fullNameError: string | undefined;
    idOrPhoneError: string | undefined;
    onFullNameChange: (value: string) => void;
    onIdOrPhoneChange: (value: string) => void;
};

const ALLOWED_PHONE_PREFIXES = ['068', '069', '078', '079'];

const isAllowedPhonePrefixProgress = (value: string) => {
    if (!value) return true;
    return ALLOWED_PHONE_PREFIXES.some((prefix) => prefix.startsWith(value) || value.startsWith(prefix));
};

export default function AppointmentStep4Form({
    fullName,
    idOrPhone,
    fullNameError,
    idOrPhoneError,
    onFullNameChange,
    onIdOrPhoneChange,
}: AppointmentStep4FormProps) {
    return (
        <div className="form-card full-width">
            <div className="card-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                </svg>
            </div>
            <h3>Informații Personale</h3>
            <p className="card-description">
                Introduceți datele personale pentru confirmare.
            </p>

            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="fullName">
                        Nume Complet <span className="required">*</span>
                    </label>
                    <input
                        type="text"
                        id="fullName"
                        className={`text-input ${fullNameError ? 'error' : ''}`}
                        placeholder="Ex: Ion Popescu"
                        value={fullName}
                        onChange={(e) => onFullNameChange(e.target.value)}
                    />
                    {fullNameError && <span className="error-message">{fullNameError}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="idOrPhone">
                        Număr de Telefon <span className="required">*</span>
                    </label>
                    <input
                        type="text"
                        id="idOrPhone"
                        className={`text-input ${idOrPhoneError ? 'error' : ''}`}
                        placeholder="Ex: 069123456"
                        inputMode="numeric"
                        pattern="0(68|69|78|79)[0-9]{6}"
                        title="Numărul trebuie să înceapă cu 068, 069, 078 sau 079 și să aibă 9 cifre."
                        maxLength={9}
                        value={idOrPhone}
                        onChange={(e) => {
                            const onlyDigits = e.target.value.replace(/\D/g, '').slice(0, 9);
                            if (!isAllowedPhonePrefixProgress(onlyDigits)) {
                                return;
                            }
                            onIdOrPhoneChange(onlyDigits);
                        }}
                    />
                    {idOrPhoneError && <span className="error-message">{idOrPhoneError}</span>}
                </div>
            </div>
        </div>
    );
}
