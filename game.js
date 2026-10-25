import * as THREE from 'https://esm.sh/three@0.169.0';
const $=id=>document.getElementById(id),animals=['cat','dog','gecko'],animalNames=['검정 고양이','치와와','도마뱀'],guns=['ak','revolver','sniper','rifle','rpg','mg'],gunNames=['AK-47','리볼버','스나이퍼','소총','RPG','기관총'];let ai=0,gi=0,name='',socket,me=null,playing=false,scene,camera,renderer,clock,avatars=new Map(),keys={},joy={x:0,y:0},shootHeld=false,lastShoot=0,viewAngle=0;
function labels(){$('animalLabel').textContent=animalNames[ai];$('gunLabel').textContent=gunNames[gi]}labels();for(const [id,delta,type] of [['prevAnimal',-1,'a'],['nextAnimal',1,'a'],['prevGun',-1,'g'],['nextGun',1,'g']])$(id).onclick=()=>{if(type==='a')ai=(ai+delta+3)%3;else gi=(gi+delta+6)%6;labels()};$('next').onclick=()=>{name=$('nickname').value.trim().slice(0,18);if(!name)return alert('닉네임을 입력해!');$('nameStep').hidden=true;$('selectStep').hidden=false};$('nickname').onkeydown=e=>{if(e.key==='Enter')$('next').click()};$('play').onclick=()=>{init3D();connect();$('overlay').style.display='none';$('hud').style.display='block';playing=true;animate()};$('exit').onclick=()=>location.reload();
function mat(c){return new THREE.MeshLambertMaterial({color:c})}function cube(w,h,d,c){let m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(c));m.castShadow=true;m.receiveShadow=true;return m}function ball(r,c){let m=new THREE.Mesh(new THREE.SphereGeometry(r,8,6),mat(c));m.castShadow=true;return m}function cylinder(r,h,c){let m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,7),mat(c));m.castShadow=true;return m}
function init3D(){scene=new THREE.Scene();scene.background=new THREE.Color(0x8cd1ff);scene.fog=new THREE.Fog(0x8cd1ff,75,200);camera=new THREE.PerspectiveCamera(65,innerWidth/innerHeight,.1,250);renderer=new THREE.WebGLRenderer({antialias:true});renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.shadowMap.enabled=true;document.body.prepend(renderer.domElement);scene.add(new THREE.HemisphereLight(0xffffff,0x88a966,2));let sun=new THREE.DirectionalLight(0xffffff,2);sun.position.set(-30,60,25);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-110;sun.shadow.camera.right=110;sun.shadow.camera.top=110;sun.shadow.camera.bottom=-110;scene.add(sun);let ground=cube(200,.3,200,0x80c35b);ground.position.y=-.2;scene.add(ground);for(let i=0;i<6;i++){let x=-67+(i%3)*65,z=-60+Math.floor(i/3)*105;let house=new THREE.Group(),body=cube(10,6,9,[0xf6dc9b,0xffa99c,0xc2c7f7][i%3]);body.position.y=3;house.add(body);let roof=new THREE.Mesh(new THREE.ConeGeometry(8,4,4),mat(0xb05b46));roof.rotation.y=Math.PI/4;roof.position.y=8;house.add(roof);let door=cube(2,3,.12,0x765138);door.position.set(0,1.5,4.55);house.add(door);for(const wx of [-3,3]){let win=cube(1.5,1.5,.13,0x8bd5f6);win.position.set(wx,4,4.6);house.add(win)}house.position.set(x,0,z);scene.add(house)}for(let i=0;i<35;i++){let x=Math.sin(i*83.4)*89,z=Math.cos(i*49.1)*89;if(Math.abs(x)<14&&Math.abs(z)<14)continue;let tree=new THREE.Group(),trunk=cylinder(.5,4,0x8b5a36);trunk.position.y=2;tree.add(trunk);let top=ball(2.8,[0x489b44,0x67b84d,0x38914d][i%3]);top.position.y=5.2;tree.add(top);tree.position.set(x,0,z);scene.add(tree)}for(let i=0;i<14;i++){let box=cube(2.5,2.5,2.5,0xb99363);box.position.set(Math.sin(i*19)*54,1.25,Math.cos(i*33)*48);scene.add(box)}clock=new THREE.Clock();addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)})}

