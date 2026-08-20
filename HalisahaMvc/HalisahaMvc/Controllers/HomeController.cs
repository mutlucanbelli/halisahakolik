using System.Web.Mvc;

namespace HalisahaMvc.Controllers
{
    public class HomeController : Controller
    {
        // GET / — public player login page.
        public ActionResult Index()
        {
            ViewBag.LoginError = TempData["LoginError"];
            return View();
        }
    }
}
