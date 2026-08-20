using System.IO;
using System.Reflection;

namespace HalisahaMvc.Services.Db
{
    /// <summary>
    /// Creates App_Data\halisaha.db (if missing) and applies the embedded, idempotent schema.sql.
    /// Called once from Application_Start. Safe to call again on every app start / after every
    /// redeploy since the schema uses CREATE TABLE/INDEX IF NOT EXISTS throughout.
    /// </summary>
    public static class DbInitializer
    {
        public static void EnsureDatabase()
        {
            var dbPath = DbConnectionFactory.DatabasePath;
            var dir = Path.GetDirectoryName(dbPath);
            if (!string.IsNullOrEmpty(dir) && !Directory.Exists(dir))
            {
                Directory.CreateDirectory(dir);
            }

            using (var connection = DbConnectionFactory.Create())
            using (var command = connection.CreateCommand())
            {
                command.CommandText = ReadEmbeddedSchema();
                command.ExecuteNonQuery();
            }
        }

        private static string ReadEmbeddedSchema()
        {
            var assembly = Assembly.GetExecutingAssembly();
            const string resourceName = "HalisahaMvc.Services.Db.schema.sql";
            using (var stream = assembly.GetManifestResourceStream(resourceName))
            {
                if (stream == null)
                {
                    throw new FileNotFoundException(
                        "Embedded schema resource not found: " + resourceName +
                        ". Ensure schema.sql's Build Action is 'Embedded Resource'.");
                }
                using (var reader = new StreamReader(stream))
                {
                    return reader.ReadToEnd();
                }
            }
        }
    }
}
