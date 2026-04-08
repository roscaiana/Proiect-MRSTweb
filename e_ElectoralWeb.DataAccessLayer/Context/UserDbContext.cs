using Microsoft.EntityFrameworkCore;
using e_ElectoralWeb.Domain.Entities.User;
namespace e_ElectoralWeb.DataAccessLayer.Context
{
    public class UserContext : DbContext
    {
        public DbSet<UserData> Users { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseNpgsql(DbSession.ConnectionString);
        }
    }
}