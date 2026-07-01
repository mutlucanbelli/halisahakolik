import { redirect } from "next/navigation";

export default function Home() {
  // Kullanıcı ana dizine geldiğinde direkt olarak Super Dashboard'a (Admin) yönlendirilecek.
  // Eğer giriş yapmamışsa middleware zaten onu /login sayfasına atacaktır.
  redirect("/admin");
}
