using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace e_ElectoralWeb.DataAccessLayer.Migrations
{
    /// <inheritdoc />
    public partial class AddExamSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ExamSettings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TestQuestionCount = table.Column<int>(type: "int", nullable: false),
                    TestDurationMinutes = table.Column<int>(type: "int", nullable: false),
                    PassingThreshold = table.Column<int>(type: "int", nullable: false),
                    AppointmentsPerDay = table.Column<int>(type: "int", nullable: false),
                    AppointmentLeadTimeHours = table.Column<int>(type: "int", nullable: false),
                    MaxReschedulesPerUser = table.Column<int>(type: "int", nullable: false),
                    RejectionCooldownDays = table.Column<int>(type: "int", nullable: false),
                    AppointmentLocation = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    AppointmentRoom = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    AllowedWeekdays = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    BlockedDates = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CapacityOverrides = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SlotOverrides = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExamSettings", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ExamSettings");
        }
    }
}
