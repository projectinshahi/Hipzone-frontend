import A4 from "@/components/A4"
import { useSale } from "@/store/Database2"
import Footer2 from "@/ui/Footer2"

function Payment() {
  const { sale, pay } = useSale();

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
            <h2 className="font-bold text-xl my-5">Payment Terms</h2>
            <div className="mt-1">
              {pay && (pay?.split("\n")?.map((line, i) => (
                <p
                  key={i}
                  className="text-white opacity-80 text-lg leading-relaxed w-fit"
                >
                  {line}
                </p>
              )))}
            </div>
          </aside>

          <aside>
            <h2 className="font-bold text-xl my-5">Pricing Terms</h2>
            <div className="mt-1">
              <p className="text-white opacity-80 text-lg leading-relaxed">
                All prices are inclusive of applicable taxes.
              </p>
            </div>
          </aside>

          <aside>
            <h2 className="font-bold text-xl my-5">Cancellation Policy</h2>
            <div className="mt-1">
              <p className="text-white opacity-80 text-lg leading-relaxed">
                Any advance paid will be refunded if cancellation is made within 3 days of payment.
                After this period, the advance is non-refundable.
              </p>
            </div>
          </aside>

          <aside>
            <h2 className="font-bold text-xl my-5">Technical Support</h2>
            <div className="mt-1 space-y-2">
              <div className="flex gap-2 items-center">
                <img className="w-6 h-6" src="/hipzone/phone.svg" alt="phone" />
                <a href={`tel:${sale.technumber}`} className="text-white block opacity-80 text-lg leading-relaxed">
                  {sale.technumber}
                </a>
              </div>
              <div className="flex gap-2 items-center pt-4">
                <img className="w-6 h-6" src="/hipzone/mail.svg" alt="Mail!" />
                <a href={`mailto:${sale.techcontact}`} className="text-white opacity-80 text-lg leading-relaxed">
                  {sale.techcontact}
                </a>
              </div>
            </div>
          </aside>
        </section>

        {/* Footer */}
        <Footer2 />
      </main>
    </A4>
  )
}

export default Payment
