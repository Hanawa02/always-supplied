<template>
  <div class="min-h-screen bg-gray-50 p-4">
    <div class="max-w-6xl mx-auto">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">Always Supplied - Theme Preview</h1>
      
      <!-- Color Palette Overview -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold text-gray-800 mb-6">Color Palette</h2>
        
        <!-- Primary Colors -->
        <div class="mb-8">
          <h3 class="text-lg font-medium text-gray-700 mb-4">Primary Colors (Emerald)</h3>
          <div class="grid grid-cols-11 gap-2">
            <div class="bg-primary-50 h-16 rounded flex items-end justify-center pb-1">
              <span class="text-gray-800 text-xs">50</span>
            </div>
            <div class="bg-primary-100 h-16 rounded flex items-end justify-center pb-1">
              <span class="text-gray-800 text-xs">100</span>
            </div>
            <div class="bg-primary-200 h-16 rounded flex items-end justify-center pb-1">
              <span class="text-gray-800 text-xs">200</span>
            </div>
            <div class="bg-primary-300 h-16 rounded flex items-end justify-center pb-1">
              <span class="text-gray-800 text-xs">300</span>
            </div>
            <div class="bg-primary-400 h-16 rounded flex items-end justify-center pb-1">
              <span class="text-gray-800 text-xs">400</span>
            </div>
            <div class="bg-primary-500 h-16 rounded flex items-end justify-center pb-1">
              <span class="text-gray-800 text-xs">500</span>
            </div>
            <div class="bg-primary-600 h-16 rounded flex items-end justify-center pb-1">
              <span class="text-white text-xs">600</span>
            </div>
            <div class="bg-primary-700 h-16 rounded flex items-end justify-center pb-1">
              <span class="text-white text-xs">700</span>
            </div>
            <div class="bg-primary-800 h-16 rounded flex items-end justify-center pb-1">
              <span class="text-white text-xs">800</span>
            </div>
            <div class="bg-primary-900 h-16 rounded flex items-end justify-center pb-1">
              <span class="text-white text-xs">900</span>
            </div>
            <div class="bg-primary-950 h-16 rounded flex items-end justify-center pb-1">
              <span class="text-white text-xs">950</span>
            </div>
          </div>
        </div>

        <!-- Accent Colors -->
        <div class="mb-8">
          <h3 class="text-lg font-medium text-gray-700 mb-4">Accent Colors (Amber)</h3>
          <div class="grid grid-cols-11 gap-2">
            <div class="bg-accent-50 h-16 rounded flex items-end justify-center pb-1">
              <span class="text-gray-800 text-xs">50</span>
            </div>
            <div class="bg-accent-100 h-16 rounded flex items-end justify-center pb-1">
              <span class="text-gray-800 text-xs">100</span>
            </div>
            <div class="bg-accent-200 h-16 rounded flex items-end justify-center pb-1">
              <span class="text-gray-800 text-xs">200</span>
            </div>
            <div class="bg-accent-300 h-16 rounded flex items-end justify-center pb-1">
              <span class="text-gray-800 text-xs">300</span>
            </div>
            <div class="bg-accent-400 h-16 rounded flex items-end justify-center pb-1">
              <span class="text-gray-800 text-xs">400</span>
            </div>
            <div class="bg-accent-500 h-16 rounded flex items-end justify-center pb-1">
              <span class="text-gray-800 text-xs">500</span>
            </div>
            <div class="bg-accent-600 h-16 rounded flex items-end justify-center pb-1">
              <span class="text-white text-xs">600</span>
            </div>
            <div class="bg-accent-700 h-16 rounded flex items-end justify-center pb-1">
              <span class="text-white text-xs">700</span>
            </div>
            <div class="bg-accent-800 h-16 rounded flex items-end justify-center pb-1">
              <span class="text-white text-xs">800</span>
            </div>
            <div class="bg-accent-900 h-16 rounded flex items-end justify-center pb-1">
              <span class="text-white text-xs">900</span>
            </div>
            <div class="bg-accent-950 h-16 rounded flex items-end justify-center pb-1">
              <span class="text-white text-xs">950</span>
            </div>
          </div>
        </div>

        <!-- Semantic Colors -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <h3 class="text-lg font-medium text-gray-700 mb-4">Success</h3>
            <div class="space-y-2">
              <div class="bg-success-100 h-12 rounded flex items-center justify-center">
                <span class="text-gray-800 text-sm">100</span>
              </div>
              <div class="bg-success-300 h-12 rounded flex items-center justify-center">
                <span class="text-gray-800 text-sm">300</span>
              </div>
              <div class="bg-success-500 h-12 rounded flex items-center justify-center">
                <span class="text-gray-800 text-sm">500</span>
              </div>
              <div class="bg-success-700 h-12 rounded flex items-center justify-center">
                <span class="text-white text-sm">700</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 class="text-lg font-medium text-gray-700 mb-4">Warning</h3>
            <div class="space-y-2">
              <div class="bg-warning-100 h-12 rounded flex items-center justify-center">
                <span class="text-gray-800 text-sm">100</span>
              </div>
              <div class="bg-warning-300 h-12 rounded flex items-center justify-center">
                <span class="text-gray-800 text-sm">300</span>
              </div>
              <div class="bg-warning-500 h-12 rounded flex items-center justify-center">
                <span class="text-gray-800 text-sm">500</span>
              </div>
              <div class="bg-warning-700 h-12 rounded flex items-center justify-center">
                <span class="text-white text-sm">700</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 class="text-lg font-medium text-gray-700 mb-4">Danger</h3>
            <div class="space-y-2">
              <div class="bg-danger-100 h-12 rounded flex items-center justify-center">
                <span class="text-gray-800 text-sm">100</span>
              </div>
              <div class="bg-danger-300 h-12 rounded flex items-center justify-center">
                <span class="text-gray-800 text-sm">300</span>
              </div>
              <div class="bg-danger-500 h-12 rounded flex items-center justify-center">
                <span class="text-gray-800 text-sm">500</span>
              </div>
              <div class="bg-danger-700 h-12 rounded flex items-center justify-center">
                <span class="text-white text-sm">700</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 class="text-lg font-medium text-gray-700 mb-4">Info</h3>
            <div class="space-y-2">
              <div class="bg-info-100 h-12 rounded flex items-center justify-center">
                <span class="text-gray-800 text-sm">100</span>
              </div>
              <div class="bg-info-300 h-12 rounded flex items-center justify-center">
                <span class="text-gray-800 text-sm">300</span>
              </div>
              <div class="bg-info-500 h-12 rounded flex items-center justify-center">
                <span class="text-gray-800 text-sm">500</span>
              </div>
              <div class="bg-info-700 h-12 rounded flex items-center justify-center">
                <span class="text-white text-sm">700</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- UI Components Preview -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold text-gray-800 mb-6">UI Components</h2>
        
        <!-- Buttons -->
        <div class="mb-8">
          <h3 class="text-lg font-medium text-gray-700 mb-4">Buttons</h3>
          <div class="space-x-4 flex flex-wrap gap-2">
            <button class="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
              Primary Action
            </button>
            <button class="bg-accent-500 hover:bg-accent-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
              Shopping Action
            </button>
            <button class="bg-success-500 hover:bg-success-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
              Success Action
            </button>
            <button class="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium transition-colors">
              Secondary
            </button>
          </div>
        </div>

        <!-- Cards -->
        <div class="mb-8">
          <h3 class="text-lg font-medium text-gray-700 mb-4">Supply Item Cards</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- In Stock Item -->
            <div class="bg-white border border-success-200 rounded-lg p-4 shadow-sm">
              <div class="flex items-center justify-between mb-2">
                <h4 class="font-semibold text-gray-900">Paper Towels</h4>
                <div class="bg-success-100 text-success-700 px-2 py-1 rounded-full text-xs font-medium">
                  In Stock
                </div>
              </div>
              <p class="text-gray-600 text-sm mb-3">Kitchen supplies</p>
              <div class="flex items-center justify-between">
                <span class="text-success-600 font-medium">8 / 6 rolls</span>
                <button class="text-primary-600 hover:text-primary-700 text-sm font-medium">
                  View Details
                </button>
              </div>
            </div>

            <!-- Low Stock Item -->
            <div class="bg-white border border-warning-200 rounded-lg p-4 shadow-sm">
              <div class="flex items-center justify-between mb-2">
                <h4 class="font-semibold text-gray-900">Dish Soap</h4>
                <div class="bg-warning-100 text-warning-700 px-2 py-1 rounded-full text-xs font-medium">
                  Running Low
                </div>
              </div>
              <p class="text-gray-600 text-sm mb-3">Kitchen supplies</p>
              <div class="flex items-center justify-between">
                <span class="text-warning-600 font-medium">1 / 3 bottles</span>
                <button class="bg-accent-500 hover:bg-accent-600 text-white px-3 py-1 rounded text-sm font-medium">
                  Add to Cart
                </button>
              </div>
            </div>

            <!-- Out of Stock Item -->
            <div class="bg-white border border-danger-200 rounded-lg p-4 shadow-sm">
              <div class="flex items-center justify-between mb-2">
                <h4 class="font-semibold text-gray-900">Toilet Paper</h4>
                <div class="bg-danger-100 text-danger-700 px-2 py-1 rounded-full text-xs font-medium">
                  Out of Stock
                </div>
              </div>
              <p class="text-gray-600 text-sm mb-3">Bathroom supplies</p>
              <div class="flex items-center justify-between">
                <span class="text-danger-600 font-medium">0 / 12 rolls</span>
                <button class="bg-danger-500 hover:bg-danger-600 text-white px-3 py-1 rounded text-sm font-medium">
                  Buy Urgent
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Status Indicators -->
        <div class="mb-8">
          <h3 class="text-lg font-medium text-gray-700 mb-4">Status Indicators</h3>
          <div class="space-y-3">
            <div class="flex items-center space-x-3">
              <div class="w-3 h-3 bg-success-500 rounded-full"></div>
              <span class="text-success-700">Everything is well stocked</span>
            </div>
            <div class="flex items-center space-x-3">
              <div class="w-3 h-3 bg-warning-500 rounded-full animate-pulse"></div>
              <span class="text-warning-700">5 items running low</span>
            </div>
            <div class="flex items-center space-x-3">
              <div class="w-3 h-3 bg-danger-500 rounded-full animate-pulse"></div>
              <span class="text-danger-700">2 items out of stock - urgent!</span>
            </div>
            <div class="flex items-center space-x-3">
              <div class="w-3 h-3 bg-info-500 rounded-full"></div>
              <span class="text-info-700">Data synced 2 minutes ago</span>
            </div>
          </div>
        </div>

        <!-- Shopping List Preview -->
        <div class="mb-8">
          <h3 class="text-lg font-medium text-gray-700 mb-4">Shopping List</h3>
          <div class="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div class="p-4 border-b border-gray-200">
              <h4 class="font-semibold text-gray-900 flex items-center">
                <i class="i-mdi-cart text-accent-500 mr-2 text-xl"></i>
                Shopping List (3 items)
              </h4>
            </div>
            <div class="divide-y divide-gray-100">
              <div class="p-4 flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <input type="checkbox" class="text-primary-500 rounded">
                  <span class="text-gray-900">Toilet Paper - 12 rolls</span>
                </div>
                <div class="flex items-center space-x-2">
                  <span class="bg-danger-100 text-danger-700 px-2 py-1 rounded text-xs">Urgent</span>
                  <button class="text-gray-400 hover:text-gray-600">
                    <i class="i-mdi-dots-vertical"></i>
                  </button>
                </div>
              </div>
              <div class="p-4 flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <input type="checkbox" class="text-primary-500 rounded">
                  <span class="text-gray-900">Dish Soap - 2 bottles</span>
                </div>
                <div class="flex items-center space-x-2">
                  <span class="bg-warning-100 text-warning-700 px-2 py-1 rounded text-xs">Low</span>
                  <button class="text-gray-400 hover:text-gray-600">
                    <i class="i-mdi-dots-vertical"></i>
                  </button>
                </div>
              </div>
              <div class="p-4 flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <input type="checkbox" class="text-primary-500 rounded" checked>
                  <span class="text-gray-500 line-through">Paper Towels - 6 rolls</span>
                </div>
                <div class="flex items-center space-x-2">
                  <span class="bg-success-100 text-success-700 px-2 py-1 rounded text-xs">Bought</span>
                  <button class="text-gray-400 hover:text-gray-600">
                    <i class="i-mdi-dots-vertical"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Dark Mode Preview -->
      <section class="bg-gray-900 p-6 rounded-lg">
        <h2 class="text-2xl font-semibold text-white mb-6">Dark Mode Preview</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Dark Mode Card -->
          <div class="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div class="flex items-center justify-between mb-2">
              <h4 class="font-semibold text-white">Coffee Beans</h4>
              <div class="bg-warning-900 text-warning-200 px-2 py-1 rounded-full text-xs font-medium">
                Running Low
              </div>
            </div>
            <p class="text-gray-300 text-sm mb-3">Kitchen supplies</p>
            <div class="flex items-center justify-between">
              <span class="text-warning-400 font-medium">1 / 4 bags</span>
              <button class="bg-accent-600 hover:bg-accent-500 text-white px-3 py-1 rounded text-sm font-medium">
                Add to Cart
              </button>
            </div>
          </div>

          <!-- Dark Mode Buttons -->
          <div class="space-y-3">
            <button class="w-full bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-lg font-medium transition-colors">
              Primary Action (Dark)
            </button>
            <button class="w-full bg-accent-600 hover:bg-accent-500 text-white px-4 py-2 rounded-lg font-medium transition-colors">
              Shopping Action (Dark)
            </button>
            <button class="w-full bg-gray-700 hover:bg-gray-600 text-gray-200 px-4 py-2 rounded-lg font-medium transition-colors">
              Secondary (Dark)
            </button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
// No script needed for this preview component
</script>