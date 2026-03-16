import A4 from "@/components/A4"
import Footer from "@/ui/Footer"
import Footer3 from "@/ui/Footer3"

function Second() {
  return (
    <A4>
      <main className="relative w-[210mm] h-[297mm] bg-black text-white z-0 overflow-hidden font-pop">

        {/* Top illustration */}
        <img className="w-full object-cover" src="/hipzone/about.svg" alt="About HIPZONE" />

        {/* Content */}
        <div className="px-10 py-12">
          <h1 className="text-white font-bold text-3xl opacity-90 mb-4">
            About HIPZONE AUTOMATION
          </h1>
          <p className="text-white opacity-80 text-base leading-relaxed">
            <strong>HIPZONE AUTOMATION</strong> transforms homes and businesses into smarter, safer, and more intelligent spaces. With over 8 years of expertise in India and an expanding presence in Dubai, we deliver AI-integrated automation and security solutions powered by trusted global brands.
            <br /><br />
            Our intelligent systems go beyond standard automation. They learn your lifestyle, anticipate your needs, and optimize comfort, security, and energy efficiency automatically. We combine technical expertise with personalized service to ensure every project is reliable, future-ready, and supported by strong customer care.
          </p>
        </div>

        {/* Bottom illustration */}
        <Footer3 page={"01"} />
      </main>
    </A4>
  )
}

export default Second
