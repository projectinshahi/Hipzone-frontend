import { ToastContainer } from "react-toastify";
import Form4 from "./pages/Form4";
import Database from "./store/database";
import Pdf from "./ui/Pdf";
import Navigation from "./components/Navigation";

function App() {
  return (
    <Database>
      <>
        <Navigation />
        <section
          className="
        grid
        grid-cols-1
          md:grid-cols-2
          lg:grid-cols-[40rem_1fr]
          h-screen
          gap-4 scrollbar-hide
          "
        >
          {/* Left Panel: Form4 */}
          <main className="bg-gradient-to-br from-gray-50 to-gray-100 w-full h-full overflow-y-auto p-4">
            <div className="max-w-full mx-auto w-full">
              <Form4 />
            </div>
          </main>

          {/* Right Panel: PDF */}
          <div className="w-full h-full bg-gray-100 overflow-y-auto flex justify-center items-start p-4">
            <div className="max-w-[900px] w-full md:scale-95 lg:scale-100 origin-top">
              <Pdf />
            </div>
          </div>
        </section>
        <ToastContainer />
      </>
    </Database>
  );
}

export default App;
