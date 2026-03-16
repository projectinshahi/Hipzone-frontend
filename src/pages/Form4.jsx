import { useSale } from '../store/database';
import { Calculator, FileText, Grid2x2 as Grid, Minus, Plus, ShoppingCart, Trash2, Upload, Copy } from 'lucide-react';
import React, { useCallback, useEffect, useState, useMemo, memo, useRef, useReducer } from 'react';

// Performance-optimized debounce with immediate feedback
const useAdvancedDebounce = (callback, delay, immediate = false) => {
  const timeoutRef = useRef(null);
  const callbackRef = useRef(callback);
  const immediateRef = useRef(immediate);

  useEffect(() => {
    callbackRef.current = callback;
    immediateRef.current = immediate;
  });

  return useCallback((...args) => {
    const callNow = immediateRef.current && !timeoutRef.current;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null;
      if (!immediateRef.current) callbackRef.current(...args);
    }, delay);

    if (callNow) callbackRef.current(...args);
  }, [delay]);
};

// Ultra-fast input component with minimal re-renders
const FastInput = memo(({
  value,
  onChange,
  onCommit,
  type = "text",
  className = "",
  placeholder = "",
  min,
  max,
  step,
  readOnly = false,
  debounceMs = 50 // Reduced for faster response
}) => {
  const [localValue, setLocalValue] = useState(value || '');
  const [isDirty, setIsDirty] = useState(false);
  const inputRef = useRef(null);
  const mountedRef = useRef(true);

  // Sync external changes only when not dirty
  useEffect(() => {
    if (!isDirty && value !== localValue) {
      setLocalValue(value || '');
    }
  }, [value, isDirty, localValue]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Debounced commit with cleanup
  const debouncedCommit = useAdvancedDebounce((val) => {
    if (mountedRef.current) {
      onCommit?.(val);
      setIsDirty(false);
    }
  }, debounceMs, true); // Immediate feedback

  const handleChange = useCallback((e) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    setIsDirty(true);

    // Immediate feedback for UI
    onChange?.(newValue);

    // Debounced save
    debouncedCommit(newValue);
  }, [onChange, debouncedCommit]);

  const handleBlur = useCallback(() => {
    if (isDirty) {
      onCommit?.(localValue);
      setIsDirty(false);
    }
  }, [onCommit, localValue, isDirty]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && isDirty) {
      onCommit?.(localValue);
      setIsDirty(false);
      inputRef.current?.blur();
    }
  }, [onCommit, localValue, isDirty]);

  return (
    <input
      ref={inputRef}
      type={type}
      value={localValue}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={`${className} ${isDirty ? 'ring-2 ring-blue-300' : ''}`}
      placeholder={placeholder}
      min={min}
      max={max}
      step={step}
      readOnly={readOnly}
    />
  );
});

FastInput.displayName = "FastInput";

// Ultra-fast textarea for description
const FastTextarea = memo(({
  value,
  onChange,
  onCommit,
  className = "",
  placeholder = "",
  rows = 3,
  debounceMs = 100 // Reduced for faster response
}) => {
  const [localValue, setLocalValue] = useState(value || '');
  const [isDirty, setIsDirty] = useState(false);
  const textareaRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    if (!isDirty && value !== localValue) {
      setLocalValue(value || '');
    }
  }, [value, isDirty, localValue]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const debouncedCommit = useAdvancedDebounce((val) => {
    if (mountedRef.current) {
      onCommit?.(val);
      setIsDirty(false);
    }
  }, debounceMs, true); // Immediate feedback

  const handleChange = useCallback((e) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    setIsDirty(true);

    onChange?.(newValue);
    debouncedCommit(newValue);
  }, [onChange, debouncedCommit]);

  const handleBlur = useCallback(() => {
    if (isDirty) {
      onCommit?.(localValue);
      setIsDirty(false);
    }
  }, [onCommit, localValue, isDirty]);

  return (
    <textarea
      ref={textareaRef}
      value={localValue}
      onChange={handleChange}
      onBlur={handleBlur}
      className={`${className} ${isDirty ? 'ring-2 ring-blue-300' : ''}`}
      placeholder={placeholder}
      rows={rows}
    />
  );
});

