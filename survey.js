    // Auto-focus first field (belt-and-suspenders: works even if autofocus is ignored)
    window.addEventListener('DOMContentLoaded', () => {
      const first = document.getElementById('name');
      if(first) first.focus();
    });