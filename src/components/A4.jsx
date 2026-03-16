function A4({ children, className = "" }) {
  return (
    <main className="w-[210mm] h-[297mm] relative flex flex-col justify-between mx-auto rounded shadow font-robo p-0 m-0">
      {children}
    </main>
  )
}

export default A4
