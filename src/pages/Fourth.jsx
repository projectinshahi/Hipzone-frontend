import A4 from "@/components/A4"

function Fourth() {
  return (
    <A4>
      <main className="relative w-full h-full bg-[url('/hipzone/thankyou.png')] bg-cover bg-center text-white">
        <div className="absolute inset-0 bg-black opacity-70"></div>

        <div className="relative flex flex-col items-center justify-center h-full z-20">
          <h1 className="font-extrabold text-[#1E90FF] text-[12rem]">HIPZONE</h1>
          <p className="text-center text-gray-200 text-5xl font-medium">AUTOMATION</p>

          <div className="mt-20">
            <h2 className="text-6xl font-bold">THANK YOU</h2>
            <div className="h-1 w-40 bg-[#1E90FF] mt-4 mx-auto"></div>
          </div>
        </div>

        <footer className="absolute bottom-0 bg-black text-white w-full flex justify-center px-8 py-6 border-t border-gray-700">
          <a href="www.hipzoneautomation.in" target="_blank">www.hipzoneautomation.in</a>
        </footer>
      </main>
    </A4>
  )
}

export default Fourth
