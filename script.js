const melt = document.getElementById('melt');
const magma = document.getElementById('magma');
const magmaGroup = document.getElementById('magmaGroup');
const info = document.getElementById('info');
const eruptionBtn = document.getElementById('eruption');
const resetBtn = document.getElementById('reset');
const svg = document.getElementById('volcano');
const lavaFlows = document.getElementById('lavaFlows');
const lavaStreams = document.querySelectorAll('.lava-stream');
const lavaPool = document.getElementById('lava-pool');
const ashPuff = document.getElementById('ash-puff');

// Scene controls
const sceneButtons = document.querySelectorAll('.scene-btn');
const sceneVolcanoPanel = document.getElementById('scene-volcano');
const sceneRiverPanel = document.getElementById('scene-river');
const riverSceneSection = document.getElementById('riverScene');

// River elements
const erosion = document.getElementById('erosion');
const simulateRiverBtn = document.getElementById('simulateRiver');
const resetRiverBtn = document.getElementById('resetRiver');
const infoRiver = document.getElementById('infoRiver');
const riverPath = document.getElementById('riverPath');
const rocks = document.querySelectorAll('#rocks .rock');


function updateMelt(val){
  // map 0-100 to rx 12-90 and color from dull orange to bright
  const rx = 12 + (val/100) * 78;
  const ry = 8 + (val/100) * 40;
  magma.setAttribute('rx', rx);
  magma.setAttribute('ry', ry);

  // color shift
  const r = Math.round(255);
  const g = Math.round(90 - val*0.5);
  const b = Math.round(60 - val*0.3);
  magma.style.fill = `rgb(${r}, ${Math.max(45,g)}, ${Math.max(20,b)})`;

  // info text linking feature -> process
  let stage = 'Low melting — small magma pocket. Volcanism is less likely.';
  if(val > 30 && val <= 65) stage = 'Moderate melting — magma accumulates; intrusions and smaller eruptions possible.';
  if(val > 65) stage = 'High melting — large magma chamber forms; explosive eruptions more likely and a prominent volcano builds.';
  info.textContent = stage + ' (melting intensity: ' + val + '%)';
}

melt.addEventListener('input', (e)=>{
  updateMelt(Number(e.target.value));
});

eruptionBtn.addEventListener('click', ()=>{
  // trigger eruption: animate lava streams and pool
  svg.classList.add('erupting');
  
  // animate magma chamber expansion (using attribute changes, not transforms)
  const originalRx = 45;
  const originalRy = 28;
  magma.animate([
    { rx: originalRx, ry: originalRy },
    { rx: originalRx * 1.35, ry: originalRy * 1.35 },
    { rx: originalRx, ry: originalRy }
  ], { duration: 1000, easing: 'ease-out' });

  // animate each lava stream with staggered timing
  lavaStreams.forEach((stream, index) => {
    stream.classList.remove('animate');
    void stream.offsetWidth;
    setTimeout(() => {
      stream.classList.add('animate');
    }, index * 80);
  });

  // animate the lava pool at the base
  setTimeout(() => {
    lavaPool.classList.remove('animate');
    void lavaPool.offsetWidth;
    lavaPool.classList.add('animate');
  }, 150);

  // textual hint
  info.textContent = 'Eruption: magma ascended the conduit and lava flowed at the surface — a volcano is formed by mantle melting driven by subduction.';

  // fade out eruption after animation
  setTimeout(()=>{ 
    svg.classList.remove('erupting');
    lavaStreams.forEach(s => s.classList.remove('animate'));
    lavaPool.classList.remove('animate');
  }, 2000);
});

resetBtn.addEventListener('click', ()=>{
  melt.value = 30;
  updateMelt(30);
  info.textContent = 'Reset. Use the slider to explore how changes in melting affect the volcano.';
});

// initial state
updateMelt(Number(melt.value));

