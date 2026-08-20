using System.Data.SQLite;
using System.IO;
using System.Web.Hosting;

namespace HalisahaMvc.Services.Db
{
    /// <summary>
    /// Opens connections against App_Data\halisaha.db via the standard ASP.NET
    /// |DataDirectory| substitution (works the same way .mdf/LocalDB files do on shared hosting).
    /// </summary>
    public static class DbConnectionFactory
    {
        public static string DatabasePath
        {
            get
            {
                var dataDirectory = HostingEnvironment.MapPath("~/App_Data");
                return Path.Combine(dataDirectory, "halisaha.db");
            }
        }

        public static SQLiteConnection Create()
        {
            var builder = new SQLiteConnectionStringBuilder
            {
                DataSource = DatabasePath,
                ForeignKeys = true
            };
            var connection = new SQLiteConnection(builder.ConnectionString);
            connection.Open();
            return connection;
        }
    }
}
