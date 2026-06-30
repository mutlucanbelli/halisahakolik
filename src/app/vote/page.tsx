import Link from "next/link";

export default function GeneralVotePage() {
  return (
    <div className="container flex flex-col justify-center items-center h-screen">
      <div className="glass-panel text-center">
        <h2 className="title-sub mb-4 text-primary">Maç Sonu Oylaması</h2>
        <p className="text-sm mb-6" style={{ color: "#cbd5e1" }}>
          Oy kullanabilmek için yöneticinizin size WhatsApp veya diğer kanallardan gönderdiği özel maç linkine tıklamanız gerekmektedir.
        </p>
        <Link href="/" className="btn-primary mt-2">Ana Sayfaya Dön</Link>
      </div>
    </div>
  );
}
