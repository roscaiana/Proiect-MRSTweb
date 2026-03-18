import AppointmentStep1Calendar from './AppointmentStep1Calendar';
import AppointmentStep3Slots from './AppointmentStep3Slots';
import AppointmentStep4Form from './AppointmentStep4Form';
import type { AppointmentPageController } from './useAppointmentPageController';
import { WIZARD_TAB_LABELS } from './useAppointmentPageController';

type AppointmentWizardTabContentProps = {
    controller: AppointmentPageController;
};

export default function AppointmentWizardTabContent({ controller }: AppointmentWizardTabContentProps) {
    const {
        activeTab,
        isCalendarOpen,
        calendarPickerRef,
        toggleCalendar,
        calendarMonth,
        canNavigatePrevMonth,
        canNavigateNextMonth,
        goToPreviousMonth,
        goToNextMonth,
        calendarDays,
        formData,
        selectedDateLabel,
        selectedBlockedEntry,
        availabilityPreviewDays,
        selectedDateKey,
        examSettings,
        minDate,
        maxDate,
        errors,
        handleCalendarDaySelect,
        handleDateValueChange,
        getMonthName,
        getDayName,
        formatDate,
        allowedWeekdayNames,
        availableSlots,
        slotFilter,
        recommendedSlot,
        remainingAppointmentsForDay,
        currentDayCapacity,
        setSlotFilter,
        handleSlotSelect,
        handleFullNameChange,
        handleIdOrPhoneChange,
    } = controller;

    return (
        <>
            <div
                className="form-grid wizard-single-tab"
                role="tabpanel"
                aria-live="polite"
                aria-label={`Pasul ${activeTab}: ${WIZARD_TAB_LABELS[activeTab - 1]}`}
            >
                {activeTab === 1 && (
                    <AppointmentStep1Calendar
                        isCalendarOpen={isCalendarOpen}
                        calendarPickerRef={calendarPickerRef}
                        onToggleCalendar={toggleCalendar}
                        calendarMonth={calendarMonth}
                        canNavigatePrevMonth={canNavigatePrevMonth}
                        canNavigateNextMonth={canNavigateNextMonth}
                        onPrevMonth={goToPreviousMonth}
                        onNextMonth={goToNextMonth}
                        calendarDays={calendarDays}
                        selectedDate={formData.selectedDate}
                        selectedDateLabel={selectedDateLabel}
                        selectedBlockedEntry={selectedBlockedEntry}
                        availabilityPreviewDays={availabilityPreviewDays}
                        selectedDateKey={selectedDateKey}
                        leadTimeHours={examSettings.appointmentLeadTimeHours}
                        minDate={minDate}
                        maxDate={maxDate}
                        error={errors.date}
                        onDaySelect={handleCalendarDaySelect}
                        onAvailabilitySelect={handleDateValueChange}
                        getMonthName={getMonthName}
                        getDayName={getDayName}
                        formatDate={formatDate}
                        allowedWeekdayNames={allowedWeekdayNames}
                    />
                )}

                {activeTab === 2 && (
                    <AppointmentStep3Slots
                        availableSlots={availableSlots}
                        slotFilter={slotFilter}
                        selectedSlotId={formData.selectedSlot?.id}
                        recommendedSlot={recommendedSlot}
                        remainingAppointmentsForDay={remainingAppointmentsForDay}
                        currentDayCapacity={currentDayCapacity}
                        selectedDate={formData.selectedDate}
                        error={errors.slot}
                        onFilterChange={setSlotFilter}
                        onSlotSelect={handleSlotSelect}
                    />
                )}

                {activeTab === 3 && (
                    <AppointmentStep4Form
                        fullName={formData.fullName}
                        idOrPhone={formData.idOrPhone}
                        fullNameError={errors.fullName}
                        idOrPhoneError={errors.idOrPhone}
                        onFullNameChange={handleFullNameChange}
                        onIdOrPhoneChange={handleIdOrPhoneChange}
                    />
                )}
            </div>

            {activeTab === 4 && (
                <>
                    <div className="appointment-next-steps">
                        <h4>Verifică datele și trimite cererea</h4>
                        <ul>
                            <li>Revizuiește sumarul programării de mai sus.</li>
                            <li>După trimitere, cererea intră în așteptare pentru confirmare.</li>
                            <li>Statusul se actualizează în dashboard și prin notificări.</li>
                        </ul>
                    </div>

                    <div className="info-box">
                        <div className="info-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="16" x2="12" y2="12" />
                                <line x1="12" y1="8" x2="12.01" y2="8" />
                            </svg>
                        </div>
                        <div className="info-content">
                            <h4>Informații importante</h4>
                            <ul>
                                <li>Examenul durează aproximativ {examSettings.testDurationMinutes} minute</li>
                                <li>Limită zilnică configurată de admin: {examSettings.appointmentsPerDay} programări</li>
                                <li>Programarea se face cu minim {examSettings.appointmentLeadTimeHours} ore înainte</li>
                                <li>Maxim {examSettings.maxReschedulesPerUser} reprogramări pentru aceeași cerere</li>
                                <li>Cooldown după respingere: {examSettings.rejectionCooldownDays} zile</li>
                                <li>Locație examen: {examSettings.appointmentLocation}, {examSettings.appointmentRoom}</li>
                                <li>Prezintă-te cu 15 minute înainte de ora programării</li>
                                <li>Este necesar să ai actul de identitate asupra ta</li>
                            </ul>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
