
// import html2pdf from 'html2pdf.js';
// import { useEffect, useRef, useState } from 'react';

// import A4 from '@/components/A4';
// import Billing from '@/helper/Billing';
// import Payment from '@/helper/Payment';
// import Terms from '@/helper/Terms';
// import First from '@/pages/First';
// import Office from '@/pages/Office';
// import Thank from '@/pages/Thank';
// import { useSale } from '@/store/Database2';
// import Footer3 from './Footer3';
// import Second from '@/pages/Second';
// import Third from '@/helper/Third';

// export default function Pdf2() {

//   const { pages, count } = useSale();
//   const [isLoading, setIsLoading] = useState(false);

//   const reportRef = useRef(null);

//   useEffect(() => {
//     pages.forEach(p =>
//       p.tables.forEach(t =>
//         t.products.forEach(r => {
//           if (r.image) {
//             const img = new Image();
//             img.src = r.image;
//           }
//         })
//       )
//     );

//   }, [pages]);

//   const handleDownload = async () => {
//     const input = reportRef.current;
//     if (!input) return;

//     setIsLoading(true);

//     try {
//       // Wait for all images inside the container
//       const images = input.querySelectorAll("img");
//       await Promise.all(
//         [...images].map(img => {
//           if (img.complete) return Promise.resolve();
//           return new Promise(resolve => {
//             img.onload = resolve;
//             img.onerror = resolve;
//           });
//         })
//       );

//       const opt = {
//         filename: 'Quotation.pdf',
//         image: { type: 'jpeg', quality: 1 },
//         html2canvas: {
//           scale: 1.5,          // More stable
//           useCORS: true,
//           allowTaint: true,
//         },
//         jsPDF: {
//           unit: 'mm',
//           format: 'a4',
//           orientation: 'portrait',
//         },
//         pagebreak: { mode: ['css', 'legacy'] }
//       };

//       await html2pdf().set(opt).from(input).save();
//     } catch (err) {
//       console.error("PDF ERROR:", err);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <section className="p-10 min-h-screen bg-gray-100 relative flex justify-center items-center font-robo scrollbar-hide">
//       <figure className="p-0 m-0" ref={reportRef}>
//         <First />
//         <Second />
//         <Third />
//         {pages.map((page, index) => (
//           <A4 key={page.id} className="overflow-hidden">
//             <main className="relative w-full h-full bg-black text-white overflow-hidden font-mono px-10 py-8">

//               {page.tables.length === 0 && (
//                 <p className="text-gray-500 italic text-center">No tables added</p>
//               )}

//               {/* Tables */}
//               {page.tables.map((table) => (
//                 <div key={table.id} className="mb-10">
//                   {/* Table Header */}
//                   <div className="w-full h-14 flex items-center rounded-tl-lg box-gradient px-4 border border-main rounded-t-md">
//                     <p className="text-xl font-semibold">{table.header}</p>
//                   </div>
//                   {/* <h3 className="text-lg font-semibold mb-4 text-blue-400">{table.header}</h3> */}

//                   <div className="overflow-hidden border border-main border-t-0 border-x-0">
//                     <table className="w-full text-sm border-collapse">
//                       <thead>
//                         <tr className="box-gradient2 text-white text-center">
//                           {/* 2col */}
//                           {table.type === "2col" && (
//                             <>
//                               <th className="border border-main border-t-0 px-3 py-3 font-semibold">Description</th>
//                               <th className="border border-main border-t-0 px-3 py-3 font-semibold">Billing Price</th>
//                             </>
//                           )}

//                           {/* 4col */}
//                           {table.type === "4col" && (
//                             <>
//                               <th className="border border-main border-t-0 rounded-lg px-3 py-3 font-semibold">Item</th>
//                               <th className="border border-main border-t-0 rounded-lg px-3 py-3 font-semibold">Qty</th>
//                               <th className="border border-main border-t-0 rounded-lg px-3 py-3 font-semibold">Price</th>
//                               <th className="border border-main border-t-0 rounded-lg px-3 py-3 font-semibold">Total</th>
//                             </>
//                           )}

