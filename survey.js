/* Author: Parshwa Gandhi | SWE 642 HW2
   Features: Greeting via cookie, Data avg/max, Zip AJAX/JSON onblur, consolidated validation, reset behavior
*/

// --- Cookie Helpers ---
function setCookie(name, value, days=7){
  const d = new Date();
  d.setTime(d.getTime() + (days*24*60*60*1000));
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)};expires=${d.toUTCString()};path=/`;
}
function getCookie(name){
  const cname = encodeURIComponent(name) + "=";
  const ca = document.cookie.split(';');
  for(let c of ca){
    c = c.trim();
    if (c.indexOf(cname) === 0) return decodeURIComponent(c.substring(cname.length));
  }
  return null;
}

// --- Greeting via cookie ---
function updateGreeting(){
  const greet = document.getElementById('greeting');
  if(!greet) return;
  let user = getCookie('swe642_user');
  if(!user){
    user = prompt("Welcome! What's your name?");
    if(user && user.trim()) setCookie('swe642_user', user.trim(), 7);
  } else {
    // If cookie exists but user on form differs, show a link to change it
    greet.innerHTML = "";
  }
  user = getCookie('swe642_user'); // refresh
  const hour = new Date().getHours();
  const sal = hour < 12 ? "Good morning" : (hour < 18 ? "Good afternoon" : "Good evening");
  if(user){
    greet.innerHTML = `${sal} <strong>${user}</strong>, welcome to SWE642 Survey.` +
      ` <a href="#" id="chgName" class="ms-2">Not ${user}? Click to update.</a>`;
    const a = document.getElementById('chgName');
    if(a){
      a.addEventListener('click', (e)=>{
        e.preventDefault();
        const n = prompt("Please enter your name:");
        if(n && n.trim()){
          setCookie('swe642_user', n.trim(), 7);
          location.reload();
        }
      });
    }
  } else {
    greet.textContent = "Welcome to SWE642 Survey.";
  }
}

// --- Data avg/max ---
function parseNumbers(str){
  if(!str) return null;
  const parts = str.split(',').map(s => s.trim()).filter(s=>s.length>0);
  if(parts.length !== 10) return null;
  const nums = parts.map(x => Number(x));
  if(nums.some(n => !Number.isFinite(n) || n < 1 || n > 100)) return null;
  return nums;
}
function computeAvgMax(nums){
  const sum = nums.reduce((a,b)=>a+b,0);
  const avg = sum / nums.length;
  const max = Math.max(...nums);
  return [Number(avg.toFixed(2)), max];
}

// --- Zip AJAX/JSON ---
async function lookupZip(zip){
  const msg = document.getElementById('zipMsg');
  msg.textContent = "";
  try{
    const resp = await fetch('zipcodes.json', {cache: 'no-store'});
    if(!resp.ok) throw new Error('Failed to load zipcodes.json');
    const data = await resp.json();
    const hit = (data.zipcodes || []).find(z => z.zip === zip);
    if(hit){
      document.getElementById('city').textContent = hit.city;
      document.getElementById('state').textContent = hit.state;
      msg.textContent = "";
      return true;
    } else {
      document.getElementById('city').textContent = "";
      document.getElementById('state').textContent = "";
      msg.textContent = "Invalid ZIP";
      return false;
    }
  }catch(err){
    msg.textContent = "ZIP lookup error";
    return false;
  }
}

// --- Consolidated Validation on Submit ---
function validateForm(e){
  const form = document.getElementById('csSurvey');
  const errors = [];

  // Name alphabets only
  const nameEl = document.getElementById('name');
  if(!/^[A-Za-z ]+$/.test(nameEl.value.trim())){
    errors.push("Name must contain only alphabets and spaces.");
  }

  // Address: alphanumeric and basic punctuation ,.#-
  const addrEl = document.getElementById('address');
  if(!/^[A-Za-z0-9\s,\.\-#]+$/.test(addrEl.value.trim())){
    errors.push("Address may contain letters, numbers, spaces, and , . - #");
  }

  // At least two checkboxes
  const likes = Array.from(document.querySelectorAll('input[name="likes"]:checked'));
  if(likes.length < 2){
    errors.push("Please select at least two items you liked about the campus.");
  }

  // Radio selected
  const interestChecked = document.querySelector('input[name="interest"]:checked');
  if(!interestChecked){
    errors.push("Please select how you became interested in the university.");
  }

  // Email format (let browser do heavy lifting but also quick pattern)
  const emailEl = document.getElementById('email');
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value.trim())){
    errors.push("Please enter a valid email address.");
  }

  // ZIP pattern & resolved city/state
  const zipEl = document.getElementById('zip');
  if(!/^\d{5}$/.test(zipEl.value.trim())){
    errors.push("ZIP must be 5 digits.");
  }
  if(!document.getElementById('city').textContent || !document.getElementById('state').textContent){
    errors.push("Please enter a valid ZIP so City and State can be populated.");
  }

  // Data numbers check
  const dataEl = document.getElementById('dataNumbers');
  const nums = parseNumbers(dataEl.value);
  if(!nums){
    errors.push("Data must be exactly ten comma-separated numbers between 1 and 100.");
  }

  if(errors.length){
    e.preventDefault();
    alert("Please correct the following issues:\n\n- " + errors.join("\n- "));
    // Clear only fields with errors
    if(errors.some(s=>s.includes("Name"))) nameEl.value = "";
    if(errors.some(s=>s.startsWith("Address"))) addrEl.value = "";
    if(errors.some(s=>s.includes("email"))) emailEl.value = "";
    if(errors.some(s=>s.includes("ZIP"))) { zipEl.value = ""; document.getElementById('city').textContent=""; document.getElementById('state').textContent=""; }
    if(errors.some(s=>s.includes("Data"))) { dataEl.value = ""; document.getElementById('avgOut').value=""; document.getElementById('maxOut').value=""; }
  }
}

// --- Wire up events ---
window.addEventListener('DOMContentLoaded', () => {
  // Focus first field
  const first = document.getElementById('name'); if(first) first.focus();

  updateGreeting();

  // Data field: compute on blur
  const dataEl = document.getElementById('dataNumbers');
  dataEl.addEventListener('blur', ()=>{
    const nums = parseNumbers(dataEl.value);
    const avgOut = document.getElementById('avgOut');
    const maxOut = document.getElementById('maxOut');
    if(nums){
      const [avg, mx] = computeAvgMax(nums);
      avgOut.value = avg;
      maxOut.value = mx;
    } else {
      avgOut.value = ""; maxOut.value = "";
    }
  });

  // ZIP blur: Ajax JSON lookup
  const zipEl = document.getElementById('zip');
  zipEl.addEventListener('blur', ()=>{
    const z = zipEl.value.trim();
    if(/^\d{5}$/.test(z)){
      lookupZip(z);
    }else{
      document.getElementById('zipMsg').textContent = "ZIP must be 5 digits";
      document.getElementById('city').textContent = "";
      document.getElementById('state').textContent = "";
    }
  });

  // Submit validation
  document.getElementById('csSurvey').addEventListener('submit', validateForm);

  // Reset: also clear derived fields/messages
  document.querySelector('button[type="reset"]').addEventListener('click', ()=>{
    document.getElementById('avgOut').value = "";
    document.getElementById('maxOut').value = "";
    document.getElementById('zipMsg').textContent = "";
    document.getElementById('city').textContent = "";
    document.getElementById('state').textContent = "";
  });
});
