// Authors: Spencer, Mark, David, Aiki
// Filters for form page



// these are event handlers and to collect information user need to make filters
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    const genderFilter = document.getElementById('genderFilter');
    const cityFilter = document.getElementById('cityFilter')
    const tableRows = document.querySelectorAll('tbody tr');

    searchInput.addEventListener('input', applyFilters);
    genderFilter.addEventListener('change', applyFilters);
    cityFilter.addEventListener('change', applyFilters);

    // this function search and apply filter for user to see specific data they want to get.
    //search their input and see if there are matched data, and make options to fileter by gender and city
    function applyFilters() {
      const searchText = searchInput.value.toLowerCase();
      const selectedGender = genderFilter.value.toLowerCase();
      const selectedCity = cityFilter.value.toLowerCase();

      tableRows.forEach(function(row) {
        const cells = row.querySelectorAll('td');
        let textMatch = true;
        let genderMatch = true;
        let cityMatch = true;
        // Check if the row matches the search text
        if (searchText) {
          textMatch = false;
          cells.forEach(function(cell) {
            if (cell.textContent.toLowerCase().includes(searchText)) {
              textMatch = true;
            }
          });
        }

        // Check if the row matches the selected gender
        if (selectedGender && selectedGender !== 'all genders') {
          const genderCell = row.querySelector('td:nth-child(4)'); // Assuming gender is the 4th column
          if (genderCell.textContent.toLowerCase() !== selectedGender) {
            genderMatch = false;
          }
        }

        // Check if the row matches the selected gender
        if (selectedCity && selectedCity !== 'all cities') {
          const cityCell = row.querySelector('td:nth-child(9)'); 
          if (cityCell.textContent.toLowerCase() !== selectedCity) {
            cityMatch = false;
          }
        }

        // Show or hide the row based on search and gender matches
        if (textMatch && genderMatch && cityMatch) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
    }
  });