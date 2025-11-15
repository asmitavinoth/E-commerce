

/*********************** Demo data ***********************/
const sampleProducts=[
  {id:1,title:'Smartphone X200',price:17999,cat:'phone',img:'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9'},
  {id:2,title:'Wireless Headphones',price:2499,cat:'audio',img:'https://images.unsplash.com/photo-1518441902119-8a2b8b1e5e3b'},
  {id:3,title:'Laptop Pro 14"',price:78999,cat:'laptop',img:'https://images.unsplash.com/photo-1518779578993-ec3579fee39f'},
  {id:4,title:'Gaming Mouse',price:1299,cat:'accessory',img:'https://images.unsplash.com/photo-1585386959984-a4155223b48a'},
  {id:5,title:'Bluetooth Speaker',price:3499,cat:'audio',img:'https://images.unsplash.com/photo-1546435770-a3e426bf472b'}
];

/*********************** Local Storage ***********************/
const DB={
  users:()=>JSON.parse(localStorage.getItem('tv_users')||'[]'),
  saveUsers:u=>localStorage.setItem('tv_users',JSON.stringify(u)),
  currentUser:()=>JSON.parse(localStorage.getItem('tv_current')||'null'),
  setCurrent:u=>localStorage.setItem('tv_current',JSON.stringify(u)),
  wishlist:()=>JSON.parse(localStorage.getItem('tv_wishlist')||'{}'),
  saveWishlist:w=>localStorage.setItem('tv_wishlist',JSON.stringify(w)),
  orders:()=>JSON.parse(localStorage.getItem('tv_orders')||'{}'),
  saveOrders:o=>localStorage.setItem('tv_orders',JSON.stringify(o)),
  reviews:()=>JSON.parse(localStorage.getItem('tv_reviews')||'{}'),
  saveReviews:r=>localStorage.setItem('tv_reviews',JSON.stringify(r)),
};

// load products
if(!localStorage.getItem('tv_products'))
  localStorage.setItem('tv_products',JSON.stringify(sampleProducts));

/*********************** DOM elements ***********************/
const productsEl=document.querySelector('#products');
const wishlistEl=document.querySelector('#wishlistList');
const ordersEl=document.querySelector('#ordersList');
const accountInfo=document.querySelector('#accountInfo');

/*********************** Rendering ***********************/
function renderProducts(filter){
  const products=JSON.parse(localStorage.getItem('tv_products')||'[]');
  const list=products.filter(
    p => !filter || p.title.toLowerCase().includes(filter.toLowerCase()) || p.cat.includes(filter.toLowerCase())
  );

  productsEl.innerHTML='';
  list.forEach(p=>{
    const card=document.createElement('div');
    card.className='card';
    card.innerHTML=`
      <img src="${p.img}" />
      <h3>${p.title}</h3>
      <div class="price">₹ ${p.price.toLocaleString('en-IN')}</div>
      <div id="rating-${p.id}"></div>
      <div class="actions">
        <button class='btn btn-primary' data-buy='${p.id}'>Buy</button>
        <button class='btn btn-ghost' data-wish='${p.id}'>Wishlist</button>
        <button class='btn btn-ghost' data-review='${p.id}'>Reviews</button>
      </div>`;
    productsEl.appendChild(card);
    renderRating(p.id);
  });
}

function renderRating(pid){
  const reviews=DB.reviews()[pid]||[];
  const el=document.querySelector(`#rating-${pid}`);
  if(!el) return;
  if(reviews.length===0) el.textContent="No reviews yet";
  else el.textContent=`${reviews.length} review(s) — Avg ⭐ ${(reviews.reduce((s,r)=>s+r.rating,0)/reviews.length).toFixed(1)}`;
}

function renderWishlist(){
  const w=DB.wishlist();
  wishlistEl.innerHTML='';
  const cur=DB.currentUser();
  if(!cur){ wishlistEl.innerHTML='<div>Login to view wishlist</div>'; return; }

  const items=w[cur.email]||[];
  if(items.length===0){
    wishlistEl.innerHTML='<div>Your wishlist is empty</div>';
    return;
  }

  items.forEach(pid=>{
    const p=sampleProducts.find(x=>x.id===pid);
    const div=document.createElement('div');
    div.className='item';
    div.innerHTML=`<div style="flex:1">${p.title}</div>
                   <button class='btn' data-remove-wish='${pid}'>Remove</button>`;
    wishlistEl.appendChild(div);
  });
}

function renderOrders(){
  const o=DB.orders();
  ordersEl.innerHTML='';
  const cur=DB.currentUser();
  if(!cur){ ordersEl.innerHTML='<div>Login to view orders</div>'; return; }

  const items=o[cur.email]||[];
  if(items.length===0){
    ordersEl.innerHTML='<div>No orders yet</div>';
    return;
  }

  items.forEach(ord=>{
    const p=sampleProducts.find(x=>x.id===ord.pid);
    const div=document.createElement('div');
    div.className='item';
    div.innerHTML=`<div style="flex:1">
                     <strong>${p.title}</strong>
                     <div>${new Date(ord.date).toLocaleString()}</div>
                   </div>
                   <div>₹${p.price}</div>`;
    ordersEl.appendChild(div);
  });
}

function updateAccountInfo(){
  const cur=DB.currentUser();
  if(!cur)
    accountInfo.innerHTML='Not logged in — <a href="#" id="open-register">Register</a> or <a href="#" id="open-login2">Login</a>';
  else
    accountInfo.innerHTML=`Hello, <strong>${cur.name}</strong> (${cur.email}) — <a href="#" id="logout">Logout</a>`;
}

/*********************** Modal ***********************/
const modal=document.getElementById('modal');
const modalBody=document.getElementById('modalBody');

