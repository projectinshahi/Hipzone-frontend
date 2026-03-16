function Footer3({ pageNumber }) {
  return (
    <>
      <div className="absolute bottom-0 right-0 z-10">
        <img src="/hipzone/vector.svg" alt="Vector Illustration" />
      </div>
      <footer className="absolute w-full bottom-0 right-0 z-0 px-6 py-4 bg-black/80">
        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white to-transparent mb-2"></div>
        <aside className="flex justify-between items-center text-sm">
          <img src="/hipzone/footer.svg" alt="Footer Logo" className="h-6" />
          <a
            className="text-white opacity-70 hover:underline"
            target="_blank"
            href="https://www.hipzoneautomation.in"
          >
            www.hipzoneautomation.com
          </a>
        </aside>
      </footer>
    </>
  );
}

export default Footer3;