//                           {/* 7col */}
//                           {table.type === "7col" && (
//                             <>
//                               <th className="border border-main border-t-0 px-3 py-3 font-semibold">S.NO</th>
//                               <th className="border border-main border-t-0 px-3 py-3 font-semibold">Product</th>
//                               <th className="border border-main border-t-0 px-3 py-3 font-semibold">Description</th>
//                               <th className="border border-main border-t-0 px-3 py-3 font-semibold">Qty</th>
//                               <th className="border border-main border-t-0 px-3 py-3 font-semibold">Unit Price</th>
//                               <th className="border border-main border-t-0 px-3 py-3 font-semibold">Tax</th>
//                               <th className="border border-main border-t-0 px-3 py-3 font-semibold">Billing Price</th>
//                             </>
//                           )}
//                         </tr>
//                       </thead>

//                       <tbody className="bg-black">
//                         {table.products.length > 0 ? (
//                           table.products.map((row, rIndex) => (
//                             <tr
//                               key={rIndex}
//                               className="hover:bg-gray-900 transition-colors text-center align-top"
//                             >
//                               {/* 2col */}
//                               {table.type === "2col" && (
//                                 <>
//                                   <td className="border border-main px-3 py-4 text-white text-center break-words whitespace-pre-wrap max-w-[150px]">
//                                     {row.item}
//                                   </td>
//                                   {/* <td className="border border-main px-3 py-4 text-white">{row.item}</td> */}
//                                   <td className="border border-main px-3 py-4 text-white">{row.price}</td>
//                                 </>
//                               )}

//                               {/* 4col */}
//                               {table.type === "4col" && (
//                                 <>
//                                   <td className="border border-main px-3 py-4">
//                                     <div className="flex items-center justify-center gap-2">
//                                       {row.image && (
//                                         <img
//                                           src={row.image}
//                                           alt={row.item}
//                                           className="w-12 h-12 object-cover rounded-md border border-gray-600"
//                                         />
//                                       )}
//                                       <span className="text-white break-words whitespace-pre-wrap max-w-[120px]">
//                                         {row.item}
//                                       </span>
//                                     </div>
//                                   </td>
//                                   {/* <td className="border border-main px-3 py-4 text-white">{row.item}</td> */}
//                                   <td className="border border-main px-3 py-4 text-white">{row.qty}</td>
//                                   <td className="border border-main px-3 py-4 text-white">{row.price}</td>
//                                   <td className="border border-main px-3 py-4 text-white">{row.total}</td>
//                                 </>
//                               )}

//                               {/* 7col */}
//                               {table.type === "7col" && (
//                                 <>
//                                   <td className="border border-main px-3 py-4 text-white">{row.sno}</td>
//                                   <td className="border border-main px-3 py-4">
//                                     <div className="flex items-center justify-center gap-2">
//                                       {row.image && (
//                                         <img
//                                           src={row.image}
//                                           alt={row.product}
//                                           className="w-12 h-12 object-cover rounded-md border border-gray-600"
//                                         />
//                                       )}
//                                       <span className="text-white break-words whitespace-pre-wrap max-w-[120px]">
//                                         {row.product}
//                                       </span>
//                                     </div>
//                                   </td>
//                                   <td className="border border-main px-3 py-4 text-white text-center break-words whitespace-pre-wrap max-w-[150px]">
//                                     {row.description}
//                                   </td>
//                                   <td className="border border-main px-3 py-4 text-white">{row.qty}</td>
//                                   <td className="border border-main px-3 py-4 text-white">{row.unitPrice}</td>
//                                   <td className="border border-main px-3 py-4 text-white">
//                                     {row.taxAmount} <br />
//                                     <span className="text-xs text-gray-300">{row.taxRate}%</span>
//                                   </td>
//                                   <td className="border border-main px-3 py-4 text-white font-semibold">{row.billingPrice}</td>
//                                 </>
//                               )}
//                             </tr>
//                           ))
//                         ) : (
//                           <tr>
//                             <td
//                               colSpan={table.type === "7col" ? 7 : table.type === "4col" ? 4 : 2}
//                               className="border border-main px-3 py-8 text-center text-gray-500 italic"
//                             >
//                               No products added
//                             </td>
//                           </tr>
//                         )}
//                       </tbody>
//                     </table>
//                   </div>
//                 </div>
//               ))}
//               <Footer3
//               />
//             </main>
//           </A4>
//         ))}
//         <Billing />
//         <Terms />
//         <Payment />
//         <Office />
//         <Thank />
//       </figure>

