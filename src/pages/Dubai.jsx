import Navigation from "@/components/Navigation"
import Database from "@/store/Database2"
import Pdf2 from "@/ui/Pdf2"
import { ToastContainer } from "react-toastify"
import Form5 from "./Form5"

function Dubai() {
  return (
    <>
      <Database>
        <Navigation />
        <section
          className="
        grid
        grid-cols-1
        md:grid-cols-2
        lg:grid-cols-[40rem_1fr]
          h-screen
          gap-4
          "
        >
          {/* Left Panel: Form4 */}
          <main className="bg-gradient-to-br from-gray-50 to-gray-100 w-full h-full overflow-y-auto p-4">
            <div className="max-w-full mx-auto w-full">
              <Form5 />
            </div>
          </main>

          {/* Right Panel: PDF */}
          <div className="w-full h-full bg-gray-100 overflow-y-auto flex justify-center items-start p-4">
            <div className="max-w-[900px] w-full md:scale-95 lg:scale-100 origin-top">
              <Pdf2 />
            </div>
          </div>
        </section>
        <ToastContainer />
      </Database>
    </>
  )
}

export default Dubai
