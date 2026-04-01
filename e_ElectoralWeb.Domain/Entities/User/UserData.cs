using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace e_ElectoralWeb.Domain.Entities.User
{
    public class UserData
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(30)]
        public string FirstName { get; set; }

        [StringLength(30)]
        public string LastName { get; set; }

        [Required]
        [StringLength(30, MinimumLength = 4)]
        public string UserName { get; set; }
        
        [Required]
        [StringLength(30)]
        [DataType(DataType.EmailAddress)]
        public string Email { get; set; }

        [Required]
        [StringLength(48, MinimumLength = 8)]
        public string Password { get; set; }

        [StringLength(12)]
        public string Phone { get; set; }

        public UserRole Role { get; set; }

        [DataType(DataType.Date)]
        public DateTime RegisteredOn { get; set; }
    }
}