
import html2pdf from 'html2pdf.js';
import { useEffect, useRef, useState } from 'react';

import A4 from '@/components/A4';
import Billing from '@/pages/Billing';
import First from '@/pages/First';
import Office from '@/pages/Office';
import Second from '@/pages/Second';
import Terms from '@/pages/Terms';
import Thank from '@/pages/Thank';
import Third from '@/pages/Third';
import { useSale } from '@/store/database';
import Footer2 from './Footer2';
import Payment from '@/pages/Payment';
import Footer from './Footer';
import Footer3 from './Footer3';

export default function Pdf() {

  const { pages, count } = useSale();
  const [isLoading, setIsLoading] = useState(false);

  const reportRef = useRef(null);

  useEffect(() => {
    pages.forEach(p =>
      p.tables.forEach(t =>
        t.products.forEach(r => {
          if (r.image) {
            const img = new Image();
            img.src = r.image;
          }
        })
      )
    );

  }, [pages]);

  const handleDownload = async () => {
    const input = reportRef.current;
    if (!input) return;

    setIsLoading(true);

    try {
      // Wait for all images inside the container
      const images = input.querySelectorAll("img");
      await Promise.all(
        [...images].map(img => {
          if (img.complete) return Promise.resolve();
          return new Promise(resolve => {
            img.onload = resolve;
            img.onerror = resolve;
          });
        })
      );

      const opt = {
        filename: 'Quotation.pdf',
        image: { type: 'jpeg', quality: 1 },
        html2canvas: {
          scale: 2,          // More stable
          useCORS: true,
          allowTaint: true,
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait',
        },
        pagebreak: { mode: ['css', 'legacy'] }
      };

      await html2pdf().set(opt).from(input).save();
    } catch (err) {
      console.error("PDF ERROR:", err);
    } finally {
      setIsLoading(false);
    }
  };


  // const handleDownload = async () => {
  //   const input = reportRef.current;
  //   if (!input) return;

  //   setIsLoading(true);
  //   try {
  //     const clone = input.cloneNode(true);
  //     await new Promise((resolve) => setTimeout(resolve, 3000));

  //     const opt = {
  //       filename: `Hipzoneautomation Quotation.pdf`,
  //       image: { type: 'jpeg', quality: 1.0 },
  //       html2canvas: {
  //         scale: 3.2,
  //         useCORS: true,
  //         logging: false,
  //         letterRendering: true,
  //         allowTaint: true,
  //       },
  //       jsPDF: {
  //         unit: 'mm',
  //         format: 'a4',
  //         orientation: 'portrait',
  //         compress: false,
  //       },
  //       pagebreak: { mode: ['css', 'legacy'] },
  //     };

  //     await html2pdf().set(opt).from(clone).save();

  //     clone.remove();
  //   } catch (error) {
  //     console.error(error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  return (
    <section className="p-10 min-h-screen bg-gray-100 relative flex justify-center items-center font-robo scrollbar-hide">
      <figure className="p-0 m-0" ref={reportRef}>
        <First />
        <Second />
        <Third />
        {pages.map((page, index) => (
          <A4 key={page.id} className="overflow-hidden">
            <main className="relative w-full h-full bg-black text-white overflow-hidden font-mono px-10 py-8">

              {page.tables.length === 0 && (
                <p className="text-gray-500 italic text-center">No tables added</p>
              )}

              {/* Tables */}
              {page.tables.map((table) => (
                <div key={table.id} className="mb-10">
                  {/* Table Header */}
                  <div className="w-full h-14 flex items-center rounded-tl-lg box-gradient px-4 border border-main rounded-t-md">
                    <p className="text-xl font-semibold">{table.header}</p>
                  </div>
                  {/* <h3 className="text-lg font-semibold mb-4 text-blue-400">{table.header}</h3> */}

                  <div className="overflow-hidden border border-main border-t-0 border-x-0">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="box-gradient2 text-white text-center">
                          {/* 2col */}
                          {table.type === "2col" && (
                            <>
                              <th className="border border-main border-t-0 px-3 py-3 font-semibold">Description</th>
                              <th className="border border-main border-t-0 px-3 py-3 font-semibold">Billing Price</th>
                            </>
                          )}

                          {/* 4col */}
                          {table.type === "4col" && (
                            <>
                              <th className="border border-main border-t-0 rounded-lg px-3 py-3 font-semibold">Item</th>
                              <th className="border border-main border-t-0 rounded-lg px-3 py-3 font-semibold">Qty</th>
                              <th className="border border-main border-t-0 rounded-lg px-3 py-3 font-semibold">Price</th>
                              <th className="border border-main border-t-0 rounded-lg px-3 py-3 font-semibold">Total</th>
                            </>
                          )}

                          {/* 7col */}
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
                              {/* 2col */}
                              {table.type === "2col" && (
                                <>
                                  <td className="border border-main px-3 py-4 text-white text-center break-words whitespace-pre-wrap max-w-[150px]">
                                    {row.item}
                                  </td>
                                  {/* <td className="border border-main px-3 py-4 text-white">{row.item}</td> */}
                                  <td className="border border-main px-3 py-4 text-white">{row.price}</td>
                                </>
                              )}

                              {/* 4col */}
                              {table.type === "4col" && (
                                <>
                                  <td className="border border-main px-3 py-4">
                                    <div className="flex items-center justify-center gap-2">
                                      {row.image && (
                                        <img
                                          src={row.image}
                                          alt={row.item}
                                          className="w-12 h-12 object-cover rounded-md border border-gray-600"
                                        />
                                      )}
                                      <span className="text-white break-words whitespace-pre-wrap max-w-[120px]">
                                        {row.item}
                                      </span>
                                    </div>
                                  </td>
                                  {/* <td className="border border-main px-3 py-4 text-white">{row.item}</td> */}
                                  <td className="border border-main px-3 py-4 text-white">{row.qty}</td>
                                  <td className="border border-main px-3 py-4 text-white">{row.price}</td>
                                  <td className="border border-main px-3 py-4 text-white">{row.total}</td>
                                </>
                              )}

                              {/* 7col */}
                              {table.type === "7col" && (
                                <>
                                  <td className="border border-main px-3 py-4 text-white">{row.sno}</td>
                                  <td className="border border-main px-3 py-4">
                                    <div className="flex items-center justify-center gap-2">
                                      {row.image && (
                                        <img
                                          src={row.image}
                                          alt={row.product}
                                          className="w-12 h-12 object-cover rounded-md border border-gray-600"
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
              <Footer3
              />
            </main>
          </A4>
        ))}


        <Billing />
        <Terms />
        <Payment />
        <Office />
        <Thank />
      </figure>

      {/* Download Button */}
      <div className="absolute -bottom-24 left-10 pb-10" >
        <button
          disabled={isLoading}
          onClick={handleDownload}
          className="mx-2 px-6 py-2 bg-main text-white rounded hover:bg-blue-700"
        >
          {isLoading ? 'Processing...' : 'Download PDF'}
        </button>
      </div>
    </section>
  );
}

