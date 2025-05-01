document.addEventListener('DOMContentLoaded', () => {
    const colorForm = document.getElementById('colorForm');
    const savedColor = localStorage.getItem('snakeColor');

    // Pre-select saved color
    if (savedColor) {
      const selected = colorForm.querySelector(`input[name="color"][value="${savedColor}"]`);
      if (selected) selected.checked = true;
    }

    // Save on change
    colorForm.addEventListener('change', () => {
      const selected = colorForm.querySelector('input[name="color"]:checked');
      if (selected) {
        localStorage.setItem('snakeColor', selected.value);
        console.log('Saved:', selected.value); // Optional debug
      }
    });
  });