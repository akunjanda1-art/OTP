export default function Contact() {
  return (
    <section id="contact" className="py-24 bg-slate-900/30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Butuh paket Enterprise?</h2>
        <p className="text-slate-400 mb-8">
          Volume tinggi, SLA dedicated, atau white-label dashboard? Tim kami siap
          membantu.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="mailto:sales@otpgo.id"
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium transition"
          >
            sales@otpgo.id
          </a>
          <a
            href="https://wa.me/6281234567890"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-lg border border-slate-700 hover:border-slate-500 text-white font-medium transition"
          >
            Chat via WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
