// Sonido de ambiente generado en el navegador (no es música del juego).
const Amb=(()=>{
  let ctx,master,RUIDO,on=false,timers=[];
  function iniciar(){
    ctx=new (window.AudioContext||window.webkitAudioContext)();
    master=ctx.createGain();master.gain.value=0;master.connect(ctx.destination);
    RUIDO=ctx.createBuffer(1,ctx.sampleRate*2,ctx.sampleRate);const d=RUIDO.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
    // zumbido grave del edificio
    const lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=180;lp.Q.value=6;lp.connect(master);
    [43.65,43.9,65.4].forEach((f,i)=>{const o=ctx.createOscillator();o.type=i<2?'sawtooth':'triangle';o.frequency.value=f;const g=ctx.createGain();g.gain.value=i<2?.12:.05;o.connect(g).connect(lp);o.start();});
    const lfo=ctx.createOscillator();lfo.frequency.value=.07;const lg=ctx.createGain();lg.gain.value=90;lfo.connect(lg).connect(lp.frequency);lfo.start();
    // tubo fluorescente
    const h=ctx.createOscillator();h.type='square';h.frequency.value=120;const hb=ctx.createBiquadFilter();hb.type='bandpass';hb.frequency.value=1200;hb.Q.value=8;const hg=ctx.createGain();hg.gain.value=.012;h.connect(hb).connect(hg).connect(master);h.start();
    // aire de ventilación
    const n=ctx.createBufferSource();n.buffer=RUIDO;n.loop=true;const nb=ctx.createBiquadFilter();nb.type='lowpass';nb.frequency.value=500;const ng=ctx.createGain();ng.gain.value=.035;n.connect(nb).connect(ng).connect(master);n.start();
  }
  function latido(t){[0,.28].forEach((d,i)=>{const o=ctx.createOscillator();o.type='sine';o.frequency.setValueAtTime(70,t+d);o.frequency.exponentialRampToValueAtTime(38,t+d+.18);const g=ctx.createGain();g.gain.setValueAtTime(0,t+d);g.gain.linearRampToValueAtTime(i?.35:.5,t+d+.015);g.gain.exponentialRampToValueAtTime(.001,t+d+.25);o.connect(g).connect(master);o.start(t+d);o.stop(t+d+.3);});}
  function chirrido(){const t=ctx.currentTime,s=ctx.createBufferSource();s.buffer=RUIDO;const b=ctx.createBiquadFilter();b.type='bandpass';b.Q.value=30;const f0=300+Math.random()*900;b.frequency.setValueAtTime(f0,t);b.frequency.exponentialRampToValueAtTime(f0*(.5+Math.random()),t+2.5);const g=ctx.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.5,t+.4);g.gain.linearRampToValueAtTime(0,t+2.6);let fin=g;if(ctx.createStereoPanner){const pan=ctx.createStereoPanner();pan.pan.value=Math.random()*2-1;g.connect(pan);fin=pan;}s.connect(b).connect(g);fin.connect(master);s.start(t);s.stop(t+2.7);}
  function golpe(){const t=ctx.currentTime,s=ctx.createBufferSource();s.buffer=RUIDO;const b=ctx.createBiquadFilter();b.type='lowpass';b.frequency.value=220;const g=ctx.createGain();g.gain.setValueAtTime(.9,t);g.gain.exponentialRampToValueAtTime(.001,t+.6);s.connect(b).connect(g).connect(master);s.start(t);s.stop(t+.7);}
  function programar(){
    const ciclo=()=>{if(!on)return;const t=ctx.currentTime,n=8+Math.floor(Math.random()*8);for(let i=0;i<n;i++)latido(t+i*1.05);timers.push(setTimeout(ciclo,(n*1.05+14+Math.random()*18)*1000));};
    const raro=()=>{if(!on)return;(Math.random()<.6?chirrido:golpe)();timers.push(setTimeout(raro,(7+Math.random()*16)*1000));};
    timers.push(setTimeout(ciclo,4000),setTimeout(raro,2500));
  }
  return{
    alternar(){if(!ctx)iniciar();on=!on;timers.forEach(clearTimeout);timers=[];
      if(on){ctx.resume();programar();}
      master.gain.cancelScheduledValues(ctx.currentTime);master.gain.setTargetAtTime(on?.7:0,ctx.currentTime,.8);return on;},
    cambio(){if(!on||!ctx)return;const t=ctx.currentTime,s=ctx.createBufferSource();s.buffer=RUIDO;const b=ctx.createBiquadFilter();b.type='highpass';b.frequency.value=2500;const g=ctx.createGain();g.gain.setValueAtTime(.25,t);g.gain.exponentialRampToValueAtTime(.001,t+.12);s.connect(b).connect(g).connect(master);s.start(t);s.stop(t+.15);golpe();},
    activo:()=>on
  };
})();
const btn=document.getElementById('sonido');
const pintar=()=>{btn.classList.toggle('on',Amb.activo());btn.setAttribute('aria-pressed',Amb.activo());btn.querySelector('.txt').textContent='SONIDO: '+(Amb.activo()?'SÍ':'NO');};
btn.addEventListener('click',()=>{Amb.alternar();pintar();try{localStorage.setItem('ot-sonido',Amb.activo()?'1':'0');}catch(e){}});
// los navegadores no dejan sonar sin un clic: arranca con el primer clic o tecla (salvo que lo apagara antes)
let quiere=true;try{quiere=localStorage.getItem('ot-sonido')!=='0';}catch(e){}
if(quiere){const arr=e=>{if(e.target.closest&&e.target.closest('#sonido'))return;if(!Amb.activo()){Amb.alternar();pintar();}};document.addEventListener('pointerdown',arr,{once:true});document.addEventListener('keydown',arr,{once:true});}
