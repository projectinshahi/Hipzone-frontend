import A4 from "@/components/A4"

function First() {
  return (
    <A4 >
      <main className="relative w-[210mm] h-[297mm] bg-[url('/hipzone/homemod.svg')] bg-cover bg-center z-0">

        <div className="flex flex-col z-20">
          <h1 className="font-extrabold text-[#ffff] text-[9rem] text-center z-20 opacity-100">HIPZONE</h1>
          <p className="text-center text-main  z-20 text-5xl font-medium -translate-y-4">AUTOMATION</p>
        </div>

        <div className="flex gap-6 text-white font-medium justify-evenly items-center mt-36 text-2xl">
          <p className="z-20"><span className="text-main ">|</span> Home Design</p>
          <p className="z-20"> <span className="text-main ">|</span> Security</p>
          <p className="z-20"><span className="text-main ">|</span> Innovation</p>
        </div>

        <footer className="absolute bottom-0 z-20 bg-black text-white w-full flex justify-between px-8 py-14">
          <aside className="flex flex-col justify-between">
            <img className="w-fit h-fit" src="/hipzone/footerlogo.svg" />
            <a className="translate-y-4 text-md opacity-55" href="https://hipzoneautomation.in/" target="_blank">www.hipzoneautomation.in</a>
          </aside>

          <aside className="text-end text-2xl font-medium">
            <p>Home Design <span className="text-main">|</span></p>
            <p>ELV Consultant <span className="text-main">|</span></p>
          </aside>
        </footer>
        {/* <div className="absolute inset-0 bg-black opacity-65 w-full h-full z-10"></div> */}
      </main>
    </A4 >
  )
}

export default First
