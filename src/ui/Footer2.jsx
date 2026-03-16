function Footer2() {
  return (
    <>
      <div className="absolute bottom-0 right-0 z-10">
        <img src="/hipzone/vector.svg" className="" alt="Vector Illustration" />
      </div>

      {/* Footer */}
      <footer className="absolute w-full bottom-0 z-0 px-6 py-4 bg-black/80">
        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white to-transparent mb-2"></div>
        <aside className="flex justify-center items-center text-sm">
          <a className="text-white opacity-70 hover:underline" target="_blank"
            href="https://www.hipzoneautomation.in">
            www.hipzoneautomation.com
          </a>
        </aside>
      </footer>
    </>
  )
}

export default Footer2
