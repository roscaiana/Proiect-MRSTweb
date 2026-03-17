import type { RefObject } from "react";
import { formatDateTimeLong } from "../../../utils/dateUtils";
import type { UpdateUserProfileInput } from "../../../types/user";
import UserProfileEditorForm from "./UserProfileEditorForm";

type UserProfileCardProps = {
    userEmail?: string;
    userCreatedAt?: string | Date;
    userAvatarDataUrl?: string;
    avatarInputRef: RefObject<HTMLInputElement | null>;
    profileDisplayName: string;
    profileAvatarPreview: string;
    profileAvatarInitial: string;
    profileDraft: UpdateUserProfileInput;
    profileError: string;
    profileMessage: string;
    isProfileSaving: boolean;
    isProfileEditorOpen: boolean;
    onToggleEditor: () => void;
    onFieldChange: (field: keyof UpdateUserProfileInput, value: string) => void;
    onAvatarChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onAvatarRemove: () => void;
    onReset: () => void;
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

export default function UserProfileCard({
    userEmail,
    userCreatedAt,
    userAvatarDataUrl,
    avatarInputRef,
    profileDisplayName,
    profileAvatarPreview,
    profileAvatarInitial,
    profileDraft,
    profileError,
    profileMessage,
    isProfileSaving,
    isProfileEditorOpen,
    onToggleEditor,
    onFieldChange,
    onAvatarChange,
    onAvatarRemove,
    onReset,
    onSubmit,
}: UserProfileCardProps) {
    return (
        <div className="dashboard-card profile-card">
            <div className="card-header">
                <h2>Profilul Meu</h2>
            </div>
            <div className="profile-info">
                <div className="profile-avatar profile-avatar-editable">
                    {profileAvatarPreview ? <img src={profileAvatarPreview} alt="Poza de profil" className="profile-avatar-image" /> : <span>{profileAvatarInitial}</span>}
                </div>
                <div className="profile-details">
                    <h3>{profileDisplayName}</h3>
                    <p className="profile-email">{userEmail}</p>
                    <p className="profile-role"><span className="role-badge">Candidat</span></p>
                    <p className="profile-date">Înregistrat: {userCreatedAt ? formatDateTimeLong(userCreatedAt.toString()) : "N/A"}</p>
                </div>
                <div className="profile-primary-actions">
                    <button type="button" className="profile-toggle-btn" onClick={onToggleEditor}>
                        {isProfileEditorOpen ? "Închide editorul" : "Editează profilul"}
                    </button>
                </div>
                {isProfileEditorOpen && (
                    <UserProfileEditorForm
                        avatarInputRef={avatarInputRef}
                        userAvatarDataUrl={userAvatarDataUrl}
                        profileDraft={profileDraft}
                        profileError={profileError}
                        profileMessage={profileMessage}
                        isProfileSaving={isProfileSaving}
                        onFieldChange={onFieldChange}
                        onAvatarChange={onAvatarChange}
                        onAvatarRemove={onAvatarRemove}
                        onReset={onReset}
                        onSubmit={onSubmit}
                    />
                )}
            </div>
        </div>
    );
}
