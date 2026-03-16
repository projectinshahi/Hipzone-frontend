import A4 from "@/components/A4";
import Footer2 from "@/ui/Footer2";
import { FaPhoneAlt } from "react-icons/fa";



export default function Office() {
  return (
    <A4>
      <main className="relative w-[210mm] h-[297mm] bg-[url('/hipzone/hero2.svg')] bg-cover bg-center bg-black text-white overflow-hidden font-pop">
        {/* Header */}
        <header className="flex flex-col items-center mt-12">
          <h1 className="font-extrabold text-main text-[9rem] leading-none text-center">
            HIPZONE
          </h1>
          <p className="text-5xl font-medium text-white opacity-80 mt-4">
            AUTOMATION
          </p>
        </header>

        {/* Offices */}
        <section className="mx-24 my-24 text-center space-y-10 flex flex-col gap-4 justify-evenly items-center">
          <div className="z-30">
            <h2 className="text-2xl font-bold mb-2">Dubai Office</h2>
            <p className="opacity-80 leading-relaxed">
              Hipzone Automation, Aswaaq Mall – Al Mizhar
              Dubai, United Arab Emirates
            </p>
            <p className="mt-2 flex justify-center gap-4">
              <a className="flex gap-2 items-center justify-center" target="_blank" href="https://wa.me/+971566767556"><img className="w-6 h-4" src="/hipzone/phone.svg" /><span>+971566767556</span></a>
              <a className="flex gap-2 items-center justify-center" target="_blank" href="https://wa.me/+971556775848"><img className="w-6 h-4" src="/hipzone/phone.svg" /><span>+971556775848</span></a>
            </p>
          </div>

          <div className="z-30">
            <h2 className="text-2xl font-bold mb-2">India Office</h2>
            <p className="opacity-80 leading-relaxed mt-5">
              <span>
                <strong className="block opacity-100">Corpotare Office</strong> Hipzone Automation, Hilite Business Park, Calicut - Kerala
              </span>
              <span className="block mt-5">
                <strong className="block opacity-100">Operating Office</strong> Hipzone Automation,Purakkattiri,Calicut
                Kalpatta Wayanad , Kerala - 673121
              </span>

            </p>
            <p className="mt-2 flex justify-center gap-4">
              <a className="flex gap-2 items-center justify-center" target="_blank" href="https://wa.me/+919496686458"><img className="w-6 h-4" src="/hipzone/phone.svg" /> +91 9496686458</a>
              <a className="flex gap-2 items-center justify-center" target="_blank" href="https://wa.me/+918136934920"><img className="w-6 h-4" src="/hipzone/phone.svg" /> +91 8136934920</a>
            </p>

          </div>
        </section>

        {/* QR Code */}
        <div className="flex justify-center mt-28">
          <img
            src="/hipzone/qr.svg"    // place the uploaded image in public/hip.png
            alt="Hipzone QR"
            className="w-48 h-48"
          />
        </div>


        {/* Footer */}
        <Footer2 />
      </main>
    </A4>
  );
}
