import A4 from "@/components/A4"
import { useSale } from "@/store/Database2"
import Footer2 from "@/ui/Footer2"

function Terms() {
  const { terms } = useSale();

  return (
    <A4>
      <main className="relative w-[210mm] h-[297mm] bg-black text-white overflow-hidden font-pop">

        {/* Header */}
        <header className="flex flex-col items-center mt-12">
          <h1 className="font-extrabold text-main text-[9rem] leading-none text-center">
            HIPZONE
          </h1>
          <p className="text-5xl font-medium text-white opacity-80 mt-4">
            AUTOMATION
          </p>
        </header>

        {/* Terms Section */}
        <section className="mx-20 my-10">
          <aside>
            <h2 className="font-bold text-xl my-5">Terms and Conditions</h2>
            <div className="mt-1">
              {terms.split("\n").map((line, i) => (
                <p
                  key={i}
                  className="text-white opacity-80 text-lg leading-relaxed w-fit"
                >
                  {line}
                </p>
              ))}
            </div>
          </aside>

          <aside>
            <h2 className="font-bold text-xl my-5">Prices</h2>
            <div className="mt-1">
              <p
                className="text-white opacity-80 text-lg leading-relaxed w-fit"
              >
                All prices are quoted in AED (United Arab Emirates Dirhams) and are inclusive of applicable taxes, unless otherwise specified.
              </p>
            </div>
          </aside>
          <aside>
            <h2 className="font-bold text-xl my-5">Validity</h2>
            <div className="mt-1">
              <p
                className="text-white opacity-80 text-lg leading-relaxed w-fit"
              >
                This proposal remains valid for 30 days from the date of issue.
              </p>
            </div>
          </aside>
          <aside>
            <h2 className="font-bold text-xl my-5">Installation</h2>
            <div className="mt-1">
              <p
                className="text-white opacity-80 text-lg leading-relaxed w-fit"
              >
                The proposal does not include costs for additional wiring, alterations, or modifications required at the time of installation.
              </p>
            </div>
          </aside>
          <aside>
            <h2 className="font-bold text-xl my-5">Mobile Application</h2>
            <div className="mt-1">
              <p
                className="text-white opacity-80 text-lg leading-relaxed w-fit"
              >
                The Hipzone mobile app is free of charge and can be installed on multiple devices.
              </p>
            </div>
          </aside>


        </section>

        {/* Footer */}
        <Footer2 />
      </main>
    </A4>
  )
}

export default Terms