function makeGun(kind){
 const g=new THREE.Group(),dark=0x33383b,metal=0x616c73,wood=0x82583a;
 const part=(w,h,d,color,x,y,z)=>{const m=cube(w,h,d,color);m.position.set(x,y,z);g.add(m);return m};
 const tube=(radius,length,color,x,y,z)=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,length,8),mat(color));m.rotation.x=Math.PI/2;m.position.set(x,y,z);g.add(m);return m};
 if(kind==='revolver'){
   part(.27,.24,.75,dark,0,0,-.25);tube(.16,.36,metal,0,.03,-.25);tube(.085,.8,dark,0,.02,-.82);part(.2,.45,.22,wood,0,-.29,.05);
 }else if(kind==='sniper'){
   part(.22,.22,1.35,wood,0,0,-.35);tube(.07,1.65,dark,0,.04,-1.55);tube(.12,.72,0x161c24,0,.31,-.42);part(.25,.15,.7,dark,0,-.12,.36);part(.17,.5,.2,dark,0,-.32,-.28);
 }else if(kind==='rpg'){
   tube(.27,2.25,0x60764b,0,.13,-.75);tube(.31,.22,0x313a2e,0,.13,-1.75);part(.18,.55,.23,dark,0,-.3,-.2);part(.55,.09,.15,0x4a5940,0,.52,-.6);
 }else if(kind==='mg'){
   part(.38,.32,1.35,dark,0,0,-.2);for(let i=-1;i<=1;i++)tube(.075,1.35,metal,i*.14,.03,-1.36);
   part(.38,.7,.35,0x555e69,0,-.45,-.35);part(.26,.25,.6,wood,0,-.1,.65);
 }else if(kind==='rifle'){
   part(.23,.24,1.3,wood,0,0,-.3);tube(.065,1.35,metal,0,.07,-1.4);part(.18,.28,.48,dark,0,.24,-.35);part(.2,.44,.2,wood,0,-.3,-.1);
 }else{
   part(.3,.28,1.12,dark,0,0,-.35);tube(.08,.95,metal,0,.06,-1.32);part(.27,.7,.25,0x765039,0,-.42,-.3);part(.24,.25,.67,wood,0,-.04,.46);part(.14,.4,.2,dark,0,-.35,.17);
 }
 return g;
}
function makeAnimalModel(animal,gunType){
 let g=new THREE.Group(),c=animal==='cat'?0x24252b:animal==='dog'?0xcaa071:0xc7aa72;
 const body=cube(.95,1.32,.68,c);body.position.y=1.65;g.add(body);
 const head=ball(animal==='gecko'?.62:.66,c);head.position.set(0,2.7,0);head.scale.set(animal==='gecko'?1.22:1,animal==='gecko'?.74:1,animal==='gecko'?1.15:.92);g.add(head);
 if(animal==='cat'){
   for(const s of [-1,1]){let ear=new THREE.Mesh(new THREE.ConeGeometry(.26,.7,4),mat(c));ear.position.set(s*.43,3.32,0);g.add(ear)}
   let tail=cylinder(.1,1.2,c);tail.rotation.x=.85;tail.position.set(.35,1.1,.63);g.add(tail);
 }else if(animal==='dog'){
   for(const s of [-1,1]){let ear=ball(.31,0xa7754e);ear.scale.set(.62,1.5,.6);ear.position.set(s*.67,2.89,0);g.add(ear)}
   let muzzle=ball(.33,0xe5c59c);muzzle.scale.set(1,.55,.9);muzzle.position.set(0,2.45,-.56);g.add(muzzle);
 }else{
   // Gecko has wide flat head, bulging eyes, ridged crest and thick tapered tail.
   let muzzle=ball(.48,c);muzzle.scale.set(1.3,.32,.78);muzzle.position.set(0,2.53,-.47);g.add(muzzle);
   for(const s of [-1,1]){
     let eyeBulge=ball(.29,c);eyeBulge.position.set(s*.47,2.94,-.27);g.add(eyeBulge);
     for(let i=0;i<5;i++){const crest=new THREE.Mesh(new THREE.ConeGeometry(.11,.26,4),mat(0x9a7b50));crest.position.set(s*(.4+i*.055),3.13-i*.11,.07+i*.11);crest.rotation.z=s*.35;g.add(crest)}
   }
   let tail=new THREE.Mesh(new THREE.ConeGeometry(.34,1.75,7),mat(c));tail.rotation.x=Math.PI/2+.32;tail.position.set(0,1.08,.96);g.add(tail);
 }
 for(const s of [-1,1]){
   let eye=ball(animal==='gecko'?.19:.12,animal==='cat'?0xdce66d:animal==='dog'?0x241d18:0x8b5d35);
   eye.position.set(s*(animal==='gecko'?.48:.27),animal==='gecko'?2.97:2.79,animal==='gecko'?-.5:-.56);g.add(eye);
   if(animal==='gecko'){let pupil=ball(.075,0x19130f);pupil.position.set(s*.48,2.97,-.67);g.add(pupil)}
 }
 if(animal!=='gecko'){let nose=ball(.13,animal==='cat'?0x6a626d:0x322923);nose.position.set(0,2.52,-.65);g.add(nose)}
 const legs=[],arms=[];
 for(const s of [-1,1]){
   let leg=cube(.32,.88,.35,c);leg.position.set(s*.28,.48,0);g.add(leg);legs.push(leg);
   let armPivot=new THREE.Group();armPivot.position.set(s*.59,2.13,-.12);g.add(armPivot);
   let arm=cube(.26,.8,.3,c);arm.position.set(s*.08,-.36,-.26);arm.rotation.x=-.65;armPivot.add(arm);arms.push(armPivot);
 }
 const weapon=makeGun(gunType);weapon.position.set(.28,1.77,-.79);weapon.scale.setScalar(.72);g.add(weapon);
 return {g,legs,arms,weapon};
}
function makeAvatar(p){
 const model=makeAnimalModel(p.animal,p.gun),g=model.g;
 const label=document.createElement('div');
 label.style.cssText='position:absolute;pointer-events:none;background:#fff;border:2px solid #222;border-radius:7px;padding:2px 5px;font:bold 12px system-ui;white-space:nowrap';
 label.textContent=p.name;document.body.appendChild(label);scene.add(g);
 const a={g,limbs:model.legs,arms:model.arms,weapon:model.weapon,label,p:{...p},bubble:null,fall:0};
 avatars.set(p.id,a);return a;
}
function connect(){socket=io();socket.on('connect',()=>socket.emit('join',{name,animal:animals[ai],gun:guns[gi]}));socket.on('joinError',msg=>{alert(msg);location.reload()});socket.on('init',data=>{me=data.id;for(const p of data.players)if(!avatars.has(p.id))makeAvatar(p)});socket.on('playerJoined',p=>{if(!avatars.has(p.id))makeAvatar(p)});socket.on('moved',d=>{const a=avatars.get(d.id);if(a)Object.assign(a.p,d)});socket.on('health',d=>{const a=avatars.get(d.id);if(a){a.p.hp=d.hp;if(d.id===me)hud()}});socket.on('died',d=>{const a=avatars.get(d.id);if(a){a.p.dead=true;a.fall=1}});socket.on('respawned',d=>{const a=avatars.get(d.id);if(a){Object.assign(a.p,d,{dead:false});a.fall=0;a.g.rotation.z=0;if(d.id===me)hud()}});socket.on('playerLeft',id=>{const a=avatars.get(id);if(a){scene.remove(a.g);a.label.remove();a.bubble?.remove();avatars.delete(id)}});socket.on('system',msg=>log('📢 '+msg));socket.on('chat',d=>{log(`${d.name}: ${d.msg}`);const a=avatars.get(d.id);if(a){a.bubble?.remove();const b=document.createElement('div');b.style.cssText='position:absolute;pointer-events:none;background:#fff;border:2px solid #222;border-radius:12px;padding:5px;max-width:180px;overflow-wrap:anywhere;font:13px system-ui';b.textContent=d.msg;document.body.appendChild(b);a.bubble=b;setTimeout(()=>{if(a.bubble===b)a.bubble=null;b.remove()},3500)}});socket.on('shot',d=>{const a=avatars.get(d.id);if(a){a.g.scale.z=.92;setTimeout(()=>{a.g.scale.z=1},80)}let line=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(d.x,1.8,d.z),new THREE.Vector3(d.x+d.dx*30,1.8,d.z+d.dz*30)]),new THREE.LineBasicMaterial({color:0xffeb4d}));scene.add(line);setTimeout(()=>{scene.remove(line);line.geometry.dispose();line.material.dispose()},90)})}
function hud(){const a=avatars.get(me);if(a)$('top').textContent=`${a.p.name} | ❤️ ${a.p.hp}/100 | ${gunNames[guns.indexOf(a.p.gun)]}`}function log(s){const d=document.createElement('div');d.textContent=s;$('log').appendChild(d);$('log').scrollTop=$('log').scrollHeight;while($('log').children.length>35)$('log').firstChild.remove()}function sendChat(){const v=$('chatinput').value.trim();if(v)socket?.emit('chat',v);$('chatinput').value='';$('chatinput').blur()}$('send').onclick=sendChat;$('chatinput').onkeydown=e=>{if(e.key==='Enter')sendChat()};addEventListener('keydown',e=>{if(document.activeElement===$('chatinput'))return;keys[e.code]=true;if(e.code==='Enter'&&playing)$('chatinput').focus()});addEventListener('keyup',e=>keys[e.code]=false);addEventListener('mousemove',e=>{if(playing&&e.buttons===1)viewAngle-=e.movementX*.006});rendererPointer();function rendererPointer(){addEventListener('mousedown',e=>{if(playing&&e.target.tagName==='CANVAS'&&e.button===2)shootHeld=true});addEventListener('mouseup',()=>shootHeld=false)}$('shoot').addEventListener('pointerdown',e=>{e.preventDefault();shootHeld=true});for(const ev of ['pointerup','pointercancel','pointerleave'])$('shoot').addEventListener(ev,()=>shootHeld=false);const joyEl=$('joystick');joyEl.addEventListener('pointerdown',e=>{joyEl.setPointerCapture(e.pointerId);updateJoy(e)});joyEl.addEventListener('pointermove',e=>{if(e.buttons)updateJoy(e)});for(const ev of ['pointerup','pointercancel'])joyEl.addEventListener(ev,()=>{joy={x:0,y:0};$('knob').style.transform='' });function updateJoy(e){const r=joyEl.getBoundingClientRect(),x=(e.clientX-r.left-r.width/2)/40,y=(e.clientY-r.top-r.height/2)/40,l=Math.max(1,Math.hypot(x,y));joy={x:x/l,y:y/l};$('knob').style.transform=`translate(${joy.x*35}px,${joy.y*35}px)`}let touchX=null;addEventListener('touchstart',e=>{for(const t of e.changedTouches)if(t.clientX>innerWidth*.55&&t.clientY<innerHeight*.75)touchX=t.clientX},{passive:true});addEventListener('touchmove',e=>{if(touchX===null)return;for(const t of e.changedTouches)if(t.clientX>innerWidth*.55){viewAngle-=(t.clientX-touchX)*.006;touchX=t.clientX}},{passive:true});addEventListener('touchend',()=>touchX=null);
let moveSent=0;function animate(){if(!playing)return;requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.05),a=avatars.get(me);if(a){const p=a.p;let mx=(keys.KeyD?1:0)-(keys.KeyA?1:0)+joy.x,mz=(keys.KeyS?1:0)-(keys.KeyW?1:0)+joy.y;const len=Math.hypot(mx,mz);if(!p.dead){p.rot=viewAngle}if(!p.dead&&len>.1){mx/=Math.max(1,len);mz/=Math.max(1,len);const dx=mx*Math.cos(viewAngle)-mz*Math.sin(viewAngle),dz=-mx*Math.sin(viewAngle)+mz*Math.cos(viewAngle);p.x=Math.max(-94,Math.min(94,p.x+dx*6*dt));p.z=Math.max(-94,Math.min(94,p.z+dz*6*dt));p.rot=viewAngle;a.walk=(a.walk||0)+dt*13}else a.walk=0;if(!p.dead&&shootHeld&&performance.now()-lastShoot>95){socket.emit('shoot',{dx:-Math.sin(p.rot),dz:-Math.cos(p.rot)});lastShoot=performance.now()}if(performance.now()-moveSent>50){socket.emit('move',{x:p.x,z:p.z,rot:p.rot});moveSent=performance.now()}const desired=new THREE.Vector3(p.x+Math.sin(viewAngle)*10,7,p.z+Math.cos(viewAngle)*10);camera.position.lerp(desired,Math.min(1,dt*7));camera.lookAt(p.x,2,p.z)}for(const [id,av] of avatars){const p=av.p;av.g.position.set(p.x,0,p.z);av.g.rotation.y=p.rot||0;if(p.dead){av.g.rotation.z=Math.min(Math.PI/2,av.g.rotation.z+dt*4)}else{av.g.rotation.z=0;const walk=id===me?(av.walk||0):performance.now()/170;av.limbs[0].rotation.x=Math.sin(walk)*.45;av.limbs[1].rotation.x=-Math.sin(walk)*.45}const pos=new THREE.Vector3(p.x,4,p.z).project(camera);const visible=pos.z<1;av.label.style.display=visible?'block':'none';av.label.style.left=(pos.x*.5+.5)*innerWidth+'px';av.label.style.top=(-pos.y*.5+.5)*innerHeight+'px';av.label.style.transform='translate(-50%,-50%)';if(av.bubble){const q=new THREE.Vector3(p.x,4.65,p.z).project(camera);av.bubble.style.display=q.z<1?'block':'none';av.bubble.style.left=(q.x*.5+.5)*innerWidth+'px';av.bubble.style.top=(-q.y*.5+.5)*innerHeight+'px';av.bubble.style.transform='translate(-50%,-100%)'}}renderer.render(scene,camera)}

