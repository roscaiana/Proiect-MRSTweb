import type { RefObject } from "react";
import type { UpdateUserProfileInput } from "../../../types/user";

type UserProfileEditorFormProps = {
    avatarInputRef: RefObject<HTMLInputElement | null>;
    userAvatarDataUrl?: string;
    profileDraft: UpdateUserProfileInput;
    profileError: string;
    profileMessage: string;
    isProfileSaving: boolean;
    onFieldChange: (field: keyof UpdateUserProfileInput, value: string) => void;
    onAvatarChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onAvatarRemove: () => void;
    onReset: () => void;
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

export default function UserProfileEditorForm({
    avatarInputRef,
    userAvatarDataUrl,
    profileDraft,
    profileError,
    profileMessage,
    isProfileSaving,
    onFieldChange,
    onAvatarChange,
    onAvatarRemove,
    onReset,
    onSubmit,
}: UserProfileEditorFormProps) {
    return (
        <form className="profile-form" onSubmit={onSubmit}>
            <input ref={avatarInputRef} type="file" accept="image/*" className="profile-avatar-file-input" onChange={onAvatarChange} />
            <div className="profile-avatar-actions">
                <button type="button" className="dashboard-mini-btn" onClick={() => avatarInputRef.current?.click()}>
                    Schimbă poza
                </button>
                <button type="button" className="dashboard-mini-btn" onClick={onAvatarRemove} disabled={!profileDraft.avatarDataUrl && !userAvatarDataUrl}>
                    Elimină poza
                </button>
            </div>

            <div className="profile-form-grid">
                <label className="profile-form-field">
                    <span>Poreclă / Nickname</span>
                    <input type="text" value={profileDraft.nickname || ""} onChange={(event) => onFieldChange("nickname", event.target.value)} placeholder="Ex: Ionel" />
                </label>
                <label className="profile-form-field">
                    <span>Nume complet</span>
                    <input type="text" value={profileDraft.fullName} onChange={(event) => onFieldChange("fullName", event.target.value)} placeholder="Ex: Ion Popescu" required />
                </label>
                <label className="profile-form-field">
                    <span>Email</span>
                    <input type="email" value={profileDraft.email} onChange={(event) => onFieldChange("email", event.target.value)} placeholder="utilizator@exemplu.com" required />
                </label>
                <label className="profile-form-field">
                    <span>Telefon</span>
                    <input type="tel" value={profileDraft.phoneNumber || ""} onChange={(event) => onFieldChange("phoneNumber", event.target.value)} placeholder="+373 69 000 000" />
                </label>
            </div>

            {(profileError || profileMessage) && <p className={`profile-form-feedback ${profileError ? "error" : "success"}`}>{profileError || profileMessage}</p>}

            <div className="profile-form-actions">
                <button type="button" className="dashboard-mini-btn" onClick={onReset} disabled={isProfileSaving}>
                    Resetează
                </button>
                <button type="submit" className="profile-save-btn" disabled={isProfileSaving}>
                    {isProfileSaving ? "Se salvează..." : "Salvează profilul"}
                </button>
            </div>
        </form>
    );
}