//       {/* Download Button */}
//       <div className="absolute -bottom-24 left-10 pb-10" >
//         <button
//           disabled={isLoading}
//           onClick={handleDownload}
//           className="mx-2 px-6 py-2 bg-main text-white rounded hover:bg-blue-700"
//         >
//           {isLoading ? 'Processing...' : 'Download PDF'}
//         </button>
//       </div>
//     </section>
//   );
// }

import html2pdf from 'html2pdf.js';
import { useEffect, useRef, useState } from 'react';

import A4 from '@/components/A4';
import Billing from '@/helper/Billing';
import Payment from '@/helper/Payment';
import Terms from '@/helper/Terms';
import First from '@/pages/First';
import Office from '@/pages/Office';
import Thank from '@/pages/Thank';
import { useSale } from '@/store/Database2';
import Footer3 from './Footer3';
import Second from '@/pages/Second';
import Third from '@/helper/Third';

export default function Pdf2() {
  const { pages, count } = useSale();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');
  const [error, setError] = useState(null);

  const reportRef = useRef(null);
  const imagesLoadedRef = useRef(false);

  const preloadAllImages = async () => {
    const allImageUrls = new Set();

    pages.forEach(p =>
      p.tables.forEach(t =>
        t.products.forEach(r => {
          if (r.image) {
            allImageUrls.add(r.image);
          }
        })
      )
    );

    const imagePromises = Array.from(allImageUrls).map(url => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";

        const timeout = setTimeout(() => {
          reject(new Error(`Image load timeout: ${url}`));
        }, 15000);

        img.onload = () => {
          clearTimeout(timeout);
          resolve();
        };

        img.onerror = () => {
          clearTimeout(timeout);
          console.warn(`Failed to load image: ${url}`);
          resolve();
        };

        img.src = url;
      });
    });

    try {
      await Promise.all(imagePromises);
      imagesLoadedRef.current = true;
    } catch (err) {
      console.warn("Some images failed to load:", err);
      imagesLoadedRef.current = true;
    }
  };

  useEffect(() => {
    if (pages.length > 0) {
      setProgressText('Pre-loading images...');
      preloadAllImages().then(() => {
        setProgressText('');
      });
    }
  }, [pages]);

  const waitForImages = async (container) => {
    const images = container.querySelectorAll("img");
    const imagePromises = Array.from(images).map(img => {
      if (img.complete && img.naturalHeight !== 0) {
        return Promise.resolve();
      }

      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          console.warn('Image timeout:', img.src);
          resolve();
        }, 10000);

        img.onload = () => {
          clearTimeout(timeout);
          resolve();
        };

        img.onerror = () => {
          clearTimeout(timeout);
          console.warn('Image error:', img.src);
          resolve();
        };
      });
    });

    await Promise.all(imagePromises);
    await new Promise(resolve => setTimeout(resolve, 500));
  };

  const generatePDFInChunks = async (container) => {
    const totalPages = pages.length + 5;
    const chunkSize = totalPages > 50 ? 10 : totalPages > 30 ? 15 : 20;

    const scale = totalPages > 50 ? 1.2 : totalPages > 30 ? 1.3 : 1.5;
    const quality = totalPages > 50 ? 0.85 : totalPages > 30 ? 0.9 : 1;

    setProgressText(`Processing ${totalPages} pages...`);

    const opt = {
      margin: 0,
      filename: 'Quotation.pdf',
      image: {
        type: 'jpeg',
        quality: quality
      },
      html2canvas: {
        scale: scale,
        useCORS: true,
        allowTaint: true,
        logging: false,
        letterRendering: true,
        backgroundColor: '#000000',
        removeContainer: false,
        imageTimeout: 15000,
        onclone: (clonedDoc) => {
          const clonedContainer = clonedDoc.querySelector('[data-pdf-container]');
          if (clonedContainer) {
            (clonedContainer).style.display = 'block';
          }
        }
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait',
        compress: true,
        precision: 2
      },
      pagebreak: {
        mode: ['css', 'legacy'],
        before: '.page-break-before',
        after: '.page-break-after',
        avoid: ['img', 'tr', 'td']
      }
    };

    try {
      setProgress(10);
      setProgressText('Preparing document...');

      await waitForImages(container);

      setProgress(20);
      setProgressText('Generating PDF...');

      const worker = html2pdf().set(opt).from(container);

      setProgress(60);
      setProgressText('Finalizing PDF...');

      await worker.save();

      setProgress(100);
      setProgressText('Download complete!');

      setTimeout(() => {
        setProgressText('');
        setProgress(0);
      }, 2000);

    } catch (err) {
      console.error("PDF Generation Error:", err);
      throw err;
    }
  };

  const handleDownload = async () => {
    const input = reportRef.current;
    if (!input) {
      setError("PDF container not found");
      return;
    }

    setIsLoading(true);
    setError(null);
    setProgress(0);

    try {
      if (!imagesLoadedRef.current) {
        setProgressText('Loading images...');
        await preloadAllImages();
      }

      await generatePDFInChunks(input);

    } catch (err) {
      console.error("PDF ERROR:", err);
      setError("Failed to generate PDF. Please try again.");
      setProgressText('');
      setProgress(0);
    } finally {
      setIsLoading(false);
    }
  };

  const totalPages = pages.length;

  return (
    <section className="p-10 min-h-screen bg-gray-100 relative flex justify-center items-center font-robo scrollbar-hide">
      <figure className="p-0 m-0" ref={reportRef} data-pdf-container>
        <First />
        <Second />
        <Third />
        {pages.map((page) => (
          <A4 key={page.id} className="overflow-hidden page-break-after">
            <main className="relative w-full h-full bg-black text-white overflow-hidden font-mono px-10 py-8">

              {page.tables.length === 0 && (
                <p className="text-gray-500 italic text-center">No tables added</p>
              )}

              {page.tables.map((table) => (
                <div key={table.id} className="mb-10">
                  <div className="w-full h-14 flex items-center rounded-tl-lg box-gradient px-4 border border-main rounded-t-md">
                    <p className="text-xl font-semibold">{table.header}</p>
                  </div>

                  <div className="overflow-hidden border border-main border-t-0 border-x-0">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="box-gradient2 text-white text-center">
                          {table.type === "2col" && (
                            <>
                              <th className="border border-main border-t-0 px-3 py-3 font-semibold">Description</th>
                              <th className="border border-main border-t-0 px-3 py-3 font-semibold">Billing Price</th>
                            </>
                          )}

                          {table.type === "4col" && (
                            <>
                              <th className="border border-main border-t-0 rounded-lg px-3 py-3 font-semibold">Item</th>
                              <th className="border border-main border-t-0 rounded-lg px-3 py-3 font-semibold">Qty</th>
                              <th className="border border-main border-t-0 rounded-lg px-3 py-3 font-semibold">Price</th>
                              <th className="border border-main border-t-0 rounded-lg px-3 py-3 font-semibold">Total</th>
                            </>
                          )}

                          {table.type === "7col" && (
                            <>
                              <th className="border border-main border-t-0 px-3 py-3 font-semibold">S.NO</th>
                              <th className="border border-main border-t-0 px-3 py-3 font-semibold">Product</th>
                              <th className="border border-main border-t-0 px-3 py-3 font-semibold">Description</th>
                              <th className="border border-main border-t-0 px-3 py-3 font-semibold">Qty</th>
                              <th className="border border-main border-t-0 px-3 py-3 font-semibold">Unit Price</th>
                              <th className="border border-main border-t-0 px-3 py-3 font-semibold">Tax</th>
                              <th className="border border-main border-t-0 px-3 py-3 font-semibold">Billing Price</th>
                            </>
                          )}
                        </tr>
                      </thead>

                      <tbody className="bg-black">
                        {table.products.length > 0 ? (
                          table.products.map((row, rIndex) => (
                            <tr
                              key={rIndex}
                              className="hover:bg-gray-900 transition-colors text-center align-top"
                            >
                              {table.type === "2col" && (
                                <>
                                  <td className="border border-main px-3 py-4 text-white text-center break-words whitespace-pre-wrap max-w-[150px]">
                                    {row.item}
                                  </td>
                                  <td className="border border-main px-3 py-4 text-white">{row.price}</td>
                                </>
                              )}

                              {table.type === "4col" && (
                                <>
                                  <td className="border border-main px-3 py-4">
                                    <div className="flex items-center justify-center gap-2">
                                      {row.image && (
                                        <img
                                          src={row.image}
                                          alt={row.item}
                                          crossOrigin="anonymous"
                                          className="w-12 h-12 object-cover rounded-md border border-gray-600"
                                          loading="eager"
                                        />
                                      )}
                                      <span className="text-white break-words whitespace-pre-wrap max-w-[120px]">
                                        {row.item}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="border border-main px-3 py-4 text-white">{row.qty}</td>
                                  <td className="border border-main px-3 py-4 text-white">{row.price}</td>
                                  <td className="border border-main px-3 py-4 text-white">{row.total}</td>
                                </>
                              )}

                              {table.type === "7col" && (
                                <>
                                  <td className="border border-main px-3 py-4 text-white">{row.sno}</td>
                                  <td className="border border-main px-3 py-4">
                                    <div className="flex items-center justify-center gap-2">
                                      {row.image && (
                                        <img
                                          src={row.image}
                                          alt={row.product}
                                          crossOrigin="anonymous"
                                          className="w-12 h-12 object-cover rounded-md border border-gray-600"
                                          loading="eager"
                                        />
                                      )}
                                      <span className="text-white break-words whitespace-pre-wrap max-w-[120px]">
                                        {row.product}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="border border-main px-3 py-4 text-white text-center break-words whitespace-pre-wrap max-w-[150px]">
                                    {row.description}
                                  </td>
                                  <td className="border border-main px-3 py-4 text-white">{row.qty}</td>
                                  <td className="border border-main px-3 py-4 text-white">{row.unitPrice}</td>
                                  <td className="border border-main px-3 py-4 text-white">
                                    {row.taxAmount} <br />
                                    <span className="text-xs text-gray-300">{row.taxRate}%</span>
                                  </td>
                                  <td className="border border-main px-3 py-4 text-white font-semibold">{row.billingPrice}</td>
                                </>
                              )}
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan={table.type === "7col" ? 7 : table.type === "4col" ? 4 : 2}
                              className="border border-main px-3 py-8 text-center text-gray-500 italic"
                            >
                              No products added
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
              <Footer3 />
            </main>
          </A4>
        ))}
        <Billing />
        <Terms />
        <Payment />
        <Office />
        <Thank />
      </figure>

      <div className="absolute -bottom-24 left-10 pb-10 flex flex-col gap-3">
        <div className="flex items-center gap-4">
          <button
            disabled={isLoading}
            onClick={handleDownload}
            className="px-6 py-2 bg-main text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? 'Processing...' : 'Download PDF'}
          </button>

          {totalPages > 0 && (
            <span className="text-sm text-gray-600">
              {totalPages} page{totalPages !== 1 ? 's' : ''}
              {totalPages > 50 && ' (Large document - optimized mode)'}
            </span>
          )}
        </div>

        {isLoading && (
          <div className="w-64">
            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            {progressText && (
              <p className="text-sm text-gray-600 mt-2">{progressText}</p>
            )}
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded max-w-md">
            {error}
          </div>
        )}
      </div>
    </section>
  );
}
