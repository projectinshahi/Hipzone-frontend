import localforage from "localforage";
import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";
import { toast } from "react-toastify";

const context = createContext();

const initialState = {
  home: "Smart Home",
  about: `Thank you for your interest in Hipzone Automation. This quotation has been carefully prepared for your smart home product purchase and includes a detailed breakdown of product costs, applicable taxes, and the final billing total. /n/n At Hipzone Automation, we are committed to providing innovative smart home solutions with complete transparency in pricing. All costs shown here are inclusive of applicable UAE VAT (5%), ensuring accuracy and compliance with regulations.`,
  description: `HIPZONE AUTOMATION transforms homes and businesses into smarter, safer, and more intelligent spaces. With over 8 years of expertise in India and an expanding presence in Dubai, we deliver AI-integrated automation and security solutions powered by trusted global brands.

Our intelligent systems go beyond standard automation. They learn your lifestyle, anticipate your needs, and optimize comfort, security, and energy efficiency automatically. We combine technical expertise with personalized service to ensure every project is reliable, future-ready, and supported by strong customer care.`,
  address: {
    name: "Mohammad Shafi",
    mobile: "+91 9828281929",
    address: "NOORAHA CASTLE AMBILERY, STADIUM ROAD Kerala-673121 India ",
  },
  terms: `Thank you for your interest in Hipzone UAE – Smart Living Solutions. We are committed to providing premium automation and security systems tailored to your needs. Please review the following terms and conditions:`,
  pay: `1.	50% – Upon order confirmation & approval of proposal
	2.	25% – Upon marking automation points and providing wiring drawings at site
	3.	25% – Before dispatch of materials / final handover`,
  rate: { currency: "AED", rate: "5" },
  sale: {
    name: "Sales Team", contact: "name@hipzoneautomation", technumber: "+971556775848", techcontact: "support@hipzoneautomation.com"
  },
  pages: [],
};

// export default function Database({ children }) {
//   // state defaults (do NOT access localStorage at top-level)
//   const [home, setHome] = useState(initialState.home);
//   const [about, setAbout] = useState(initialState.about);
//   const [address, setAddress] = useState(initialState.address);
//   const [terms, setTerms] = useState(initialState.terms);
//   const [rate, setRate] = useState(initialState.rate);
//   const [sale, setSale] = useState(initialState.sale);
//   const [pages, setPages] = useState(initialState.pages);
//   const [pay, setPay] = useState(initialState.pay);
//   const [description, setDescription] = useState(initialState.description);

//   const [isProduct, setIsProduct] = useState(null);

//   // helper to test serializability
//   const isSerializable = (obj) => {
//     try {
//       JSON.stringify(obj);
//       return true;
//     } catch (e) {
//       return false;
//     }
//   };

//   // robust saveChanges (useCallback so we can reference it safely)
//   const saveChanges = useCallback(() => {
//     try {
//       if (typeof window === "undefined" || !window.localStorage) {
//         throw new Error("localStorage is not available in this environment");
//       }

//       const payload = { home, about, address, terms, rate, sale, pages, pay, description };

//       if (!isSerializable(payload)) {
//         throw new Error("Payload is not serializable (circular structure or unsupported type). Inspect `pages` or other state for functions/DOM nodes.");
//       }

//       localStorage.setItem("hipzone-data", JSON.stringify(payload));
//       console.log("Saved to localStorage: hipzone-data", payload);
//       toast.success("Design is Saved Successfully!", {
//         position: "top-right",
//         autoClose: 2500,
//       });
//     } catch (err) {
//       console.error("saveChanges error:", err);
//       toast.error(`Save failed: ${err.message}`, { position: "top-right", autoClose: 4000 });
//     }
//   }, [home, about, address, terms, rate, sale, pages, pay, description]);

