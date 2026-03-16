import { useSale } from '../store/database';
import { Calculator, FileText, Grid2x2 as Grid, Minus, Plus, ShoppingCart, Trash2, Upload, Copy } from 'lucide-react';
import React, { useCallback, useEffect, useState, useMemo, memo, useRef } from 'react';

// Optimized debounce hook
const useDebouncedCallback = (callback, delay) => {
  const timeoutRef = useRef(null);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  });

  return useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      callbackRef.current(...args);
    }, delay);
  }, [delay]);
};

// Optimized input component with local state
const OptimizedInput = memo(({
  value,
  onChange,
  onBlur,
  type = "text",
  className = "",
  placeholder = "",
  min,
  max,
  step,
  readOnly = false
}) => {
  const [localValue, setLocalValue] = useState(value || '');
  const hasChanged = useRef(false);

  // Sync with external value changes
  useEffect(() => {
    if (!hasChanged.current) {
      setLocalValue(value || '');
    }
  }, [value]);

  const handleChange = useCallback((e) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    hasChanged.current = true;
    onChange?.(newValue);
  }, [onChange]);

  const handleBlur = useCallback(() => {
    hasChanged.current = false;
    onBlur?.(localValue);
  }, [onBlur, localValue]);

  return (
    <input
      type={type}
      value={localValue}
      onChange={handleChange}
      onBlur={handleBlur}
      className={className}
      placeholder={placeholder}
      min={min}
      max={max}
      step={step}
      readOnly={readOnly}
    />
  );
});

OptimizedInput.displayName = "OptimizedInput";

