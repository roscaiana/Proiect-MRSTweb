using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace e_ElectoralWeb.DataAccessLayer.UserMigrations
{
    /// <inheritdoc />
    public partial class RevertPhoneTo12 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Trim any phone values exceeding 12 chars before shrinking the column
            migrationBuilder.Sql("UPDATE [Users] SET [Phone] = LEFT([Phone], 12) WHERE LEN([Phone]) > 12");

            migrationBuilder.AlterColumn<string>(
                name: "Phone",
                table: "Users",
                type: "nvarchar(12)",
                maxLength: 12,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(20)",
                oldMaxLength: 20);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Phone",
                table: "Users",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(12)",
                oldMaxLength: 12);
        }
    }
}
