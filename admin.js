// SUNDBLOOM: administración conectada a Supabase
const initialProducts = [
 {id:"p1",name:"Top básico oliva",price:59,image:"assets/cf103c1fc2b8f13ca2f96da2dfe3c553.jpg",category:"tops"},
 {id:"p2",name:"Top azul casual",price:65,image:"assets/c1db035ed6a141e5fd7bbd9fb2aef8a6.jpg",category:"tops"},
 {id:"p3",name:"Top negro esencial",price:55,image:"assets/c96cbeff02d07b1c3304fefb6e7cea19.jpg",category:"tops"},
 {id:"p4",name:"Top neutro daily",price:59,image:"assets/a8caa758682a93c72fa725900074e65a.jpg",category:"casual"},
 {id:"p5",name:"Top blanco soft",price:62,image:"assets/8d42d2c4189fc62a13d2dd86f3066710.jpg",category:"tops"},
 {id:"p6",name:"Look casual verde",price:89,image:"assets/e0973ef5761f53dfdc5ca2fb81977162.jpg",category:"casual"},
 {id:"p7",name:"Top negro + denim",price:69,image:"assets/61bc00e743f616ac698f5fc6d25fb8e2.jpg",category:"street"},
 {id:"p8",name:"Look urbano daily",price:99,image:"assets/2814edb62a6218d32bed28962fe520d8.jpg",category:"street"}
];
let products=[];
const $=id=>document.getElementById(id);
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function message(id,text){$(id).textContent=text||'';}
async function loadProducts(){
 const {data,error}=await supabaseClient.from('products').select('*').order('created_at',{ascending:true});
 if(error) throw error;
 if(!data.length){
   const {error:seedError}=await supabaseClient.from('products').insert(initialProducts);
   if(seedError) throw seedError;
   const {data:seeded,error:reloadError}=await supabaseClient.from('products').select('*').order('created_at',{ascending:true});
   if(reloadError) throw reloadError; products=seeded||[];
 }else products=data;
 render();
}
function render(){
 const root=$('admin-products'); root.innerHTML='';
 if(!products.length){root.textContent='No hay prendas publicadas.';return;}
 products.forEach(product=>{
  const item=document.createElement('div'); item.className='admin-item';
  item.innerHTML=`<img src="${esc(product.image)}" alt="${esc(product.name)}"><strong>${esc(product.name)}</strong><p>S/ ${Number(product.price).toFixed(2)}</p><button type="button" data-id="${esc(product.id)}">ELIMINAR</button>`;
  item.querySelector('button').addEventListener('click',async()=>{
   if(!confirm('¿Eliminar esta prenda?'))return;
   message('admin-message','Eliminando…');
   const {error}=await supabaseClient.from('products').delete().eq('id',product.id);
   if(error){message('admin-message','No se pudo eliminar: '+error.message);return;}
   if(product.image && product.image.includes('/storage/v1/object/public/product-images/')){
    const path=product.image.split('/storage/v1/object/public/product-images/')[1];
    if(path) await supabaseClient.storage.from('product-images').remove([decodeURIComponent(path)]);
   }
   await loadProducts(); message('admin-message','Prenda eliminada.');
  }); root.appendChild(item);
 });
}
async function showAdmin(){ $('login-card').hidden=true; $('admin-content').hidden=false; try{await loadProducts();}catch(e){message('admin-message','No se pudieron cargar los productos: '+e.message);}}
$('login-form').addEventListener('submit',async e=>{
 e.preventDefault(); message('login-message','Iniciando sesión…');
 const {error}=await supabaseClient.auth.signInWithPassword({email:$('login-email').value.trim(),password:$('login-password').value});
 if(error){message('login-message','No se pudo iniciar sesión. Revisa el correo y la contraseña.');return;}
 const {data:{user}}=await supabaseClient.auth.getUser();
 if(!user || user.id!=='881db03d-8abe-4e2e-bb68-809acc6e7403'){
  await supabaseClient.auth.signOut(); message('login-message','Esta cuenta no tiene permiso de administración.');return;
 }
 message('login-message',''); await showAdmin();
});
$('logout-button').addEventListener('click',async()=>{await supabaseClient.auth.signOut();$('admin-content').hidden=true;$('login-card').hidden=false;message('login-message','Sesión cerrada.');});
$('product-form').addEventListener('submit',async e=>{
 e.preventDefault(); const file=$('product-image').files[0], name=$('product-name').value.trim(), price=Number($('product-price').value), category=$('product-category').value;
 if(!file||!name||!Number.isFinite(price)||price<=0){message('admin-message','Completa el nombre, el precio y la foto.');return;}
 if(file.size>5*1024*1024){message('admin-message','La imagen supera el límite de 5 MB.');return;}
 message('admin-message','Subiendo foto y guardando producto…');
 const id='p'+crypto.randomUUID(); const ext=(file.name.split('.').pop()||'jpg').toLowerCase().replace(/[^a-z0-9]/g,''); const path=`${id}.${ext}`;
 const {error:uploadError}=await supabaseClient.storage.from('product-images').upload(path,file,{contentType:file.type,upsert:false});
 if(uploadError){message('admin-message','No se pudo subir la foto: '+uploadError.message);return;}
 const {data:{publicUrl}}=supabaseClient.storage.from('product-images').getPublicUrl(path);
 const {error}=await supabaseClient.from('products').insert({id,name,price,image:publicUrl,category});
 if(error){await supabaseClient.storage.from('product-images').remove([path]);message('admin-message','No se pudo guardar el producto: '+error.message);return;}
 e.target.reset(); await loadProducts(); message('admin-message','¡Prenda publicada! Ya está guardada en Supabase.');
});
(async()=>{const {data:{session}}=await supabaseClient.auth.getSession();if(session){const {data:{user}}=await supabaseClient.auth.getUser();if(user?.id==='881db03d-8abe-4e2e-bb68-809acc6e7403')await showAdmin();else await supabaseClient.auth.signOut();}})();
