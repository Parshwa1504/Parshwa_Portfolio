/* Author: Parshwa Gandhi | SWE 642 HW2 */
// Smooth-scroll for same-page nav links
document.querySelectorAll('a.nav-link[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // set active state
    document.querySelectorAll('a.nav-link').forEach(n => n.classList.remove('active'));
    a.classList.add('active');
  });
});