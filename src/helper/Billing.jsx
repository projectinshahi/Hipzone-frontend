import { useEffect, useState, useCallback } from "react";
import A4 from "@/components/A4";
import { useSale } from "@/store/Database2";
import Footer2 from "@/ui/Footer2";

/**
 * Helper: safely parse numbers
 */
const parseNumber = (val) => {
  if (val === null || val === undefined || val === "") return 0;
  const cleaned = String(val).replace(/[,₹$\s]/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
};

function Billing() {
  const { rate, sale, pages } = useSale();
  const [totals, setTotals] = useState({
    subTotal: 0,
    taxTotal: 0,
    overallTotal: 0,
  });

  /**
   * Table-level calculations
   */
  const getTableCalculations = useCallback((table) => {
    let subtotal = 0;
    let totalTax = 0;

    if (!table?.products) return { subtotal: 0, totalTax: 0, grandTotal: 0 };

    table.products.forEach((r) => {
      const qty = parseNumber(r.qty ?? r.quantity) || 0;

      if (table.type === "7col") {
        const unitPrice = parseNumber(r.unitPrice);
        const taxRate = parseNumber(r.taxRate); // percent
        const itemSubtotal = unitPrice * qty;
        const itemTax = (itemSubtotal * taxRate) / 100;

        subtotal += itemSubtotal;
        totalTax += itemTax;
      } else if (table.type === "4col") {
        const price = parseNumber(r.price);
        subtotal += price * qty;
      } else {
        // fallback for 2col or others
        const price = parseNumber(r.price ?? r.total ?? r.amount);
        subtotal += qty > 0 ? price * qty : price;
      }
    });

    return {
      subtotal,
      totalTax,
      grandTotal: subtotal + totalTax,
    };
  }, []);

  /**
   * Page-level calculations
   */
  const getPageCalculations = useCallback(
    (page) => {
      let pageSubtotal = 0;
      let pageTotalTax = 0;

      if (!page?.tables) return { subtotal: 0, totalTax: 0, grandTotal: 0 };

      page.tables.forEach((table) => {
        const tableCalc = getTableCalculations(table);
        pageSubtotal += tableCalc.subtotal;
        pageTotalTax += tableCalc.totalTax;
      });

      return {
        subtotal: pageSubtotal,
        totalTax: pageTotalTax,
        grandTotal: pageSubtotal + pageTotalTax,
      };
    },
    [getTableCalculations]
  );

  /**
   * Document totals
   */
  const calculateTotals = useCallback(() => {
    let subTotal = 0;
    let taxTotal = 0;

    if (!pages || !Array.isArray(pages)) return;

    pages.forEach((page) => {
      const pageCalc = getPageCalculations(page);
      subTotal += pageCalc.subtotal;
      taxTotal += pageCalc.totalTax;
    });

    setTotals({
      subTotal,
      taxTotal,
      overallTotal: subTotal + taxTotal,
    });
  }, [pages, getPageCalculations]);

  useEffect(() => {
    calculateTotals();
  }, [calculateTotals]);

  return (
    <A4>
      <main className="relative w-[210mm] h-[297mm] bg-black text-white overflow-hidden font-pop">
        <header className="flex flex-col items-center mt-12">
          <h1 className="font-extrabold text-main text-[9rem] leading-none text-center">
            HIPZONE
          </h1>
          <p className="text-5xl font-medium text-white opacity-80 mt-4">
            AUTOMATION
          </p>
        </header>

        {/* Tax Summary Section */}
        <div className="m-10 mt-16">
          {/* Title */}
          <div className="w-full h-14 flex items-center rounded-t-lg box-gradient px-4 border border-main">
            <p className="text-xl font-semibold">Tax Summary</p>
          </div>

          {/* Table */}
          <div className="overflow-hidden border border-t-0 border-main">
            <table className="w-full text-sm border-collapse text-center">
              <thead className="box-gradient2 text-white">
                <tr>
                  <th className="border border-main px-3 py-3 font-semibold">
                    Tax Details
                  </th>
                  <th className="border border-main px-3 py-3 font-semibold">
                    Taxable Amount ({rate?.currency})
                  </th>
                  <th className="border border-main px-3 py-3 font-semibold">
                    Tax Amount (
                    {rate?.currency?.toLowerCase() === "inr" ? "GST" : "VAT"})
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-main px-3 py-3">
                    Standard Rate ({rate?.rate}%)
                  </td>
                  <td className="border border-main px-3 py-3">
                    {totals.subTotal.toFixed(2)}
                  </td>
                  <td className="border border-main px-3 py-3">
                    {totals.taxTotal.toFixed(2)}
                  </td>
                </tr>
                <tr className="font-bold">
                  <td className="border border-main px-3 py-3">Subtotal</td>
                  <td className="border border-main px-3 py-3">
                    {rate?.currency} {totals.subTotal.toFixed(2)}
                  </td>
                  <td className="border border-main px-3 py-3">
                    {rate?.currency} {totals.taxTotal.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Grand Total */}
          <div className="mt-10 w-full flex items-center justify-between rounded-lg box-gradient px-6 py-4">
            <p className="text-lg font-semibold">Grand Total:</p>
            <p className="text-xl font-bold">
              {rate?.currency} {totals.overallTotal.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Sale Info */}
        <aside className="mx-10 my-12">
          <div className="w-full h-14 flex items-center rounded-lg box-gradient px-4">
            <p className="text-xl font-semibold">
              Sale from Hipzone Automation
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-4 text-lg">
            <div className="flex gap-2">
              <p className="font-semibold w-24">Name :</p>
              <p className="flex-1 text-base text-white opacity-80">
                {sale.name || "-"}
              </p>
            </div>
            <div className="flex gap-2">
              <p className="font-semibold w-24">Contact :</p>
              <p className="flex-1 text-base text-white opacity-80">
                {sale.contact || "-"}
              </p>
            </div>
          </div>
        </aside>
      </main>

      <Footer2 />
    </A4>
  );
}

export default Billing;
