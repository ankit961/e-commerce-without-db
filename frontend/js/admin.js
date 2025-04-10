document.addEventListener('DOMContentLoaded', () => {
    const DISCOUNT_CODES = [];
    const STATS = {
      totalItemsSold: 0,
      totalSales: 0,
      totalDiscount: 0
    };
  
    // DOM references
    const discountCodesTable = document.getElementById('discountCodesTable');
    const generateCodeBtn = document.getElementById('generateCodeBtn');
    const generateCodeModal = document.getElementById('generateCodeModal');
    const closeModal = document.getElementById('closeModal');
    const cancelGenerate = document.getElementById('cancelGenerate');
    const confirmGenerate = document.getElementById('confirmGenerate');
    const generatedCodeModal = document.getElementById('generatedCodeModal');
    const closeSuccessModal = document.getElementById('closeSuccessModal');
    const closeAndFinish = document.getElementById('closeAndFinish');
    const copyCode = document.getElementById('copyCode');
    const generatedCodeDisplay = document.getElementById('generatedCodeDisplay');
    const totalItemsSold = document.getElementById('totalItemsSold');
    const totalSales = document.getElementById('totalSales');
    const totalDiscount = document.getElementById('totalDiscount');
  
    function formatNumber(num) {
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
  
    function formatCurrency(num) {
      return '$' + parseFloat(num).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
    }
  
    function renderDiscountCodes() {
      discountCodesTable.innerHTML = DISCOUNT_CODES.map(code => `
        <tr class="hover:bg-gray-50">
          <td class="px-6 py-4 whitespace-nowrap discount-code">
            <div class="text-sm font-medium text-indigo-600">${code}</div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap" colspan="7">
            <div class="text-sm text-gray-500">10% Off (Valid)</div>
          </td>
        </tr>
      `).join('');
    }
  
    function updateStats() {
      totalItemsSold.textContent = formatNumber(STATS.totalItemsSold);
      totalSales.textContent = formatCurrency(STATS.totalSales);
      totalDiscount.textContent = formatCurrency(STATS.totalDiscount);
    }
  
    function fetchAdminStats() {
      fetch('http://localhost:5000/admin/stats')
        .then(res => res.json())
        .then(data => {
          if (data.items_purchased) {
            STATS.totalItemsSold = Object.values(data.items_purchased).reduce((a, b) => a + b, 0);
          } else {
            STATS.totalItemsSold = 0;
          }
  
          STATS.totalSales = data.total_sales || 0;
          STATS.totalDiscount = data.total_discount_amount || 0;
  
          DISCOUNT_CODES.length = 0;
          (data.discount_codes || []).forEach(code => DISCOUNT_CODES.push(code));
  
          updateStats();
          renderDiscountCodes();
        })
        .catch(err => {
          console.error("❌ Failed to fetch admin stats:", err);
        });
    }
  
    function generateCodeFromBackend() {
      fetch('http://localhost:5000/admin/generate-discount', {
        method: 'POST',
      })
      .then(res => res.json())
      .then(data => {
        if (data.code) {
          generatedCodeDisplay.textContent = data.code;
          generateCodeModal.classList.add('hidden');
          generatedCodeModal.classList.remove('hidden');
          fetchAdminStats(); // Refresh
        } else {
          alert("Failed to generate code. No code returned.");
        }
      })
      .catch(err => {
        alert("❌ Failed to generate discount code");
        console.error(err);
      });
    }
  
    // Modal handling
    generateCodeBtn.addEventListener('click', () => generateCodeModal.classList.remove('hidden'));
    closeModal.addEventListener('click', () => generateCodeModal.classList.add('hidden'));
    cancelGenerate.addEventListener('click', () => generateCodeModal.classList.add('hidden'));
    closeSuccessModal.addEventListener('click', () => generatedCodeModal.classList.add('hidden'));
    closeAndFinish.addEventListener('click', () => generatedCodeModal.classList.add('hidden'));
  
    confirmGenerate.addEventListener('click', generateCodeFromBackend);
  
    copyCode.addEventListener('click', () => {
      const code = generatedCodeDisplay.textContent;
      navigator.clipboard.writeText(code).then(() => {
        const originalIcon = copyCode.innerHTML;
        copyCode.innerHTML = '<i class="fas fa-check"></i>';
        setTimeout(() => {
          copyCode.innerHTML = originalIcon;
        }, 2000);
      });
    });
  
    // Load on start
    fetchAdminStats();
  });
  