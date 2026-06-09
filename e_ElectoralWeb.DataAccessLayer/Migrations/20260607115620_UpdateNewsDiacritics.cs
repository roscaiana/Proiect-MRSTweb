using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace e_ElectoralWeb.DataAccessLayer.Migrations
{
    /// <inheritdoc />
    public partial class UpdateNewsDiacritics : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                UPDATE News
                SET Description = N'CICDE a publicat programul examenelor pentru sesiunea 2026. Examenele se desfășoară în format fizic și virtual, iar înscrierea se face din contul de utilizator aprobat.'
                WHERE SourceUrl = N'https://certificare.cicde.md/news/show/44';

                UPDATE News
                SET Description = N'În sesiunea 2025 au fost organizate 565 examene, cu 9570 participanți. Au promovat 7764 candidați, iar rata de promovare pe sesiune a fost de 82,3%.'
                WHERE SourceUrl = N'https://certificare.cicde.md/news/show/43';

                UPDATE News
                SET Description = N'Comisia Electorală Centrală a aprobat noua redacție a Regulamentului privind certificarea formării/specializării în domeniul electoral, cu aplicare în SICDE.'
                WHERE SourceUrl = N'https://certificare.cicde.md/news/show/14';

                UPDATE News
                SET
                    Title = N'18-24 mai 2026: totaluri săptămânale',
                    Description = N'Au fost desfășurate 5 examene cu prezență fizică în raioane. Din 72 participanți, 61 au promovat, cu rata de promovare de 84,72%.',
                    Category = N'Totaluri săptămânale'
                WHERE SourceUrl = N'https://certificare.cicde.md/news/show/50';

                UPDATE News
                SET
                    Title = N'04-17 mai 2026: totaluri săptămânale',
                    Description = N'CICDE a organizat 4 examene de certificare (online și fizic). Au participat 47 persoane, iar 41 au obținut certificatul de calificare.',
                    Category = N'Totaluri săptămânale'
                WHERE SourceUrl = N'https://certificare.cicde.md/news/show/49';

                UPDATE News
                SET
                    Title = N'20 aprilie - 3 mai 2026: totaluri săptămânale',
                    Description = N'În perioada de referință au avut loc 3 examene online. Au participat 55 persoane, dintre care 44 au promovat, cu o rată de 80%.',
                    Category = N'Totaluri săptămânale'
                WHERE SourceUrl = N'https://certificare.cicde.md/news/show/48';
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                UPDATE News
                SET Description = N'CICDE a publicat programul examenelor pentru sesiunea 2026. Examenele se desfasoara in format fizic si virtual, iar inscrierea se face din contul de utilizator aprobat.'
                WHERE SourceUrl = N'https://certificare.cicde.md/news/show/44';

                UPDATE News
                SET Description = N'In sesiunea 2025 au fost organizate 565 examene, cu 9570 participanti. Au promovat 7764 candidati, iar rata de promovare pe sesiune a fost de 82,3%.'
                WHERE SourceUrl = N'https://certificare.cicde.md/news/show/43';

                UPDATE News
                SET Description = N'Comisia Electorala Centrala a aprobat noua redactie a Regulamentului privind certificarea formarii/specializarii in domeniul electoral, cu aplicare in SICDE.'
                WHERE SourceUrl = N'https://certificare.cicde.md/news/show/14';

                UPDATE News
                SET
                    Title = N'18-24 mai 2026: totalurile saptamanii',
                    Description = N'Au fost desfasurate 5 examene cu prezenta fizica in raioane. Din 72 participanti, 61 au promovat, cu rata de promovare de 84,72%.',
                    Category = N'Totaluri saptamanale'
                WHERE SourceUrl = N'https://certificare.cicde.md/news/show/50';

                UPDATE News
                SET
                    Title = N'04-17 mai 2026: totaluri saptamanale',
                    Description = N'CICDE a organizat 4 examene de certificare (online si fizic). Au participat 47 persoane, iar 41 au obtinut certificatul de calificare.',
                    Category = N'Totaluri saptamanale'
                WHERE SourceUrl = N'https://certificare.cicde.md/news/show/49';

                UPDATE News
                SET
                    Title = N'20 aprilie - 3 mai 2026: totaluri saptamanale',
                    Description = N'In perioada de referinta au avut loc 3 examene online. Au participat 55 persoane, dintre care 44 au promovat, cu o rata de 80%.',
                    Category = N'Totaluri saptamanale'
                WHERE SourceUrl = N'https://certificare.cicde.md/news/show/48';
                """);
        }
    }
}
