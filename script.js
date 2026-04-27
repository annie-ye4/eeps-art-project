const melt = document.getElementById('melt');
const magma = document.getElementById('magma');
const magmaGroup = document.getElementById('magmaGroup');
const info = document.getElementById('info');
const eruptionBtn = document.getElementById('eruption');
const resetBtn = document.getElementById('reset');
const svg = document.getElementById('volcano');
const lava = document.getElementById('lava');

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
  // trigger eruption: animate lava and pulse magma
  svg.classList.add('erupting');
  lava.classList.remove('animate');
  // force reflow to restart animation
  void lava.offsetWidth;
  lava.classList.add('animate');

  // make magma expand temporarily
  magma.animate([
    { transform: 'scale(1)', transformOrigin: '470px 300px' },
    { transform: 'scale(1.35)' },
    { transform: 'scale(1)' }
  ], { duration: 900, easing: 'ease-out' });

  // textual hint
  info.textContent = 'Eruption: magma ascended the conduit and lava flowed at the surface — a volcano is formed by mantle melting driven by subduction.';

  // remove erupting class after animation
  setTimeout(()=>{ svg.classList.remove('erupting'); lava.classList.remove('animate'); }, 1600);
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
  let stage = 'Low erosion — river meanders slowly, banks stable.';
  if(val > 35 && val <= 70) stage = 'Moderate erosion — cutbanks form and the channel migrates.';
  if(val > 70) stage = 'High erosion — rapid migration and channel cutoff; oxbow lakes likely.';
  infoRiver.textContent = stage + ' (erosion intensity: ' + val + '%)';
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
