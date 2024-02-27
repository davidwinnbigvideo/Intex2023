// Authors: Spencer, Mark, David, Aiki
// Filters for the employee account page

// these are event handlers to collect information users need to make filters
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    const tableRows = document.querySelectorAll('tbody tr');

    searchInput.addEventListener('input', applyFilters);

    // this function serch if the input user types matches with any data.
    function applyFilters() {
      const searchText = searchInput.value.toLowerCase();
      tableRows.forEach(function(row) {
        const cells = row.querySelectorAll('td');
        let textMatch = true;

        // Check if the row matches the search text
        if (searchText) {
          textMatch = false;
          cells.forEach(function(cell) {
            if (cell.textContent.toLowerCase().includes(searchText)) {
              textMatch = true;
            }
          });
        }

        // Show or hide the row based on search and gender matches
        if (textMatch) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
    }
  });