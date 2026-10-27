// skin picker
function openSkins(cb){const L=SK.map((s,i)=>i),items=L.map(i=>({img:SKP[i],n:SK[i].n,t:''}));openCar('Choose your skin',items,Math.max(0,L.indexOf(me.sk)),j=>cb(L[j]))}