//   // load on client after mount
//   useEffect(() => {
//     try {
//       if (typeof window === "undefined" || !window.localStorage) return;
//       const stored = JSON.parse(localStorage.getItem("hipzone-data") || "null");
//       if (stored) {
//         setHome(stored.home ?? initialState.home);
//         setAbout(stored.about ?? initialState.about);
//         setAddress(stored.address ?? initialState.address);
//         setTerms(stored.terms ?? initialState.terms);
//         setRate(stored.rate ?? initialState.rate);
//         setSale(stored.sale ?? initialState.sale);
//         setPages(stored.pages ?? initialState.pages);
//         setPay(stored.pay ?? initialState.pay);
//         console.log("Loaded from localStorage: hipzone-data", stored);
//       }
//     } catch (err) {
//       console.error("Failed to read localStorage:", err);
//     }
//   }, []);

//   // Ctrl+S / ⌘+S handler (uses ref to always call latest saveChanges)
//   const saveRef = useRef(saveChanges);
//   useEffect(() => { saveRef.current = saveChanges; }, [saveChanges]);

//   useEffect(() => {
//     handlers();
//     const handleKeyDown = (event) => {
//       // support Ctrl+S (Windows/Linux) and Meta+S (Mac)
//       const isSaveShortcut = (event.ctrlKey || event.metaKey) && (event.key === "s" || event.key === "S" || event.code === "KeyS");
//       if (isSaveShortcut) {
//         event.preventDefault();
//         if (saveRef.current) saveRef.current();
//       }
//     };
//     window.addEventListener("keydown", handleKeyDown);
//     return () => window.removeEventListener("keydown", handleKeyDown);
//   }, []);

//   // optional: debounce autosave on state changes (uncomment if you want automatic saves)
//   const autosaveDelay = 700; // ms
//   useEffect(() => {
//     const id =
//       setTimeout(() => {
//         try {
//           const payload = { home, about, address, terms, rate, sale, pages, pay, description };
//           if (isSerializable(payload)) {
//             localStorage.setItem("hipzone-data", JSON.stringify(payload));
//             // console.log("Autosaved hipzone-data");
//           }
//         } catch (e) {
//           console.warn("Autosave failed:", e);
//         }
//       }, autosaveDelay);
//     return () => clearTimeout(id);
//   }, [home, about, address, terms, rate, sale, pages, pay, description]);

//   // fetch products (unchanged)
//   async function handlers() {
//     try {
//       const response = await fetch("https://hipzonebackend.vercel.app/products");
//       if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
//       const data = await response.json();
//       setIsProduct(data);
//     } catch (err) {
//       console.error(err);
//     }
//   }

//   function resetData() {
//     setHome(initialState.home);
//     setAbout(initialState.about);
//     setAddress(initialState.address);
//     setTerms(initialState.terms);
//     setRate(initialState.rate);
//     setSale(initialState.sale);
//     setPages(initialState.pages);
//     setPay(initialState.pay);
//     setDescription(initialState.description);

//     if (typeof window !== "undefined" && window.localStorage) {
//       localStorage.removeItem("hipzone-data");
//     }
//     toast.error("Reset the data!", { position: "top-right", autoClose: 2500 });
//     // reload optional: comment out if you don't want full page reload
//     window.location.reload();
//   }

//   return (
//     <context.Provider
//       value={{
//         home, setHome,
//         about, setAbout,
//         address, setAddress,
//         terms, setTerms,
//         rate, setRate,
//         sale, setSale,
//         pay, setPay,
//         pages, setPages,
//         isProduct, setIsProduct,
//         resetData,
//         saveChanges,
//         description, setDescription
//       }}
//     >
//       {children}
//     </context.Provider>
//   );
// }

// export function useSale() {
//   const contexts = useContext(context);
//   if (contexts === undefined) {
//     throw new Error("Context used outside of the provider");
//   }
//   return contexts;
// }


// configure localforage store
localforage.config({
  name: "hipzone_",
  storeName: "hipzonedata",
});

