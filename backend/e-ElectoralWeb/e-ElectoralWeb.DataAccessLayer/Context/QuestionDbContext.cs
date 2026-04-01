using Microsoft.EntityFrameworkCore;
using e_ElectoralWeb.Domain.Entities.Question;

namespace e_ElectoralWeb.DataAccessLayer.Context;

public class QuestionDbContext: DbContext
{
    public DbSet<QuestionEntity> Questions { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        if (!optionsBuilder.IsConfigured)
        {
            optionsBuilder.UseNpgsql("Host=localhost;Port=5432;Database=quizztest;Username=postgres;Password=postgres;");
        }
    }
}