function openModal(html){
  modalBody.innerHTML=html;
  modal.classList.add('show');
}

function closeModal(){
  modal.classList.remove('show');
}

document.getElementById('closeModal').onclick=closeModal;

/*********************** Login & Register ***********************/
function showRegister(){
  openModal(`
    <h3>Register</h3>
    <form id='registerForm'>
      <label>Name</label><input name='name' required/>
      <label>Email</label><input name='email' type='email' required/>
      <label>Phone</label><input name='phone' required/>
      <label>Password</label><input name='password' type='password' required/>
      <div class='error' id='regError'></div>
      <button class='btn btn-primary' type='submit'>Create account</button>
    </form>
  `);

  document.getElementById('registerForm').onsubmit=e=>{
    e.preventDefault();
    const fd=new FormData(e.target);
    const users=DB.users();

    const name=fd.get('name');
    const email=fd.get('email');
    const phone=fd.get('phone');
    const pw=fd.get('password');

    const err=document.getElementById('regError');

    if(name.length<3){ err.textContent="Name too short"; return; }
    if(!/^\d{10}$/.test(phone)){ err.textContent="Phone must be 10 digits"; return; }
    if(users.find(u=>u.email===email)){ err.textContent="Email already used"; return; }

    const u={name,email,phone,password:pw};
    users.push(u);
    DB.saveUsers(users);
    DB.setCurrent({name,email});
    closeModal();
    updateAccountInfo();
    renderWishlist();
  };
}

function showLogin(){
  openModal(`
    <h3>Login</h3>
    <form id='loginForm'>
      <label>Email</label><input name='email' required />
      <label>Password</label><input name='password' type='password' required />
      <div class='error' id='logError'></div>
      <button class='btn btn-primary' type='submit'>Login</button>
    </form>
  `);

  document.getElementById('loginForm').onsubmit=e=>{
    e.preventDefault();
    const fd=new FormData(e.target);
    const email=fd.get('email');
    const pw=fd.get('password');

    const user=DB.users().find(u=>u.email===email && u.password===pw);
    const err=document.getElementById('logError');

    if(!user){ err.textContent="Incorrect login"; return; }

    DB.setCurrent({name:user.name,email});
    closeModal();
    updateAccountInfo();
    renderWishlist();
  };
}

/*********************** Reviews ***********************/
function showReviews(pid){
  const reviews=DB.reviews()[pid]||[];

  let html=`<h3>Reviews</h3>`;
  reviews.forEach(r=>{
    html+=`<div><strong>${r.user}</strong> ⭐${r.rating}<p>${r.comment}</p></div>`;
  });

  html+=`
    <h4>Add review</h4>
    <form id='reviewForm'>
      <label>Rating</label><input name='rating' type='number' min='1' max='5' required />
      <label>Comment</label><textarea name='comment'></textarea>
      <button class='btn btn-primary'>Submit</button>
    </form>
  `;

  openModal(html);

  document.getElementById('reviewForm').onsubmit=e=>{
    e.preventDefault();
    const fd=new FormData(e.target);
    const rating=Number(fd.get('rating'));
    const comment=fd.get('comment');

    const cur=DB.currentUser();
    if(!cur){ alert("Login first"); return; }

    const obj=DB.reviews();
    if(!obj[pid]) obj[pid]=[];
    obj[pid].push({user:cur.name,rating,comment});
    DB.saveReviews(obj);

    closeModal();
    renderRating(pid);
  };
}

/*********************** Buy & Wishlist ***********************/
function handleBuy(pid){
  const cur=DB.currentUser();
  if(!cur){ alert("Login first"); return; }

  const o=DB.orders();
  if(!o[cur.email]) o[cur.email]=[];
  o[cur.email].push({pid,date:Date.now()});
  DB.saveOrders(o);

  renderOrders();
}

function handleWishlist(pid){
  const cur=DB.currentUser();
  if(!cur){ alert("Login first"); return; }

  const w=DB.wishlist();
  if(!w[cur.email]) w[cur.email]=[];
  if(!w[cur.email].includes(pid)){
    w[cur.email].push(pid);
    DB.saveWishlist(w);
  }

  renderWishlist();
}

function removeFromWishlist(pid){
  const cur=DB.currentUser();
  if(!cur) return;

  const w=DB.wishlist();
  w[cur.email]=(w[cur.email]||[]).filter(x=>x!==pid);
  DB.saveWishlist(w);
  renderWishlist();
}

/*********************** Event Listeners ***********************/
document.addEventListener('click',e=>{
  if(e.target.dataset.buy) handleBuy(Number(e.target.dataset.buy));
  if(e.target.dataset.wish) handleWishlist(Number(e.target.dataset.wish));
  if(e.target.dataset.review) showReviews(Number(e.target.dataset.review));
  if(e.target.dataset.removeWish) removeFromWishlist(Number(e.target.dataset.removeWish));

  if(e.target.id==='open-login' || e.target.id==='open-login2'){ e.preventDefault(); showLogin(); }
  if(e.target.id==='open-register'){ e.preventDefault(); showRegister(); }
  if(e.target.id==='logout'){ e.preventDefault(); DB.setCurrent(null); updateAccountInfo(); }
});

/*********************** Search ***********************/
document.getElementById('searchBtn').onclick=()=>{
  renderProducts(document.getElementById('searchInput').value);
};

/*********************** Navigation ***********************/
document.querySelectorAll('[data-nav]').forEach(a=>{
  a.onclick=e=>{
    e.preventDefault();
    document.querySelector(a.getAttribute('href')).scrollIntoView({behavior:'smooth'});
  };
});

/*********************** Startup ***********************/
renderProducts();
updateAccountInfo();
renderWishlist();
renderOrders();
