import A4 from "@/components/A4";
import { useSale } from "@/store/Database2";
import Footer3 from "@/ui/Footer3";

function Third() {
  const { description, setDescription, address } = useSale();

  return (
    <A4>
      <main className="relative w-[210mm] h-[297mm] bg-black text-white z-0 overflow-hidden font-sans">

        {/* Client Information */}
        <section className="mx-10 mt-10">
          <div className="w-full h-14 flex items-center rounded-lg box-gradient px-4">
            <p className="text-xl font-semibold">Client Information</p>
          </div>

          <div className="mt-6 flex flex-col gap-4 text-lg">
            <div className="flex gap-2">
              <p className="font-semibold w-24">Name:</p>
              <p className="flex-1 text-base text-white opacity-80">{address.name || "-"}</p>
            </div>
            {address.mobile && <div className="flex gap-2">
              <p className="font-semibold w-24">Mobile:</p>
              <p className="flex-1 text-base text-white opacity-80">{address.mobile || "-"}</p>
            </div>}
            {address.address && <div className="flex gap-2">
              <p className="font-semibold w-24">Address:</p>
              <p className="flex-1 text-base text-white opacity-80">{address.address || "-"}</p>
            </div>}
          </div>
        </section>

        {/* Project Description */}
        <section className="mx-10 mt-10">
          <div className="w-full h-14 flex items-center rounded-lg box-gradient px-4">
            <p className="text-xl font-semibold">Project Description</p>
          </div>
          {description && (description?.split("\n")?.map((line, i) => (
            <p
              key={i}
              className="mt-6 text-base text-white opacity-80 leading-relaxed"
            // className="text-white opacity-80 text-lg leading-relaxed w-fit"
            >
              {line}
            </p>
          )))}
          {/* At Hipzone Automation, we are committed to providing innovative smart home solutions with complete transparency in pricing. All costs shown here are inclusive of applicable UAE VAT (5%), ensuring accuracy and compliance with regulations. */}
          {/* <p className="mt-6 text-base text-white opacity-80 leading-relaxed">
            {description}
            <br /><br />
          </p> */}
        </section>

        {/* Footer */}
        <Footer3 page={"02"} />

      </main>
    </A4>
  )
}

export default Third