// Scene switching
function switchScene(name){
  document.querySelectorAll('.scene-controls').forEach(el=>el.classList.add('scene-hidden'));
  document.querySelectorAll('.canvas').forEach(el=>el.classList.add('scene-hidden'));
  sceneButtons.forEach(b=>b.classList.toggle('active', b.dataset.scene===name));
  if(name==='volcano'){
    sceneVolcanoPanel.classList.remove('scene-hidden');
    document.getElementById('volcano').parentElement.classList.remove('scene-hidden');
  } else if(name==='river'){
    sceneRiverPanel.classList.remove('scene-hidden');
    riverSceneSection.classList.remove('scene-hidden');
  }
}

sceneButtons.forEach(b=>b.addEventListener('click', ()=> switchScene(b.dataset.scene)));

// River behaviour
function updateRiver(val){
  // change stroke width and tint to represent energy
  const width = 4 + (val/100)*16; // 4..20
  riverPath.setAttribute('stroke-width', width);

  // color shift
  const blueness = Math.round(160 + (val/100)*95);
  riverPath.style.stroke = `rgb(44, ${150 + Math.round(val/4)}, ${blueness})`;

  // informational text
  let stage = 'Low erosion — river meanders slowly, but rocks still roughen the current and tug at the outside bends.';
  if(val > 35 && val <= 70) stage = 'Moderate erosion — cobbles and rocks force the water to swirl harder, carving cutbanks and pushing sediment onto point bars.';
  if(val > 70) stage = 'High erosion — the rocky channel becomes more turbulent, outer bends are undercut, and cutoff meanders become likely.';
  infoRiver.textContent = stage + ' (erosion intensity: ' + val + '%)';

  // make the rocks feel more active as erosion rises
  rocks.forEach((rock, index)=>{
    const wobble = 1 + (val/100) * 0.12;
    const lift = (index % 2 === 0 ? 1 : -1) * (val/100) * 3;
    rock.setAttribute('transform', `translate(0 ${lift}) scale(${wobble})`);
    rock.style.opacity = String(0.72 + (val/100) * 0.24);
  });
}

simulateRiverBtn.addEventListener('click', ()=>{
  // animate stroke-dashoffset to simulate flow and migration
  riverPath.style.transition = 'stroke-dashoffset 1200ms linear, transform 1200ms ease';
  const len = riverPath.getTotalLength();
  riverPath.style.strokeDasharray = len;
  riverPath.style.strokeDashoffset = len;
  // slide dashoffset to 0
  requestAnimationFrame(()=>{
    riverPath.style.strokeDashoffset = '0';
  });

  // slight sway to suggest migration, scaled by erosion
  const sway = 1 + (Number(erosion.value)/100)*0.06;
  riverPath.animate([
    { transform: 'translateX(0px) scale(1)' },
    { transform: `translateX(${20 * (Number(erosion.value)/100)}px) scale(${sway})` },
    { transform: 'translateX(0px) scale(1)' }
  ], { duration: 1400, easing: 'ease-in-out' });

  rocks.forEach((rock, index)=>{
    rock.animate([
      { transform: rock.getAttribute('transform') || 'translate(0 0) scale(1)' },
      { transform: `translate(${(index % 2 === 0 ? -1 : 1) * 4}px ${-2 - (Number(erosion.value)/100) * 3}px) scale(1.08)` },
      { transform: rock.getAttribute('transform') || 'translate(0 0) scale(1)' }
    ], { duration: 1000 + index * 40, easing: 'ease-out' });
  });
});

resetRiverBtn.addEventListener('click', ()=>{
  erosion.value = 40;
  updateRiver(40);
  infoRiver.textContent = 'Reset. Use the slider to explore erosion and channel migration.';
});

erosion.addEventListener('input', (e)=> updateRiver(Number(e.target.value)));

// initial river state
updateRiver(Number(erosion.value));

// default scene
switchScene('volcano');