// Optimized Product Row with minimal re-renders
const ProductRow = memo(({
  row,
  rowIndex,
  table,
  pageId,
  tableId,
  isProduct,
  uploadingImages,
  onDeleteRow,
  onUpdateRow,
  onSelectProduct,
  onPhotoUpload,
  onRemovePhoto,
  onDuplicateRow
}) => {
  const uploadingKey = `${pageId}-${tableId}-${rowIndex}`;

  // Debounced update for text fields
  const debouncedUpdate = useDebouncedCallback((field, value) => {
    onUpdateRow(pageId, tableId, rowIndex, field, value);
  }, 150);

  // Immediate update for calculations
  const handleCalculationUpdate = useCallback((field, value) => {
    onUpdateRow(pageId, tableId, rowIndex, field, value);
  }, [pageId, tableId, rowIndex, onUpdateRow]);

  // Handle text input changes
  const handleTextChange = useCallback((field, value) => {
    debouncedUpdate(field, value);
  }, [debouncedUpdate]);

  // Handle text input blur (immediate save)
  const handleTextBlur = useCallback((field, value) => {
    onUpdateRow(pageId, tableId, rowIndex, field, value);
  }, [pageId, tableId, rowIndex, onUpdateRow]);

  // Memoized calculated values
  const calculatedValues = useMemo(() => {
    if (table.type === "7col") {
      const qty = Number(row.qty) || 0;
      const unitPrice = Number(row.unitPrice) || 0;
      const taxRate = Number(row.taxRate) || 0;
      const subtotal = qty * unitPrice;
      const taxAmount = (subtotal * taxRate) / 100;
      const billingPrice = subtotal + taxAmount;

      return {
        taxAmount: taxAmount.toFixed(2),
        billingPrice: billingPrice.toFixed(2)
      };
    } else if (table.type === "4col") {
      const qty = Number(row.qty) || 0;
      const price = Number(row.price) || 0;
      return {
        total: (qty * price).toFixed(2)
      };
    }
    return {};
  }, [row.qty, row.unitPrice, row.taxRate, row.price, table.type]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 relative">
      {/* Action Buttons */}
      <div className="absolute top-3 right-3 flex gap-2">
        <button
          onClick={() => onDuplicateRow(pageId, tableId, rowIndex)}
          className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-full transition-colors duration-200"
          title="Duplicate Product"
        >
          <Copy className="h-4 w-4" />
        </button>
        <button
          onClick={() => onDeleteRow(pageId, tableId, rowIndex)}
          className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-full transition-colors duration-200"
          title="Delete Product"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Product Selection */}
      {isProduct && (
        <div className="mb-4 pr-20">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Product
          </label>
          <select
            onChange={(e) => onSelectProduct(pageId, tableId, rowIndex, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">-- Select Product --</option>
            {isProduct.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} ({item.price})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* 7-Column Layout */}
      {table.type === "7col" && (
        <div className="space-y-4 pr-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">S.No</label>
              <input
                type="number"
                value={row.sno}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 focus:outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
              <OptimizedInput
                value={row.product}
                onChange={(value) => handleTextChange("product", value)}
                onBlur={(value) => handleTextBlur("product", value)}
                placeholder="Enter product name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={row.description}
              onChange={(e) => handleTextChange("description", e.target.value)}
              onBlur={(e) => handleTextBlur("description", e.target.value)}
              placeholder="Enter product description"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
              <OptimizedInput
                type="number"
                min="0"
                step="1"
                value={row.qty}
                onChange={(value) => handleCalculationUpdate("qty", value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price</label>
              <OptimizedInput
                type="number"
                min="0"
                step="0.01"
                value={row.unitPrice}
                onChange={(value) => handleCalculationUpdate("unitPrice", value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tax Rate (%)</label>
              <OptimizedInput
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={row.taxRate}
                onChange={(value) => handleCalculationUpdate("taxRate", value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tax Amount</label>
              <input
                type="text"
                value={calculatedValues.taxAmount || row.taxAmount}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
              />
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <span className="text-lg font-semibold text-gray-700">Billing Price:</span>
            <span className="text-2xl font-bold text-green-600">
              {calculatedValues.billingPrice || row.billingPrice}
            </span>
          </div>
        </div>
      )}

      {/* 4-Column Layout */}
      {table.type === "4col" && (
        <div className="space-y-4 pr-20">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
            <OptimizedInput
              value={row.item}
              onChange={(value) => handleTextChange("item", value)}
              onBlur={(value) => handleTextBlur("item", value)}
              placeholder="Enter product name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
              <OptimizedInput
                type="number"
                min="0"
                step="1"
                value={row.qty}
                onChange={(value) => handleCalculationUpdate("qty", value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
              <OptimizedInput
                type="number"
                min="0"
                step="0.01"
                value={row.price}
                onChange={(value) => handleCalculationUpdate("price", value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total</label>
              <input
                type="text"
                value={calculatedValues.total || row.total}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
              />
            </div>
          </div>
        </div>
      )}

      {/* 2-Column Layout */}
      {table.type === "2col" && (
        <div className="space-y-4 pr-20">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
            <OptimizedInput
              value={row.item}
              onChange={(value) => handleTextChange("item", value)}
              onBlur={(value) => handleTextBlur("item", value)}
              placeholder="Enter product name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
            <OptimizedInput
              type="number"
              min="0"
              step="0.01"
              value={row.price}
              onChange={(value) => handleCalculationUpdate("price", value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      {/* Photo Upload Section - Optimized */}
      <PhotoUploadSection
        row={row}
        pageId={pageId}
        tableId={tableId}
        rowIndex={rowIndex}
        uploadingImages={uploadingImages}
        onPhotoUpload={onPhotoUpload}
        onRemovePhoto={onRemovePhoto}
      />
    </div>
  );
});

ProductRow.displayName = "ProductRow";

// Separate photo upload component to prevent unnecessary re-renders
const PhotoUploadSection = memo(({
  row,
  pageId,
  tableId,
  rowIndex,
  uploadingImages,
  onPhotoUpload,
  onRemovePhoto
}) => {
  const uploadingKey = `${pageId}-${tableId}-${rowIndex}`;

  return (
    <div className="mt-6 pt-4 border-t border-gray-200">
      <label className="block text-sm font-medium text-gray-700 mb-2">Product Photos</label>
      <div className="flex flex-wrap gap-3 mb-3">
        {row.photos?.map((photo, photoIndex) => (
          <div key={photoIndex} className="relative group">
            <img
              src={photo}
              alt={`Product ${photoIndex + 1}`}
              className="w-20 h-20 object-cover rounded-lg border border-gray-300"
            />
            <button
              onClick={() => onRemovePhoto(pageId, tableId, rowIndex, photoIndex)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors duration-200">
          <Upload className="h-4 w-4" />
          {uploadingImages[uploadingKey] ? 'Uploading...' : 'Add Photos'}
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => e.target.files && onPhotoUpload(pageId, tableId, rowIndex, e.target.files)}
            className="hidden"
            disabled={uploadingImages[uploadingKey]}
          />
        </label>
        <span className="text-sm text-gray-500">
          {row.photos?.length || 0} photo{(row.photos?.length || 0) !== 1 ? 's' : ''} added
        </span>
      </div>
    </div>
  );
});

PhotoUploadSection.displayName = "PhotoUploadSection";

// Optimized Table Component with better memoization
const TableComponent = memo(({
  table,
  pageId,
  isProduct,
  uploadingImages,
  onUpdateTableHeader,
  onDeleteTable,
  onAddRow,
  onDeleteRow,
  onUpdateRow,
  onSelectProduct,
  onPhotoUpload,
  onRemovePhoto,
  onDuplicateRow,
  tableTotal
}) => {
  const handleHeaderChange = useCallback((e) => {
    onUpdateTableHeader(pageId, table.id, e.target.value);
  }, [pageId, table.id, onUpdateTableHeader]);

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* Table Header */}
      <div className="bg-white px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Grid className="h-4 w-4 text-gray-600" />
            <input
              type="text"
              value={table.header}
              onChange={handleHeaderChange}
              className="font-semibold text-gray-900 border border-transparent px-2 py-1 rounded-md 
               focus:border-gray-300 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
              {table.type === "7col"
                ? "Full Invoice"
                : table.type === "4col"
                  ? "Standard"
                  : "Simple"}
            </span>
          </div>

          <button
            onClick={() => onDeleteTable(pageId, table.id)}
            className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-md text-sm font-medium transition-colors duration-200"
          >
            <Trash2 className="h-3 w-3" />
            Delete
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="p-4">
        {table.products.length > 0 ? (
          <div className="space-y-4">
            {table.products.map((row, i) => (
              <ProductRow
                key={`${table.id}-${i}`}
                row={row}
                rowIndex={i}
                table={table}
                pageId={pageId}
                tableId={table.id}
                isProduct={isProduct}
                uploadingImages={uploadingImages}
                onDeleteRow={onDeleteRow}
                onUpdateRow={onUpdateRow}
                onSelectProduct={onSelectProduct}
                onPhotoUpload={onPhotoUpload}
                onRemovePhoto={onRemovePhoto}
                onDuplicateRow={onDuplicateRow}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">No products added yet</h3>
            <p className="text-sm">Click Add Product to get started</p>
          </div>
        )}

        {/* Add Row Button */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={() => onAddRow(pageId, table.id, table.type)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-200 shadow-sm"
          >
            <Plus className="h-5 w-5" />
            Add Product
          </button>
        </div>

        {/* Table Total */}
        {table.products.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-blue-900 flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Table Total:
                </span>
                <span className="text-2xl font-bold text-blue-900">
                  {tableTotal}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for better memoization
  return (
    prevProps.table === nextProps.table &&
    prevProps.tableTotal === nextProps.tableTotal &&
    prevProps.uploadingImages === nextProps.uploadingImages
  );
});

TableComponent.displayName = "TableComponent";

function OptimizedForm3() {
  const {
    terms, setTerms,
    pay, setPay,
    setCount,
    address, setAddress,
    pages, setPages,
    sale, setSale,
    isProduct,
    rate, setRate,
    resetData,
    saveChanges,
    processAndCompressImages,
    debouncedAutoSave
  } = useSale();

  const [uploadingImages, setUploadingImages] = useState({});

  // Optimized handlers with better performance
  const handleIncrease = useCallback(() => {
    const newPage = {
      id: Date.now(),
      name: `Page ${pages.length + 1}`,
      tables: []
    };
    setPages(prev => [...prev, newPage]);
    setCount(count => count + 1);
  }, [setPages, setCount, pages.length]);

  const handleDecrease = useCallback(() => {
    if (pages.length > 0) {
      setPages(prev => prev.slice(0, -1));
      setCount(count => count - 1);
    }
  }, [setPages, setCount, pages.length]);

  // Optimized table operations
  const handleAddTable = useCallback((pageId, type) => {
    setPages((prev) =>
      prev.map((p) =>
        p.id === pageId
          ? {
            ...p,
            tables: [
              ...p.tables,
              {
                id: Date.now(),
                header: `Table ${p.tables.length + 1}`,
                type,
                products: [],
              },
            ],
          }
          : p
      )
    );
  }, [setPages]);

  const handleDeleteTable = useCallback((pageId, tableId) => {
    setPages((prev) =>
      prev.map((p) =>
        p.id === pageId
          ? { ...p, tables: p.tables.filter((t) => t.id !== tableId) }
          : p
      )
    );
  }, [setPages]);

  const handleUpdateTableHeader = useCallback((pageId, tableId, newHeader) => {
    setPages((prev) =>
      prev.map((p) =>
        p.id === pageId
          ? {
            ...p,
            tables: p.tables.map((t) =>
              t.id === tableId ? { ...t, header: newHeader } : t
            ),
          }
          : p
      )
    );
  }, [setPages]);

  // More efficient renumbering
  const renumberTable = useCallback((tableProducts) => {
    return tableProducts.map((product, index) => ({
      ...product,
      sno: index + 1
    }));
  }, []);

  const handleAddRow = useCallback((pageId, tableId, tableType) => {
    setPages((prev) =>
      prev.map((p) =>
        p.id === pageId
          ? {
            ...p,
            tables: p.tables.map((t) => {
              if (t.id !== tableId) return t;

              let newProduct;
              if (tableType === "7col") {
                newProduct = {
                  sno: t.products.length + 1,
                  product: "New Product",
                  description: "",
                  qty: 1,
                  unitPrice: 0,
                  taxRate: rate?.rate || 5,
                  taxAmount: "0.00",
                  billingPrice: "0.00",
                  photos: []
                };
              } else if (tableType === "4col") {
                newProduct = {
                  item: "New Product",
                  qty: 1,
                  price: 0,
                  total: "0.00"
                };
              } else {
                newProduct = {
                  item: "New Product",
                  price: 0
                };
              }

              return {
                ...t,
                products: [...t.products, newProduct]
              };
            }),
          }
          : p
      )
    );
  }, [setPages, rate?.rate]);

  // Optimized update with calculations
  const handleUpdateRow = useCallback((pageId, tableId, rowIndex, field, value) => {
    setPages((prev) =>
      prev.map((p) =>
        p.id === pageId
          ? {
            ...p,
            tables: p.tables.map((t) => {
              if (t.id !== tableId) return t;

              return {
                ...t,
                products: t.products.map((r, i) => {
                  if (i !== rowIndex) return r;

                  const updatedRow = { ...r, [field]: value };

                  // Calculate for 7col table
                  if (t.type === "7col") {
                    const qty = Number(updatedRow.qty) || 0;
                    const unitPrice = Number(updatedRow.unitPrice) || 0;
                    const taxRate = Number(updatedRow.taxRate) || 0;

                    const subtotal = qty * unitPrice;
                    const taxAmount = (subtotal * taxRate) / 100;
                    const billingPrice = subtotal + taxAmount;

                    return {
                      ...updatedRow,
                      taxAmount: taxAmount.toFixed(2),
                      billingPrice: billingPrice.toFixed(2)
                    };
                  }

                  // Calculate for 4col table
                  if (t.type === "4col") {
                    if (field === "qty" || field === "price") {
                      const qty = field === "qty" ? Number(value) : r.qty || 0;
                      const price = field === "price" ? Number(value) : r.price || 0;
                      updatedRow.total = (qty * price).toFixed(2);
                    }
                  }

                  return updatedRow;
                })
              };
            }),
          }
          : p
      )
    );
  }, [setPages]);

  const handlePhotoUpload = useCallback(async (pageId, tableId, rowIndex, files) => {
    const uploadingKey = `${pageId}-${tableId}-${rowIndex}`;
    setUploadingImages(prev => ({ ...prev, [uploadingKey]: true }));

    try {
      // Use the compressed image processing from the store
      const photoBase64Array = await processAndCompressImages(files);

      setPages((prev) =>
        prev.map((p) =>
          p.id === pageId
            ? {
              ...p,
              tables: p.tables.map((t) =>
                t.id === tableId
                  ? {
                    ...t,
                    products: t.products.map((r, i) =>
                      i === rowIndex
                        ? {
                          ...r,
                          photos: [...(r.photos || []), ...photoBase64Array],
                          image: photoBase64Array[0] || r.image,
                        }
                        : r
                    ),
                  }
                  : t
              ),
            }
            : p
        )
      );

      // Trigger auto-save after image upload
      debouncedAutoSave();
    } catch (err) {
      console.error("Image conversion failed", err);
    } finally {
      setUploadingImages(prev => ({ ...prev, [uploadingKey]: false }));
    }
  }, [setPages, processAndCompressImages, debouncedAutoSave]);

  const handleRemovePhoto = useCallback((pageId, tableId, rowIndex, photoIndex) => {
    setPages((prev) =>
      prev.map((p) =>
        p.id === pageId
          ? {
            ...p,
            tables: p.tables.map((t) =>
              t.id === tableId
                ? {
                  ...t,
                  products: t.products.map((r, i) =>
                    i === rowIndex
                      ? {
                        ...r,
                        photos: r.photos?.filter((_, pIndex) => pIndex !== photoIndex) || [],
                        image: photoIndex === 0 ? (r.photos?.[1] || undefined) : r.image
                      }
                      : r
                  ),
                }
                : t
            ),
          }
          : p
      )
    );

    // Trigger auto-save after removing photo
    debouncedAutoSave();
  }, [setPages, debouncedAutoSave]);

  const handleDeleteRow = useCallback((pageId, tableId, rowIndex) => {
    setPages((prev) =>
      prev.map((p) =>
        p.id === pageId
          ? {
            ...p,
            tables: p.tables.map((t) =>
              t.id === tableId
                ? {
                  ...t,
                  products: t.type === "7col"
                    ? renumberTable(t.products.filter((_, i) => i !== rowIndex))
                    : t.products.filter((_, i) => i !== rowIndex),
                }
                : t
            ),
          }
          : p
      )
    );

    // Trigger auto-save after row operations
    debouncedAutoSave();
  }, [setPages, renumberTable, debouncedAutoSave]);

  const handleDuplicateRow = useCallback((pageId, tableId, rowIndex) => {
    setPages((prev) =>
      prev.map((p) =>
        p.id === pageId
          ? {
            ...p,
            tables: p.tables.map((t) =>
              t.id === tableId
                ? {
                  ...t,
                  products: [
                    ...t.products.slice(0, rowIndex + 1),
                    {
                      ...t.products[rowIndex],
                      ...(t.type === "7col" ? { sno: 0 } : {}),
                      photos: [...(t.products[rowIndex].photos || [])]
                    },
                    ...t.products.slice(rowIndex + 1)
                  ],
                }
                : t
            ),
          }
          : p
      )
    );

    // Renumber after duplication for 7col tables
    if (pages.find(p => p.id === pageId)?.tables.find(t => t.id === tableId)?.type === "7col") {
      setTimeout(() => {
        setPages((prev) =>
          prev.map((p) =>
            p.id === pageId
              ? {
                ...p,
                tables: p.tables.map((t) =>
                  t.id === tableId && t.type === "7col"
                    ? { ...t, products: renumberTable(t.products) }
                    : t
                ),
              }
              : p
          )
        );
      }, 0);
    }

    // Trigger auto-save after duplication
    debouncedAutoSave();
  }, [setPages, pages, renumberTable, debouncedAutoSave]);

  const handleSelectProduct = useCallback((pageId, tableId, rowIndex, productId) => {
    const selected = isProduct.find((p) => p.id === Number(productId));
    if (!selected) return;

    setPages((prev) =>
      prev.map((p) =>
        p.id === pageId
          ? {
            ...p,
            tables: p.tables.map((t) =>
              t.id === tableId
                ? {
                  ...t,
                  products: t.products.map((r, i) => {
                    if (i !== rowIndex) return r;

                    if (t.type === "7col") {
                      const qty = r.qty || 1;
                      const unitPrice = selected.price;
                      const taxRate = r.taxRate || 18;
                      const subtotal = qty * unitPrice;
                      const taxAmount = (subtotal * taxRate) / 100;
                      const billingPrice = subtotal + taxAmount;

                      return {
                        ...r,
                        product: selected.name,
                        unitPrice: unitPrice,
                        taxAmount: taxAmount.toFixed(2),
                        billingPrice: billingPrice.toFixed(2)
                      };
                    } else {
                      return {
                        ...r,
                        item: selected.name,
                        price: selected.price,
                        total: t.type === "4col" ? (selected.price * (r.qty || 1)).toFixed(2) : selected.price
                      };
                    }
                  }),
                }
                : t
            ),
          }
          : p
      )
    );

    // Trigger auto-save after updates
    debouncedAutoSave();
  }, [isProduct, setPages, debouncedAutoSave]);

  // Memoized calculations
  const tableCalculations = useMemo(() => {
    const calculations = {};
    pages.forEach(page => {
      page.tables.forEach(table => {
        const total = table.products.reduce((sum, r) => {
          if (table.type === "7col") {
            return sum + (Number(r.billingPrice) || 0);
          } else if (table.type === "4col") {
            return sum + (Number(r.total) || 0);
          } else {
            return sum + (Number(r.price) || 0);
          }
        }, 0);
        calculations[table.id] = total.toFixed(2);
      });
    });
    return calculations;
  }, [pages]);

  const pageCalculations = useMemo(() => {
    const calculations = {};
    pages.forEach(page => {
      const total = page.tables.reduce((sum, table) => {
        return sum + Number(tableCalculations[table.id] || 0);
      }, 0);
      calculations[page.id] = total.toFixed(2);
    });
    return calculations;
  }, [pages, tableCalculations]);

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 w-full min-h-screen">
      <div className="px py-8 max-w-xl mx-auto">
        {/* Header */}
        <main className='flex justify-center items-center'>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <FileText className="h-8 w-8 text-blue-600" />
              Invoice Form Manager
            </h1>
            <p className="text-gray-600">Create professional invoices with detailed product information</p>
          </div>
        </main>

        <div className="flex gap-4 self-center justify-self-end py-4">
          <button
            onClick={resetData}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Reset
          </button>
          <button
            onClick={saveChanges}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Save Changes
          </button>
        </div>

        {/* Client Management - Same as before */}
        <main className="bg-white rounded-xl shadow-md border border-gray-200 p-8 mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Client Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-semibold text-lg text-gray-800 mb-2">Client Name</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                onChange={(e) => setAddress((prev) => ({ ...prev, name: e.target.value }))}
                value={address.name}
                placeholder="Enter client name"
              />
            </div>

            <div>
              <label className="block font-semibold text-lg text-gray-800 mb-2">Phone Number</label>
              <input
                type="tel"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                onChange={(e) => setAddress((prev) => ({ ...prev, mobile: e.target.value }))}
                value={address.mobile}
                placeholder="Enter phone number"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block font-semibold text-lg text-gray-800 mb-2">Client Address</label>
            <textarea
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              onChange={(e) => setAddress((prev) => ({ ...prev, address: e.target.value }))}
              value={address.address}
              placeholder="Enter complete address"
            />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 my-10">Tax & Currency</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 items-center justify-center gap-6">
            <div>
              <label className="block font-semibold text-lg text-gray-800 mb-2">Standard Tax %</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                onChange={(e) => setRate((prev) => ({ ...prev, rate: e.target.value }))}
                value={rate.rate}
                placeholder="Enter tax rate"
              />
            </div>

            <div>
              <label className="block font-semibold text-lg text-gray-800 mb-2">Currency ({rate?.currency})</label>
              <select
                className='w-full h-12 border border-gray-300 rounded-lg px-4 text-base focus:outline-none focus:ring-2 focus:ring-blue-500'
                onChange={(e) => setRate((prev) => ({ ...prev, currency: e.target.value }))}
                value={rate.currency}
              >
                <option value={"INR"}>INR</option>
                <option value={"AED"}>AED</option>
              </select>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 my-10">Sales Contact</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-10">
            <div>
              <label className="block font-semibold text-lg text-gray-800 mb-2">Sales Person Name</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                onChange={(e) => setSale((prev) => ({ ...prev, name: e.target.value }))}
                value={sale.name}
                placeholder="Enter the Name"
              />
            </div>

            <div>
              <label className="block font-semibold text-lg text-gray-800 mb-2">Sales Person Contact</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                onChange={(e) => setSale((prev) => ({ ...prev, contact: e.target.value }))}
                value={sale.contact}
                placeholder="Enter the Contact"
              />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 my-10">Technical Support</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-10">
            <div>
              <label className="block font-semibold text-lg text-gray-800 mb-2">Support Number</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                onChange={(e) => setSale((prev) => ({ ...prev, technumber: e.target.value }))}
                value={sale.technumber}
                placeholder="Enter the Number"
              />
            </div>

            <div>
              <label className="block font-semibold text-lg text-gray-800 mb-2">Support Email</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                onChange={(e) => setSale((prev) => ({ ...prev, techcontact: e.target.value }))}
                value={sale.techcontact}
                placeholder="Enter the Email"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-2xl font-semibold text-gray-800 mb-2">Terms & Conditions</label>
            <textarea
              rows={6}
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base font-mono resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="Enter terms and conditions..."
            />
          </div>

          <div className="mt-6">
            <label className="block text-2xl font-semibold text-gray-800 mb-2">Payment Terms</label>
            <textarea
              rows={6}
              value={pay}
              onChange={(e) => setPay(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base font-mono resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="Enter Payment Terms..."
            />
          </div>
        </main>

        {/* Page Controls */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Page Management</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleIncrease}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Add Page
            </button>
            <button
              onClick={handleDecrease}
              disabled={pages.length <= 0}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors duration-200 shadow-sm"
            >
              <Minus className="h-4 w-4" />
              Remove Page
            </button>
          </div>
        </div>

        {/* Form Editor Pages */}
        <div className="space-y-8 mb-12">
          {pages?.map((page) => (
            <div key={page.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Page Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <FileText className="h-5 w-5 text-white" />
                    {page.name}
                  </h2>
                  <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {page.tables.length} Table{page.tables.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>

              <div className="p-6">
                {/* Table Controls */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Add Table Type</h3>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => handleAddTable(page.id, "2col")}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors duration-200 shadow-sm"
                    >
                      <Grid className="h-4 w-4" />
                      2-Column (Item, Price)
                    </button>
                    <button
                      onClick={() => handleAddTable(page.id, "4col")}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors duration-200 shadow-sm"
                    >
                      <Grid className="h-4 w-4" />
                      4-Column (Item, Qty, Price, Total)
                    </button>
                    <button
                      onClick={() => handleAddTable(page.id, "7col")}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors duration-200 shadow-sm"
                    >
                      <Grid className="h-4 w-4" />
                      7-Column (Full Invoice)
                    </button>
                  </div>
                </div>

                {/* Tables */}
                <div className="space-y-6">
                  {page.tables.map((table) => (
                    <TableComponent
                      key={table.id}
                      table={table}
                      pageId={page.id}
                      isProduct={isProduct}
                      uploadingImages={uploadingImages}
                      onUpdateTableHeader={handleUpdateTableHeader}
                      onDeleteTable={handleDeleteTable}
                      onAddRow={handleAddRow}
                      onDeleteRow={handleDeleteRow}
                      onUpdateRow={handleUpdateRow}
                      onSelectProduct={handleSelectProduct}
                      onPhotoUpload={handlePhotoUpload}
                      onRemovePhoto={handleRemovePhoto}
                      onDuplicateRow={handleDuplicateRow}
                      tableTotal={tableCalculations[table.id] || '0.00'}
                    />
                  ))}
                </div>

                {/* Page Total */}
                {page.tables.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                          <Calculator className="h-6 w-6 text-green-600" />
                          Page Total:
                        </span>
                        <span className="text-3xl font-bold text-green-600">
                          {pageCalculations[page.id] || '0.00'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {page.tables.length === 0 && (
                  <div className="text-center py-16 text-gray-500">
                    <Grid className="h-20 w-20 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-xl font-medium mb-2">No tables yet</h3>
                    <p className="text-lg mb-6">Add a table to start creating your invoice</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default OptimizedForm3;