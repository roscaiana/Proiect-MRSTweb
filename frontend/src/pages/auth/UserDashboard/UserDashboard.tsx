import React from "react";
import UserAppointmentsCard from "./UserAppointmentsCard";
import UserPackageStatsCard from "./UserPackageStatsCard";
import UserProfileCard from "./UserProfileCard";
import UserQuickActionsCard from "./UserQuickActionsCard";
import UserStatsCard from "./UserStatsCard";
import { useUserDashboardController } from "./useUserDashboardController";
import "./UserDashboard.css";

const UserDashboard: React.FC = () => {
    const controller = useUserDashboardController();
    const averageScore = controller.sortedUserQuizHistory.length > 0
        ? Math.round(controller.sortedUserQuizHistory.reduce((acc, q) => acc + q.score, 0) / controller.sortedUserQuizHistory.length)
        : 0;
    const passedTests = controller.sortedUserQuizHistory.filter((q) => q.score >= controller.passThreshold).length;

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Profilul meu</h1>
                <p>Bine ai revenit, {controller.profileDisplayName}!</p>
            </div>

            <div className="dashboard-grid">
                <UserProfileCard
                    userEmail={controller.user?.email}
                    userCreatedAt={controller.user?.createdAt}
                    userAvatarDataUrl={controller.user?.avatarDataUrl}
                    avatarInputRef={controller.avatarInputRef}
                    profileDisplayName={controller.profileDisplayName}
                    profileAvatarPreview={controller.profileAvatarPreview}
                    profileAvatarInitial={controller.profileAvatarInitial}
                    profileDraft={controller.profileDraft}
                    profileError={controller.profileError}
                    profileMessage={controller.profileMessage}
                    isProfileSaving={controller.isProfileSaving}
                    isProfileEditorOpen={controller.isProfileEditorOpen}
                    onToggleEditor={() => {
                        if (controller.isProfileEditorOpen) controller.resetProfileDraft();
                        controller.setIsProfileEditorOpen((prev) => !prev);
                    }}
                    onFieldChange={controller.handleProfileFieldChange}
                    onAvatarChange={controller.handleProfileAvatarChange}
                    onAvatarRemove={controller.handleRemoveProfileAvatar}
                    onReset={controller.resetProfileDraft}
                    onSubmit={controller.handleProfileSave}
                />
                <UserStatsCard totalCompletedTests={controller.userQuizHistory.length} averageScore={averageScore} passedTests={passedTests} />
                <UserAppointmentsCard
                    appointments={controller.visibleAppointments}
                    totalAppointmentsCount={controller.userAppointments.length}
                    hasMoreAppointments={controller.hasMoreAppointments}
                    maxReschedulesPerUser={controller.examSettings.maxReschedulesPerUser}
                    canCancel={controller.canCancelAppointment}
                    canReschedule={controller.canRescheduleAppointment}
                    onReschedule={controller.handleRescheduleAppointment}
                    onCancel={controller.handleCancelAppointment}
                />
                <UserPackageStatsCard packagePerformance={controller.packagePerformance} overallPassRate={controller.overallPassRate} bestPackage={controller.bestPackage} />
                <UserQuickActionsCard />
            </div>
        </div>
    );
};

export default UserDashboard;
