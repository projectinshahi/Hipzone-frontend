import A4 from "@/components/A4";
import Footer2 from "@/ui/Footer2";
import { FaInstagram, FaFacebookF, FaYoutube } from "react-icons/fa";

export default function Thank() {
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

        {/* Thank You Message */}
        <section className="flex flex-col items-center justify-center my-[30%] space-y-4 text-center">
          <h2 className="text-6xl font-medium">THANK YOU</h2>
          <p className="text-xl opacity-80 font-medium">
            For Any Queries Please Contact Us
          </p>

          <p className="text-sm opacity-80 mt-4">
            hipzoneautomation.com
          </p>

          {/* Social Links */}
          <div className="flex gap-6 mt-6 text-main text-2xl">
            <a target="_blank" href="https://www.instagram.com/hipzone_automation/" aria-label="Instagram">
              <img className="w-6 h-6" src="/hipzone/insta.svg" alt="insta" />
            </a>
            <a target="_blank" href="https://www.facebook.com/Hipzone.Automation/" aria-label="Facebook">
              <img className="w-6 h-6" src="/hipzone/facebook.svg" alt="insta" />
            </a>
            <a target="_blank" href="https://www.youtube.com/@Hipzone_Automation/" aria-label="YouTube">
              <img className="w-7 h-8 -translate-y-1" src="/hipzone/tube2.svg" alt="insta" />
              {/* <FaYoutube /> */}
            </a>
          </div>
        </section>

        {/* Footer */}
        <Footer2 />
      </main>
    </A4>
  );
}
