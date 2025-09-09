    // Auto-focus first field 
    window.addEventListener('DOMContentLoaded', () => {
      const first = document.getElementById('name');
      if(first) first.focus();
    });