FastTextarea.displayName = "FastTextarea";

// Row state reducer for better performance
const rowReducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_FIELD':
      return { ...state, [action.field]: action.value };
    case 'CALCULATE_7COL': {
      const qty = Number(state.qty) || 0;
      const unitPrice = Number(state.unitPrice) || 0;
      const taxRate = Number(state.taxRate) || 0;
      const subtotal = qty * unitPrice;
      const taxAmount = (subtotal * taxRate) / 100;
      const billingPrice = subtotal + taxAmount;
      return {
        ...state,
        taxAmount: taxAmount.toFixed(2),
        billingPrice: billingPrice.toFixed(2)
      };
    }
    case 'CALCULATE_4COL': {
      const qtyVal = Number(state.qty) || 0;
      const priceVal = Number(state.price) || 0;
      return {
        ...state,
        total: (qtyVal * priceVal).toFixed(2)
      };
    }
    case 'RESET':
      return action.payload;
    default:
      return state;
  }
};

// Optimized Product Row with local state management
const OptimizedProductRow = memo(({
  initialRow,
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
  onDuplicateRow,
  onSnoChange // New prop for S.No change handling
}) => {
  const [row, dispatch] = useReducer(rowReducer, initialRow);
  const uploadingKey = `${pageId}-${tableId}-${rowIndex}`;
  const hasChangedRef = useRef(false);
  const isInitialMount = useRef(true);

  // Sync with external changes only when necessary
  useEffect(() => {
    if (!hasChangedRef.current && JSON.stringify(initialRow) !== JSON.stringify(row)) {
      dispatch({ type: 'RESET', payload: initialRow });
    }
  }, [initialRow, row]);

  // Skip initial mount for auto-increment
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
  }, []);

  // Optimized field update with local state
  const handleFieldChange = useCallback((field, value) => {
    dispatch({ type: 'UPDATE_FIELD', field, value });
    hasChangedRef.current = true;
  }, []);

  const handleFieldCommit = useCallback((field, value) => {
    hasChangedRef.current = false;
    onUpdateRow(pageId, tableId, rowIndex, field, value);

    // Special handling for S.No changes
    if (field === 'sno' && table.type === "7col") {
      onSnoChange?.(pageId, tableId, rowIndex, Number(value));
    }

    // Trigger calculations for numeric fields
    if (table.type === "7col" && ['qty', 'unitPrice', 'taxRate'].includes(field)) {
      setTimeout(() => dispatch({ type: 'CALCULATE_7COL' }), 0);
    } else if (table.type === "4col" && ['qty', 'price'].includes(field)) {
      setTimeout(() => dispatch({ type: 'CALCULATE_4COL' }), 0);
    }
  }, [pageId, tableId, rowIndex, table.type, onUpdateRow, onSnoChange]);

  // Immediate calculation updates
  const handleCalculationField = useCallback((field, value) => {
    dispatch({ type: 'UPDATE_FIELD', field, value });
    onUpdateRow(pageId, tableId, rowIndex, field, value);

    if (table.type === "7col") {
      dispatch({ type: 'CALCULATE_7COL' });
    } else if (table.type === "4col") {
      dispatch({ type: 'CALCULATE_4COL' });
    }
  }, [pageId, tableId, rowIndex, table.type, onUpdateRow]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 relative transition-all duration-200 hover:shadow-md">
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
        <div className="mb-4 pr-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Product
          </label>
          <select
            onChange={(e) => onSelectProduct(pageId, tableId, rowIndex, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
        <div className="space-y-4 pr-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                S.No <span className="text-blue-600">(Smart Auto)</span>
              </label>
              <FastInput
                type="number"
                min="1"
                step="1"
                value={row.sno}
                onChange={(value) => handleFieldChange("sno", value)}
                onCommit={(value) => handleFieldCommit("sno", value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-blue-50 text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white font-medium transition-all"
                debounceMs={100}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name <span className="text-green-600">(*)</span>
              </label>
              <FastInput
                value={row.product}
                onChange={(value) => handleFieldChange("product", value)}
                onCommit={(value) => handleFieldCommit("product", value)}
                placeholder="Enter product name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                debounceMs={50}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-green-600">(*)</span>
            </label>
            <FastTextarea
              value={row.description}
              onChange={(value) => handleFieldChange("description", value)}
              onCommit={(value) => handleFieldCommit("description", value)}
              placeholder="Enter product description"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-all"
              rows={3}
              debounceMs={100}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity <span className="text-green-600"></span>
              </label>
              <FastInput
                type="number"
                min="0"
                step="1"
                value={row.qty}
                onChange={(value) => handleCalculationField("qty", value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                debounceMs={25}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit Price <span className="text-green-600"></span>
              </label>
              <FastInput
                type="number"
                min="0"
                step="0.01"
                value={row.unitPrice}
                onChange={(value) => handleCalculationField("unitPrice", value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                debounceMs={25}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tax Rate (%) <span className="text-green-600"></span>
              </label>
              <FastInput
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={row.taxRate}
                onChange={(value) => handleCalculationField("taxRate", value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                debounceMs={25}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tax Amount <span className="text-purple-600"></span>
              </label>
              <input
                type="text"
                value={row.taxAmount || "0.00"}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-purple-50 text-purple-700 font-medium"
              />
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <span className="text-lg font-semibold text-gray-700">Billing Price:</span>
            <span className="text-2xl font-bold text-green-600">
              {row.billingPrice || "0.00"}
            </span>
          </div>
        </div>
      )}

      {/* 4-Column Layout */}
      {table.type === "4col" && (
        <div className="space-y-4 pr-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Name <span className="text-green-600">(*)</span>
            </label>
            <FastInput
              value={row.item}
              onChange={(value) => handleFieldChange("item", value)}
              onCommit={(value) => handleFieldCommit("item", value)}
              placeholder="Enter product name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              debounceMs={50}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity <span className="text-green-600"></span>
              </label>
              <FastInput
                type="number"
                min="0"
                step="1"
                value={row.qty}
                onChange={(value) => handleCalculationField("qty", value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                debounceMs={25}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price <span className="text-green-600"></span>
              </label>
              <FastInput
                type="number"
                min="0"
                step="0.01"
                value={row.price}
                onChange={(value) => handleCalculationField("price", value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                debounceMs={25}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total <span className="text-purple-600"></span>
              </label>
              <input
                type="text"
                value={row.total || "0.00"}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-purple-50 text-purple-700 font-medium"
              />
            </div>
          </div>
        </div>
      )}

      {/* 2-Column Layout */}
      {table.type === "2col" && (
        <div className="space-y-4 pr-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Name <span className="text-green-600">(*)</span>
            </label>
            <FastInput
              value={row.item}
              onChange={(value) => handleFieldChange("item", value)}
              onCommit={(value) => handleFieldCommit("item", value)}
              placeholder="Enter product name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              debounceMs={50}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price <span className="text-green-600"></span>
            </label>
            <FastInput
              type="number"
              min="0"
              step="0.01"
              value={row.price}
              onChange={(value) => handleCalculationField("price", value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              debounceMs={25}
            />
          </div>
        </div>
      )}

      {/* Photo Upload Section */}
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
}, (prevProps, nextProps) => {
  // Deep comparison only for critical props
  return (
    prevProps.rowIndex === nextProps.rowIndex &&
    JSON.stringify(prevProps.initialRow) === JSON.stringify(nextProps.initialRow) &&
    prevProps.uploadingImages === nextProps.uploadingImages
  );
});

OptimizedProductRow.displayName = "OptimizedProductRow";

// Separate photo upload component (unchanged but optimized)
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
              loading="lazy"
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

// Virtualized table component for better performance with large datasets
const VirtualizedTable = memo(({
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
  onSnoChange,
  tableTotal
}) => {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 10 });
  const containerRef = useRef(null);

  const handleHeaderChange = useCallback((e) => {
    onUpdateTableHeader(pageId, table.id, e.target.value);
  }, [pageId, table.id, onUpdateTableHeader]);

  return (
    <div className="bg-black rounded-lg border border-main overflow-hidden">
      {/* Table Header */}
      <div className="bg-white px-4 py-3 border-b border-main">
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
            {/* {table.type === "7col" && (
              <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs font-medium">
                Smart Auto S.No
              </span>
            )} */}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onDeleteTable(pageId, table.id)}
              className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-md text-sm font-medium transition-colors duration-200"
            >
              <Trash2 className="h-3 w-3" />
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="p-4" ref={containerRef}>
        {table.products.length > 0 ? (
          <div className="space-y-4">
            {table.products.map((row, i) => (
              <OptimizedProductRow
                key={`${table.id}-${i}`}
                initialRow={row}
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
                onSnoChange={onSnoChange}
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
            {/* {table.type === "7col" && `(S.No ${table.products.length + 1})`} */}
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
});

VirtualizedTable.displayName = "VirtualizedTable";

// Main optimized form component
function Form4() {
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
    description, setDescription
  } = useSale();

  // console.log(pay)

  const [uploadingImages, setUploadingImages] = useState({});

  // Performance monitoring
  const performanceRef = useRef({
    renderCount: 0,
    lastRender: Date.now()
  });

  useEffect(() => {
    performanceRef.current.renderCount++;
    const now = Date.now();
    const timeSinceLastRender = now - performanceRef.current.lastRender;
    performanceRef.current.lastRender = now;

    if (timeSinceLastRender < 16) { // Less than 60fps
      console.warn('Performance warning: Rendering too frequently');
    }
  });

  // All handlers remain the same but with better performance...
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

  // Smart S.No auto-increment handler
  const handleSnoChange = useCallback((pageId, tableId, changedRowIndex, newSno) => {
    setPages((prev) =>
      prev.map((p) =>
        p.id === pageId
          ? {
            ...p,
            tables: p.tables.map((t) => {
              if (t.id !== tableId || t.type !== "7col") return t;

              return {
                ...t,
                products: t.products.map((row, index) => {
                  if (index === changedRowIndex) {
                    return { ...row, sno: newSno };
                  } else if (index > changedRowIndex) {
                    // Auto-increment subsequent rows
                    const incrementedSno = newSno + (index - changedRowIndex);
                    return { ...row, sno: incrementedSno };
                  }
                  return row;
                })
              };
            }),
          }
          : p
      )
    );
  }, [setPages]);

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

  const handleDeleteRow = useCallback((pageId, tableId, rowIndex) => {
    setPages((prev) =>
      prev.map((p) =>
        p.id === pageId
          ? {
            ...p,
            tables: p.tables.map((t) => {
              if (t.id !== tableId) return t;

              const newProducts = t.products.filter((_, i) => i !== rowIndex);

              // Auto-renumber S.No for 7col tables after deletion
              if (t.type === "7col") {
                return {
                  ...t,
                  products: newProducts.map((product, index) => ({
                    ...product,
                    sno: index + 1
                  }))
                };
              }

              return { ...t, products: newProducts };
            }),
          }
          : p
      )
    );
  }, [setPages]);

  const handleDuplicateRow = useCallback((pageId, tableId, rowIndex) => {
    setPages((prev) =>
      prev.map((p) =>
        p.id === pageId
          ? {
            ...p,
            tables: p.tables.map((t) => {
              if (t.id !== tableId) return t;

              const duplicatedRow = {
                ...t.products[rowIndex],
                photos: [...(t.products[rowIndex].photos || [])],
                // Auto-increment S.No for duplicated row in 7col tables
                sno: t.type === "7col" ? (t.products[rowIndex].sno + 1) : t.products[rowIndex].sno
              };

              const newProducts = [
                ...t.products.slice(0, rowIndex + 1),
                duplicatedRow,
                ...t.products.slice(rowIndex + 1)
              ];

              // Auto-renumber subsequent S.No for 7col tables
              if (t.type === "7col") {
                return {
                  ...t,
                  products: newProducts.map((product, index) => {
                    if (index > rowIndex + 1) {
                      return { ...product, sno: duplicatedRow.sno + (index - rowIndex - 1) };
                    }
                    return product;
                  })
                };
              }

              return { ...t, products: newProducts };
            }),
          }
          : p
      )
    );
  }, [setPages]);

  // Optimized file processing with Web Workers (if available)
  const processFilesAsync = useCallback(async (files) => {
    const fileArray = Array.from(files);
    const results = [];

    const batchSize = 3;
    for (let i = 0; i < fileArray.length; i += batchSize) {
      const batch = fileArray.slice(i, i + batchSize);

      const batchPromises = batch.map(file => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      await new Promise(resolve => requestAnimationFrame(resolve));
    }

    return results;
  }, []);

  const handlePhotoUpload = useCallback(async (pageId, tableId, rowIndex, files) => {
    const uploadingKey = `${pageId}-${tableId}-${rowIndex}`;
    setUploadingImages(prev => ({ ...prev, [uploadingKey]: true }));

    try {
      const photoBase64Array = await processFilesAsync(files);

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
    } catch (err) {
      console.error("Image conversion failed", err);
    } finally {
      setUploadingImages(prev => ({ ...prev, [uploadingKey]: false }));
    }
  }, [setPages, processFilesAsync]);

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
  }, [setPages]);

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
  }, [isProduct, setPages]);

  // Memoized calculations with better performance
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
      <div className="px py-8 max-w-7xl mx-auto">
        {/* Header */}
        <main className='flex mx-2 items-center'>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <FileText className="h-8 w-8 text-blue-600" />
              Invoice Form
              {/* <span className="text-lg bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                Smart Auto S.No
              </span> */}
            </h1>
            <p className="text-gray-600">Hipzone Automation Quotation Tool</p>
          </div>
        </main>

        <div className="flex gap-4 self-center justify-self-end py-4">
          <button
            onClick={resetData}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Reset All Data
          </button>
          <button
            onClick={saveChanges}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Save Changes (Ctrl+S)
          </button>
        </div>


        {/* Client Information Section (Using FastInput components) */}
        <main className="bg-white rounded-xl shadow-md border border-main p-8 mx-2 mb-10">
          <div className='mb-6'>
            <h2 className="text-2xl font-bold text-main uppercase">Client Information</h2>
            <div className='w-full rounded-md h-[1px] mt-2 bg-main' />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-semibold text-lg text-gray-800 mb-2">
                Client Name <span className="text-green-600"></span>
              </label>
              <FastInput
                value={address.name}
                onChange={(value) => setAddress((prev) => ({ ...prev, name: value }))}
                onCommit={(value) => setAddress((prev) => ({ ...prev, name: value }))}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="Enter client name"
                debounceMs={50}
              />
            </div>

            <div>
              <label className="block font-semibold text-lg text-gray-800 mb-2">
                Phone Number <span className="text-green-600"></span>
              </label>
              <FastInput
                type="tel"
                value={address.mobile}
                onChange={(value) => setAddress((prev) => ({ ...prev, mobile: value }))}
                onCommit={(value) => setAddress((prev) => ({ ...prev, mobile: value }))}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="Enter phone number"
                debounceMs={50}
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block font-semibold text-lg text-gray-800 mb-2">
              Client Address <span className="text-green-600"></span>
            </label>
            <FastTextarea
              value={address.address}
              onChange={(value) => setAddress((prev) => ({ ...prev, address: value }))}
              onCommit={(value) => setAddress((prev) => ({ ...prev, address: value }))}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="Enter complete address"
              rows={3}
              debounceMs={100}
            />
          </div>

          <div className="mt-6">
            <div className='mb-6'>
              <label htmlFor='terms' className="text-2xl font-bold text-main uppercase mt-10">Project Description</label>
              <div className='w-full rounded-md h-[1px] mt-2 bg-main' />
            </div>

            <FastTextarea
              rows={6}
              cols={12}
              value={description}
              onChange={setDescription}
              onCommit={setDescription}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base font-mono resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="Enter Payment Terms..."
              debounceMs={100}
            />
          </div>

          {/* Rest of the form sections... */}
          <div className='mb-6'>
            <h2 className="text-2xl font-bold text-main uppercase mt-6">Tax & Currency</h2>
            <div className='w-full rounded-md h-[1px] mt-2 bg-main' />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 items-center justify-center gap-6">
            <div>
              <label className="block font-semibold text-lg text-gray-800 mb-2">
                Standard Tax % <span className="text-green-600"></span>
              </label>
              <FastInput
                value={rate.rate}
                onChange={(value) => setRate((prev) => ({ ...prev, rate: value }))}
                onCommit={(value) => setRate((prev) => ({ ...prev, rate: value }))}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="Enter tax rate"
                debounceMs={50}
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

          <div className='mb-6'>
            <h2 className="text-2xl font-bold text-main uppercase mt-10">Sales Contact</h2>
            <div className='w-full rounded-md h-[1px] mt-2 bg-main' />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-10">
            <div>
              <label className="block font-semibold text-lg text-gray-800 mb-2">
                Sales Person Name <span className="text-green-600"></span>
              </label>
              <FastInput
                value={sale.name}
                onChange={(value) => setSale((prev) => ({ ...prev, name: value }))}
                onCommit={(value) => setSale((prev) => ({ ...prev, name: value }))}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="Enter the Name"
                debounceMs={50}
              />
            </div>

            <div>
              <label className="block font-semibold text-lg text-gray-800 mb-2">
                Sales Person Contact <span className="text-green-600"></span>
              </label>
              <FastInput
                value={sale.contact}
                onChange={(value) => setSale((prev) => ({ ...prev, contact: value }))}
                onCommit={(value) => setSale((prev) => ({ ...prev, contact: value }))}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="Enter the Contact"
                debounceMs={50}
              />
            </div>
          </div>
          <div className='mb-6'>
            <h2 className="text-2xl font-bold text-main uppercase mt-10">Technical Support</h2>
            <div className='w-full rounded-md h-[1px] mt-2 bg-main' />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-10">
            <div>
              <label className="block font-semibold text-lg text-gray-800 mb-2">
                Support Number <span className="text-green-600"></span>
              </label>
              <FastInput
                value={sale.technumber}
                onChange={(value) => setSale((prev) => ({ ...prev, technumber: value }))}
                onCommit={(value) => setSale((prev) => ({ ...prev, technumber: value }))}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="Enter the Number"
                debounceMs={50}
              />
            </div>

            <div>
              <label className="block font-semibold text-lg text-gray-800 mb-2">
                Support Email <span className="text-green-600"></span>
              </label>
              <FastInput
                value={sale.techcontact}
                onChange={(value) => setSale((prev) => ({ ...prev, techcontact: value }))}
                onCommit={(value) => setSale((prev) => ({ ...prev, techcontact: value }))}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="Enter the Email"
                debounceMs={50}
              />
            </div>
          </div>

          <div className="mt-6">
            <div className='mb-6'>
              <label htmlFor='terms' className="text-2xl font-bold text-main uppercase mt-10">Terms & Conditions </label>
              <div className='w-full rounded-md h-[1px] mt-2 bg-main' />
            </div>
            {/* <label className="block text-2xl font-semibold text-gray-800 mb-2">
              <span className="text-green-600"></span>
            </label> */}
            <FastTextarea
              rows={6}
              value={terms}
              onChange={setTerms}
              onCommit={setTerms}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base font-mono resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="Enter terms and conditions..."
              debounceMs={100}
            />

          </div>

          <div className="mt-6">
            <div className='mb-6'>
              <label htmlFor='terms' className="text-2xl font-bold text-main uppercase mt-10">Payment Terms</label>
              <div className='w-full rounded-md h-[1px] mt-2 bg-main' />
            </div>

            <FastTextarea
              rows={6}
              cols={12}
              value={pay}
              onChange={setPay}
              onCommit={setPay}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base font-mono resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="Enter Payment Terms..."
              debounceMs={100}
            />
          </div>


        </main>

        {/* Page Controls */}
        <div className="bg-white rounded-xl shadow-md border border-main p-6  mx-2 mb-8">
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
        <div className="m-3 mb-12">
          {pages?.map((page) => (
            <div key={page.id} className="bg-white rounded-xl shadow-sm border border-main overflow-hidden mt-10">
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
                      {/* <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded text-xs">
                        Smart Auto S.No
                      </span> */}
                    </button>
                  </div>
                </div>

                {/* Tables */}
                <div className="space-y-6">
                  {page.tables.map((table) => (
                    <VirtualizedTable
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
                      onSnoChange={handleSnoChange}
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

export default Form4;