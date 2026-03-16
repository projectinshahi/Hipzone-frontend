import { useEffect, useState } from "react"
import { Search, RefreshCw, CreditCard as Edit3, Save, X, AlertCircle, Package, Filter, Grid2x2 as Grid, List, Plus, TrendingUp, DollarSign, Eye, EyeOff, Trash2, ShoppingCart } from "lucide-react"
import Navigation from "../components/Navigation"
import { toast } from "react-toastify"

function Dashboard() {
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [retrying, setRetrying] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editValues, setEditValues] = useState({ name: "", price: "" })

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("name") // name, price, id
  const [sortOrder, setSortOrder] = useState("asc") // asc, desc
  const [priceFilter, setPriceFilter] = useState("all") // all, low, medium, high
  const [viewMode, setViewMode] = useState("grid") // grid, list
  const [showFilters, setShowFilters] = useState(false)

  // Add product modal states
  const [showAddModal, setShowAddModal] = useState(false)
  const [addValues, setAddValues] = useState({ name: "", price: "" })
  const [addingProduct, setAddingProduct] = useState(false)

  // Delete confirmation states
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  async function fetchProducts(isRetry = false) {
    if (isRetry) setRetrying(true)
    else setLoading(true)
    setError(null)

    try {
      const response = await fetch("https://hipzonebackend.vercel.app/products")
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      const data = await response.json();
      setProducts(data);
      toast.success("Products loaded successfully!")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch products"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
      setRetrying(false)
    }
  }

  async function addProduct() {
    if (!addValues.name.trim() || !addValues.price.trim()) {
      toast.error("Please fill in all fields")
      return
    }

    const price = parseFloat(addValues.price)
    if (isNaN(price) || price < 0) {
      toast.error("Please enter a valid price")
      return
    }

    setAddingProduct(true)
    try {
      const response = await fetch("https://hipzonebackend.vercel.app/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: addValues.name.trim(), price }),
      })

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

      const newProduct = await response.json()
      setProducts(prev => [...prev, newProduct])
      setAddValues({ name: "", price: "" })
      setShowAddModal(false)
      toast.success("Product added successfully!")
    } catch (err) {
      const errorMessage = "Failed to add product"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setAddingProduct(false)
    }
  }

  async function updateProduct(id, name, price) {
    try {
      const response = await fetch(`https://hipzonebackend.vercel.app/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, price }),
      })
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

      const updatedProduct = await response.json()
      setProducts((prev) =>
        prev.map((product) => (product.id === id ? updatedProduct : product))
      )
      setEditingId(null)
      toast.success("Product updated successfully!")
    } catch (err) {
      const errorMessage = "Failed to update product"
      setError(errorMessage)
      toast.error(errorMessage)
    }
  }

  async function deleteProduct(id) {
    setDeletingId(id)
    try {
      const response = await fetch(`https://hipzonebackend.vercel.app/products/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

      setProducts(prev => prev.filter(product => product.id !== id))
      setDeleteConfirm(null)
      toast.success("Product deleted successfully!")
    } catch (err) {
      const errorMessage = "Failed to delete product"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setDeletingId(null)
    }
  }

  function startEditing(product) {
    setEditingId(product.id)
    setEditValues({ name: product.name, price: product.price.toString() })
  }

  function cancelEditing() {
    setEditingId(null)
    setEditValues({ name: "", price: "" })
  }

  function saveChanges() {
    if (editingId && editValues.name.trim() && editValues.price.trim()) {
      const price = parseFloat(editValues.price)
      if (!isNaN(price) && price >= 0) {
        updateProduct(editingId, editValues.name.trim(), price)
      } else {
        toast.error("Please enter a valid price")
      }
    }
  }

  function confirmDelete(product) {
    setDeleteConfirm(product)
  }

  function cancelDelete() {
    setDeleteConfirm(null)
  }

  useEffect(() => {
    let filtered = [...products]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Price range filter
    if (priceFilter !== "all") {
      filtered = filtered.filter(product => {
        const price = product.price
        switch (priceFilter) {
          case "low": return price < 100
          case "medium": return price >= 100 && price < 500
          case "high": return price >= 500
          default: return true
        }
      })
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortBy]
      let bValue = b[sortBy]

      if (sortBy === "name") {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    setFilteredProducts(filtered)
  }, [products, searchTerm, sortBy, sortOrder, priceFilter])

  useEffect(() => {
    fetchProducts()
  }, [])

  // Calculate statistics
  const totalProducts = products.length
  const totalValue = products.reduce((sum, product) => sum + product.price, 0)
  const averagePrice = totalProducts > 0 ? totalValue / totalProducts : 0
  const highestPrice = products.length > 0 ? Math.max(...products.map(p => p.price)) : 0

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navigation />
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Products</h3>
              <p className="text-gray-600">Please wait while we fetch your product data...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error && products.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navigation />
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center max-w-md">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Products</h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={() => fetchProducts(true)}
                disabled={retrying}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors duration-200 shadow-sm"
              >
                {retrying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Retrying...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Try Again
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navigation />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <Package className="h-8 w-8 text-blue-600" />
                Product Dashboard
              </h1>
              <p className="text-gray-600">Manage and monitor your product inventory</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-200 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Add Product
              </button>
              <button
                onClick={() => fetchProducts(true)}
                disabled={retrying}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg font-medium transition-colors duration-200 shadow-sm disabled:opacity-50"
              >
                {retrying ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                Refresh
              </button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Products</p>
                  <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Value</p>
                  <p className="text-2xl font-bold text-gray-900">₹{totalValue.toFixed(2)}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Price</p>
                  <p className="text-2xl font-bold text-gray-900">₹{averagePrice.toFixed(2)}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Highest Price</p>
                  <p className="text-2xl font-bold text-gray-900">₹{highestPrice.toFixed(2)}</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap gap-3">
              {/* Sort */}
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-')
                  setSortBy(field)
                  setSortOrder(order)
                }}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="name-asc">Name A-Z</option>
                <option value="name-desc">Name Z-A</option>
                <option value="price-asc">Price Low-High</option>
                <option value="price-desc">Price High-Low</option>
              </select>

              {/* Price Filter */}
              <select
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Prices</option>
                <option value="low">Under ₹100</option>
                <option value="medium">₹100 - ₹500</option>
                <option value="high">Over ₹500</option>
              </select>

              {/* View Mode Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-md transition-colors duration-200 ${viewMode === "grid"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                    }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-md transition-colors duration-200 ${viewMode === "list"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                    }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Active Filters Display */}
          {(searchTerm || priceFilter !== "all") && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200">
              <span className="text-sm text-gray-600">Active filters:</span>
              {searchTerm && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  Search: {searchTerm}
                  <button onClick={() => setSearchTerm("")}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {priceFilter !== "all" && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  Price: {priceFilter}
                  <button onClick={() => setPriceFilter("all")}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">Error:</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            Showing {filteredProducts.length} of {totalProducts} products
          </p>
          {filteredProducts.length !== totalProducts && (
            <button
              onClick={() => {
                setSearchTerm("")
                setPriceFilter("all")
              }}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Clear all filters
            </button>
          )}
        </div>

        {/* Product Grid/List */}
        {filteredProducts.length > 0 ? (
          <div className={
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "space-y-4"
          }>
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className={`bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 ${viewMode === "list" ? "p-6" : "p-6"
                  }`}
              >
                {editingId === product.id ? (
                  // Editing Mode
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product Name
                      </label>
                      <input
                        value={editValues.name}
                        onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                        placeholder="Enter product name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={editValues.price}
                        onChange={(e) => setEditValues({ ...editValues, price: e.target.value })}
                        placeholder="0.00"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={saveChanges}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-200"
                      >
                        <Save className="w-4 h-4" />
                        Save
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors duration-200"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div className={viewMode === "list" ? "flex items-center justify-between" : "space-y-4"}>
                    <div className={viewMode === "list" ? "flex-1" : ""}>
                      <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-2xl font-bold text-blue-600">
                          ₹{product.price.toFixed(2)}
                        </span>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          ID: {product.id}
                        </span>
                      </div>
                    </div>
                    <div className={viewMode === "list" ? "ml-4 flex gap-2" : "pt-4 border-t border-gray-100 flex gap-2"}>
                      <button
                        onClick={() => startEditing(product)}
                        className="flex-1 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 shadow-sm justify-center"
                      >
                        <Edit3 className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => confirmDelete(product)}
                        className="flex-1 inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors duration-200 shadow-sm justify-center"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          // Empty State
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm || priceFilter !== "all" ? "No products match your filters" : "No products found"}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || priceFilter !== "all"
                ? "Try adjusting your search criteria or filters"
                : "Get started by adding your first product"
              }
            </p>
            {(searchTerm || priceFilter !== "all") ? (
              <button
                onClick={() => {
                  setSearchTerm("")
                  setPriceFilter("all")
                }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 shadow-sm"
              >
                Clear Filters
              </button>
            ) : (
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-200 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Add Your First Product
              </button>
            )}
          </div>
        )}

        {/* Add Product Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-100 rounded-full">
                  <Plus className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Add New Product</h3>
                  <p className="text-gray-600 text-sm">Fill in the product details</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={addValues.name}
                    onChange={(e) => setAddValues({ ...addValues, name: e.target.value })}
                    placeholder="Enter product name"
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={addValues.price}
                    onChange={(e) => setAddValues({ ...addValues, price: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowAddModal(false)
                    setAddValues({ name: "", price: "" })
                  }}
                  disabled={addingProduct}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={addProduct}
                  disabled={addingProduct || !addValues.name.trim() || !addValues.price.trim()}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium rounded-lg transition-colors"
                >
                  {addingProduct ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Add Product
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-red-100 rounded-full">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Delete Product</h3>
                  <p className="text-gray-600 text-sm">This action cannot be undone</p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-gray-700 mb-2">
                  Are you sure you want to delete this product?
                </p>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="font-medium text-gray-900">{deleteConfirm.name}</p>
                  <p className="text-gray-600">₹{deleteConfirm.price.toFixed(2)}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={cancelDelete}
                  disabled={deletingId === deleteConfirm.id}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteProduct(deleteConfirm.id)}
                  disabled={deletingId === deleteConfirm.id}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium rounded-lg transition-colors"
                >
                  {deletingId === deleteConfirm.id ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Delete Product
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard