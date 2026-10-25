import express from 'express';
import {createServer} from 'node:http';
import {Server} from 'socket.io';
const app=express(),http=createServer(app),io=new Server(http);app.use(express.static('.'));app.get('/',(req,res)=>res.sendFile('index.html',{root:process.cwd()}));
const players=new Map();const weapons={ak:{damage:12,delay:150,range:90},revolver:{damage:32,delay:650,range:85},sniper:{damage:65,delay:1500,range:180},rifle:{damage:18,delay:320,range:120},rpg:{damage:45,delay:1800,range:85},mg:{damage:8,delay:95,range:80}};
const spawn=()=>({x:(Math.random()-.5)*60,z:(Math.random()-.5)*60});
const clean=(s,max=18)=>String(s||'').replace(/[<>\x00-\x1f]/g,'').trim().slice(0,max);
io.on('connection',socket=>{
 socket.on('join',data=>{if(players.has(socket.id))return;if(players.size>=15){socket.emit('joinError','서버가 가득 찼어요. 잠시 후 다시 접속해 주세요.');return;}const name=clean(data?.name)||'Animal';const animal=['cat','dog','gecko'].includes(data?.animal)?data.animal:'cat';const gun=weapons[data?.gun]?data.gun:'ak';const p={id:socket.id,name,animal,gun,...spawn(),rot:0,hp:100,dead:false,lastShot:0,lastMove:Date.now(),dancing:false};players.set(socket.id,p);socket.emit('init',{id:socket.id,players:[...players.values()]});io.emit('playerJoined',p);io.emit('system',`${name}님이 들어오셨습니다.`)});
 socket.on('move',d=>{const p=players.get(socket.id);if(!p||p.dead)return;const x=Number(d?.x),z=Number(d?.z),rot=Number(d?.rot);if(![x,z,rot].every(Number.isFinite))return;const now=Date.now();const dt=Math.min((now-(p.lastMove||now))/1000,.15);p.lastMove=now;const dist=Math.hypot(x-p.x,z-p.z);if(dist>Math.max(.9,dt*12))return;p.x=Math.max(-94,Math.min(94,x));p.z=Math.max(-94,Math.min(94,z));p.rot=rot;socket.broadcast.emit('moved',{id:p.id,x:p.x,z:p.z,rot:p.rot})});
 socket.on('emote',()=>{const p=players.get(socket.id);if(!p||p.dead)return;const now=Date.now();if(now-(p.lastEmote||0)<2500)return;p.lastEmote=now;io.emit('emote',{id:p.id,until:now+2100})});
 socket.on('chat',raw=>{const p=players.get(socket.id);if(!p)return;const msg=clean(raw,100);if(!msg)return;const now=Date.now();if(now-(p.lastChat||0)<600)return;p.lastChat=now;io.emit('chat',{id:p.id,name:p.name,msg})});
 socket.on('shoot',d=>{
  const p=players.get(socket.id);if(!p||p.dead)return;
  const w=weapons[p.gun],now=Date.now();if(now-p.lastShot<w.delay)return;
  const dx=Number(d?.dx),dy=Number(d?.dy),dz=Number(d?.dz);
  if(![dx,dy,dz].every(Number.isFinite))return;
  const len=Math.hypot(dx,dy,dz);if(len<.5||len>2)return;
  const ux=dx/len,uy=dy/len,uz=dz/len;
  // The server owns the shot origin and validates its aim against player rotation.
  const forwardX=-Math.sin(p.rot),forwardZ=-Math.cos(p.rot);
  if(ux*forwardX+uz*forwardZ<.25)return;
  p.lastShot=now;
  const origin={x:p.x,y:2.25,z:p.z};
  let hits=[];
  for(const q of players.values()){
   if(q.id===p.id||q.dead)continue;
   // Sphere approximation for upright character, including vertical aim.
   const vx=q.x-origin.x,vy=1.8-origin.y,vz=q.z-origin.z;
   const t=vx*ux+vy*uy+vz*uz;
   const perp2=vx*vx+vy*vy+vz*vz-t*t;
   if(t>0&&t<w.range&&perp2<1.05*1.05)hits.push({q,t});
  }
  hits.sort((a,b)=>a.t-b.t);
  const target=hits[0];
  const length=target?target.t:w.range;
  io.emit('shot',{id:p.id,x:origin.x,y:origin.y,z:origin.z,dx:ux,dy:uy,dz:uz,length,gun:p.gun});
  if(!target)return;
  const q=target.q;
  q.hp=Math.max(0,q.hp-w.damage);
  io.emit('health',{id:q.id,hp:q.hp,attacker:p.id,damage:w.damage});
  if(q.hp===0){
   q.dead=true;io.emit('died',{id:q.id});
   io.emit('system',`${p.name}님이 ${q.name}님을 죽였습니다.`);
   setTimeout(()=>{if(players.get(q.id)!==q)return;Object.assign(q,spawn(),{hp:100,dead:false});io.emit('respawned',{id:q.id,x:q.x,z:q.z,hp:q.hp})},5000);
  }
 });
 socket.on('disconnect',()=>{const p=players.get(socket.id);if(!p)return;players.delete(socket.id);io.emit('playerLeft',socket.id);io.emit('system',`${p.name}님이 나가셨습니다.`)})
});http.listen(process.env.PORT||3000,()=>console.log('Game at http://localhost:3000'));