// Separate interactive 3D previews in the character/weapon selector.
let previews=[];
function startPreviews(){
 for(const [id,isAnimal] of [['animalPreview',true],['gunPreview',false]]){
   const canvas=$(id),r=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
   r.setPixelRatio(Math.min(devicePixelRatio,1.5));
   const s=new THREE.Scene();s.add(new THREE.HemisphereLight(0xffffff,0x778899,2.5));
   const light=new THREE.DirectionalLight(0xffffff,2);light.position.set(3,6,7);s.add(light);
   const c=new THREE.PerspectiveCamera(40,1,.1,100);
   c.position.set(isAnimal?5:3,isAnimal?3.1:1.5,isAnimal?7:4.5);
   c.lookAt(0,isAnimal?1.8:0,0);
   previews.push({canvas,r,s,c,isAnimal,model:null,old:-1});
 }
 function frame(t){
   if(!$('selectStep').hidden){
     for(const p of previews){
       const idx=p.isAnimal?ai*10+gi:gi;
       if(idx!==p.old){
         if(p.model)p.s.remove(p.model);
         p.model=p.isAnimal?makeAnimalModel(animals[ai],guns[gi]).g:makeGun(guns[gi]);
         p.s.add(p.model);p.old=idx;
       }
       const rect=p.canvas.getBoundingClientRect();
       const w=Math.max(1,Math.floor(rect.width)),h=Math.max(1,Math.floor(rect.height));
       if(p.canvas.width!==w||p.canvas.height!==h)p.r.setSize(w,h,false);
       p.c.aspect=w/h;p.c.updateProjectionMatrix();
       p.model.rotation.y=Math.sin(t*.0005)*.45;
       p.r.render(p.s,p.c);
     }
   }
   requestAnimationFrame(frame);
 }
 requestAnimationFrame(frame);
}
startPreviews();

addEventListener('contextmenu',e=>{if(playing&&e.target.tagName==='CANVAS')e.preventDefault()});