export default function Database({ children }) {
  const [home, setHome] = useState(initialState.home);
  const [about, setAbout] = useState(initialState.about);
  const [address, setAddress] = useState(initialState.address);
  const [terms, setTerms] = useState(initialState.terms);
  const [rate, setRate] = useState(initialState.rate);
  const [sale, setSale] = useState(initialState.sale);
  const [pages, setPages] = useState(initialState.pages);
  const [pay, setPay] = useState(initialState.pay);
  const [description, setDescription] = useState(initialState.description);
  const [isProduct, setIsProduct] = useState(null);

  // helper: compress image before saving
  const compressImage = async (base64) => {
    try {
      const img = document.createElement("img");
      img.src = base64;
      await img.decode();
      const canvas = document.createElement("canvas");
      const scale = Math.min(800 / img.width, 800 / img.height, 1);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL("image/jpeg", 0.7);
    } catch {
      return base64; // fallback
    }
  };

  const cleanupImages = (pagesData) => {
    const cleaned = pagesData.map((p) => {
      if (p.photos && Array.isArray(p.photos)) {
        return { ...p, photos: p.photos.slice(-3) };
      }
      return p;
    });
    return cleaned;
  };

  const saveChanges = useCallback(async () => {
    try {
      const cleanedPages = cleanupImages(pages);
      const payload = { home, about, address, terms, rate, sale, pages: cleanedPages, pay, description };

      await localforage.setItem("hipzonedata", payload);
      toast.success("Design saved successfully!", { position: "top-right", autoClose: 2000 });
    } catch (err) {
      console.error("Save failed:", err);
      toast.error("Storage full or write failed. Retrying without images...");
      try {
        const fallbackPayload = { home, about, address, terms, rate, sale, pay, description };
        await localforage.setItem("hipzonedata", fallbackPayload);
      } catch (e2) {
        console.error("Fallback save failed:", e2);
      }
    }
  }, [home, about, address, terms, rate, sale, pages, pay, description]);

  // load on mount
  useEffect(() => {
    (async () => {
      const stored = await localforage.getItem("hipzonedata");
      if (stored) {
        setHome(stored.home ?? initialState.home);
        setAbout(stored.about ?? initialState.about);
        setAddress(stored.address ?? initialState.address);
        setTerms(stored.terms ?? initialState.terms);
        setRate(stored.rate ?? initialState.rate);
        setSale(stored.sale ?? initialState.sale);
        setPages(stored.pages ?? initialState.pages);
        setPay(stored.pay ?? initialState.pay);
        setDescription(stored.description ?? initialState.description);
      }
    })();
  }, []);

  // debounce autosave
  const autosaveTimer = useRef(null);
  useEffect(() => {
    clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => saveChanges(), 2000);
    return () => clearTimeout(autosaveTimer.current);
  }, [home, about, address, terms, rate, sale, pages, pay, description, saveChanges]);

  // keyboard shortcut
  useEffect(() => {
    const handleSaveShortcut = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        saveChanges();
      }
    };
    window.addEventListener("keydown", handleSaveShortcut);
    return () => window.removeEventListener("keydown", handleSaveShortcut);
  }, [saveChanges]);


  // product fetch
  useEffect(() => {
    fetch("https://hipzonebackend.vercel.app/products/dubai/data")
      .then((r) => r.json())
      .then(setIsProduct)
      .catch(console.error);
  }, []);

  const resetData = async () => {
    await localforage.removeItem("hipzonedata");
    Object.entries(initialState).forEach(([k, v]) => {
      if (typeof v === "object") {
        switch (k) {
          case "address": setAddress(v); break;
          case "rate": setRate(v); break;
          case "sale": setSale(v); break;
          case "pages": setPages([]); break;
        }
      } else {
        if (k === "home") setHome(v);
        if (k === "about") setAbout(v);
        if (k === "terms") setTerms(v);
        if (k === "pay") setPay(v);
        if (k === "description") setDescription(v);
      }
    });
    toast.error("Data reset!");
  };

  return (
    <context.Provider
      value={{
        home, setHome,
        about, setAbout,
        address, setAddress,
        terms, setTerms,
        rate, setRate,
        sale, setSale,
        pages, setPages,
        pay, setPay,
        description, setDescription,
        isProduct, setIsProduct,
        saveChanges, resetData,
      }}
    >
      {children}
    </context.Provider>
  );
}

export function useSale() {
  const c = useContext(context);
  if (!c) throw new Error("useSale must be used within Database provider");
  return c;
}