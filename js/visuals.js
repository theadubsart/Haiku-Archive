let currentRender = {
  rules: { frogs: 0, ripples: 0, cold: false, night: false, sunset: false, pond: false, river: false, sea: false, frogSize: "normal" },
  seed: 1,
};

function setCurrentRender(rules, seed) {
  currentRender = { rules, seed };
  if (window.__p5_instance) window.__p5_instance.redraw();
}

function mountP5(targetId) {
  const sketch = (p) => {
    p.setup = () => {
      const cnv = p.createCanvas(400, 400);
      cnv.parent(targetId);
      p.noLoop();
      p.pixelDensity(1);
      p.redraw();
    };

    const riverCenterY = (x) => {
      return p.height * (0.32 + 0.18 * Math.sin((x / p.width) * Math.PI * 1.2));
    };

    const drawRiver = () => {
      const width = p.height * 0.26;
      p.beginShape();
      for (let x = -30; x <= p.width + 30; x += 16) {
        p.curveVertex(x, riverCenterY(x) - width / 2);
      }
      for (let x = p.width + 30; x >= -30; x -= 16) {
        p.curveVertex(x, riverCenterY(x) + width / 2);
      }
      p.endShape(p.CLOSE);
    };

    const drawRiverRipples = (count) => {
      for (let i = 0; i < count; i++) {
        const offset = (i + 1) * 12;
        p.beginShape();
        for (let x = -20; x <= p.width + 20; x += 18) {
          const baseY = riverCenterY(x);
          const wave = Math.sin((x + i * 20) * 0.06) * 4;
          p.curveVertex(x, baseY + offset + wave);
        }
        p.endShape();
      }
    };

    const drawSea = () => {
      p.rect(-10, p.height * 0.45, p.width + 20, p.height * 0.55);
    };

    const drawSeaRipples = (count) => {
      for (let i = 0; i < count; i++) {
        const y = p.height * 0.55 + i * 14;
        p.beginShape();
        for (let x = -20; x <= p.width + 20; x += 18) {
          const wave = Math.sin((x + i * 22) * 0.05) * 5;
          p.curveVertex(x, y + wave);
        }
        p.endShape();
      }
    };

    p.draw = () => {
      const data = currentRender.rules;
      p.clear();

      // background rules
      if (data.night) p.background(30, 40, 80);
      else if (data.cold) p.background(190, 210, 230);
      else if (data.sunset) p.background(226, 190, 123);
      else p.background(170, 190, 160);

      const showSea = !!data.sea;
      const showRiver = !showSea && !!data.river;
      const showPond = !showSea && !showRiver && (data.pond || true);

      // river or pond
      p.noStroke();
      p.fill(100, 130, 150);
      if (showSea) {
        drawSea();
      } else if (showRiver) {
        drawRiver();
      } else if (showPond) {
        p.ellipse(p.width / 2, p.height / 2, 250, 250);
      }

      // ripples
      p.stroke(255, 120);
      p.noFill();
      if (showSea) {
        drawSeaRipples(data.ripples);
      } else if (showRiver) {
        drawRiverRipples(data.ripples);
      } else {
        for (let i = 0; i < data.ripples; i++) {
          p.ellipse(p.width / 2, p.height / 2, 120 + i * 25);
        }
      }

      // deterministic random for scene details
      p.randomSeed(currentRender.seed);

      
      // moon
      if (data.moon) {
        p.noStroke();
        p.fill(235, 235, 220);
        const mx = p.random(p.width * 0.7, p.width * 0.9);
        const my = p.random(p.height * 0.08, p.height * 0.22);
        const ms = p.random(36, 52);
        p.circle(mx, my, ms);
      }

      // breeze (light streaks)
      if (data.breeze) {
        p.stroke(255, 120);
        const count = Math.floor(p.random(2, 4));
        for (let i = 0; i < count; i++) {
          const y = p.random(p.height * 0.12, p.height * 0.35);
          const x1 = p.random(p.width * 0.06, p.width * 0.25);
          const x2 = x1 + p.random(60, 120);
          p.line(x1, y, x2, y - p.random(4, 10));
          p.line(x1 + p.random(20, 50), y + p.random(4, 10), x2 + p.random(10, 40), y);
        }
      }

      // reeds
      if (data.reeds) {
        p.stroke(40, 70, 40);
        const leftCount = Math.floor(p.random(4, 7));
        for (let i = 0; i < leftCount; i++) {
          const x = p.random(20, 120);
          const y1 = p.height * 0.9;
          const y2 = p.random(p.height * 0.55, p.height * 0.7);
          p.line(x, y1, x + p.random(3, 8), y2);
        }
        const rightCount = Math.floor(p.random(4, 7));
        for (let i = 0; i < rightCount; i++) {
          const x = p.random(p.width - 120, p.width - 20);
          const y1 = p.height * 0.92;
          const y2 = p.random(p.height * 0.6, p.height * 0.75);
          p.line(x, y1, x - p.random(3, 8), y2);
        }
      }

      // rocks
      if (data.rocks) {
        p.noStroke();
        p.fill(90);
        const rockCount = Math.floor(p.random(2, 4));
        for (let i = 0; i < rockCount; i++) {
          const x = p.random(p.width * 0.1, p.width * 0.3);
          const y = p.random(p.height * 0.7, p.height * 0.82);
          p.ellipse(x, y, p.random(16, 30), p.random(12, 22));
        }
        const rockCountRight = Math.floor(p.random(1, 3));
        for (let i = 0; i < rockCountRight; i++) {
          const x = p.random(p.width * 0.7, p.width * 0.9);
          const y = p.random(p.height * 0.7, p.height * 0.82);
          p.ellipse(x, y, p.random(18, 32), p.random(12, 22));
        }
      }

      // lotus
      if (data.lotus) {
        p.noStroke();
        const lx = p.random(p.width * 0.35, p.width * 0.65);
        const ly = p.random(p.height * 0.45, p.height * 0.6);
        p.fill(215, 150, 170);
        p.ellipse(lx - 6, ly + 4, 18, 12);
        p.ellipse(lx + 6, ly, 18, 12);
        p.ellipse(lx, ly - 8, 18, 12);
        p.fill(80, 120, 80);
        p.ellipse(lx + 10, ly + 12, 26, 16);
      }
      

      // frogs (deterministic)
      p.noStroke();
      p.fill(40);
      const frogSize = data.frogSize === "small" ? 6 : data.frogSize === "large" ? 14 : 10;
      for (let i = 0; i < data.frogs; i++) {
        p.ellipse(
          p.random(p.width / 2 - 80, p.width / 2 + 80),
          p.random(p.height / 2 - 80, p.height / 2 + 80),
          frogSize,
          frogSize
        );
      }
    };
  };

  window.__p5_instance = new p5(sketch);
}

function renderStaticThumbnail(containerEl, rules, seed, size = 220) {
  // Simple: create a p5 canvas once-off via pure canvas drawing would be nicer,
  // but easiest is to generate an <img> from a temp p5 instance.
  // For prototype speed: we’ll just reuse the main rules in a tiny canvas renderer via Canvas2D.
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  const showSea = !!rules.sea;
  const showRiver = !showSea && !!rules.river;
  const showPond = !showSea && !showRiver && (rules.pond || true);
  const riverCenterY = (x) => {
    return size * (0.32 + 0.18 * Math.sin((x / size) * Math.PI * 1.2));
  };

  // background
  if (rules.night) ctx.fillStyle = "rgb(30,40,80)";
  else if (rules.cold) ctx.fillStyle = "rgb(190,210,230)";
  else if (rules.sunset) ctx.fillStyle = "rgb(226,190,123)";
  else ctx.fillStyle = "rgb(170,190,160)";
  ctx.fillRect(0, 0, size, size);

  // river or pond
  ctx.fillStyle = "rgb(100,130,150)";
  if (showSea) {
    ctx.fillRect(-10, size * 0.45, size + 20, size * 0.55);
  } else if (showRiver) {
    const width = size * 0.26;
    ctx.beginPath();
    for (let x = -30; x <= size + 30; x += 16) {
      const y = riverCenterY(x) - width / 2;
      if (x === -30) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    for (let x = size + 30; x >= -30; x -= 16) {
      const y = riverCenterY(x) + width / 2;
      ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
  } else if (showPond) {
    ctx.beginPath();
    ctx.ellipse(size/2, size/2, (250/400)*(size/2), (250/400)*(size/2), 0, 0, Math.PI*2);
    ctx.fill();
  }

  // ripples
  ctx.strokeStyle = "rgba(255,255,255,0.45)";
  if (showSea) {
    for (let i = 0; i < rules.ripples; i++) {
      const y = size * 0.55 + i * 10;
      ctx.beginPath();
      for (let x = -20; x <= size + 20; x += 16) {
        const wave = Math.sin((x + i * 22) * 0.05) * 3;
        if (x === -20) ctx.moveTo(x, y + wave);
        else ctx.lineTo(x, y + wave);
      }
      ctx.stroke();
    }
  } else if (showRiver) {
    for (let i = 0; i < rules.ripples; i++) {
      const offset = (i + 1) * 9;
      ctx.beginPath();
      for (let x = -20; x <= size + 20; x += 16) {
        const baseY = riverCenterY(x);
        const wave = Math.sin((x + i * 20) * 0.06) * 3;
        if (x === -20) ctx.moveTo(x, baseY + offset + wave);
        else ctx.lineTo(x, baseY + offset + wave);
      }
      ctx.stroke();
    }
  } else {
    for (let i = 0; i < rules.ripples; i++) {
      const d = (120 + i*25) * (size/400);
      ctx.beginPath();
      ctx.ellipse(size/2, size/2, d/2, d/2, 0, 0, Math.PI*2);
      ctx.stroke();
    }
  }

  // deterministic RNG (simple LCG)
  let s = seed >>> 0;
  const rand = () => (s = (1664525 * s + 1013904223) >>> 0) / 4294967296;
  
  const randRange = (min, max) => min + rand() * (max - min);

  // moon
  if (rules.moon) {
    ctx.fillStyle = "rgb(235,235,220)";
    const mx = randRange(size * 0.7, size * 0.9);
    const my = randRange(size * 0.08, size * 0.22);
    const ms = randRange(18, 26);
    ctx.beginPath();
    ctx.ellipse(mx, my, ms, ms, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // breeze
  if (rules.breeze) {
    ctx.strokeStyle = "rgba(255,255,255,0.55)";
    const count = Math.floor(randRange(2, 4));
    for (let i = 0; i < count; i++) {
      const y = randRange(size * 0.12, size * 0.35);
      const x1 = randRange(size * 0.06, size * 0.25);
      const x2 = x1 + randRange(35, 70);
      ctx.beginPath();
      ctx.moveTo(x1, y);
      ctx.lineTo(x2, y - randRange(2, 6));
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x1 + randRange(12, 28), y + randRange(2, 6));
      ctx.lineTo(x2 + randRange(6, 20), y);
      ctx.stroke();
    }
  }

  // reeds
  if (rules.reeds) {
    ctx.strokeStyle = "rgb(40,70,40)";
    const leftCount = Math.floor(randRange(4, 7));
    for (let i = 0; i < leftCount; i++) {
      const x = randRange(20, 120);
      const y1 = size * 0.9;
      const y2 = randRange(size * 0.55, size * 0.7);
      ctx.beginPath();
      ctx.moveTo(x, y1);
      ctx.lineTo(x + randRange(3, 8), y2);
      ctx.stroke();
    }
    const rightCount = Math.floor(randRange(4, 7));
    for (let i = 0; i < rightCount; i++) {
      const x = randRange(size - 120, size - 20);
      const y1 = size * 0.92;
      const y2 = randRange(size * 0.6, size * 0.75);
      ctx.beginPath();
      ctx.moveTo(x, y1);
      ctx.lineTo(x - randRange(3, 8), y2);
      ctx.stroke();
    }
  }

  // rocks
  if (rules.rocks) {
    ctx.fillStyle = "rgb(90,90,90)";
    const rockCount = Math.floor(randRange(2, 4));
    for (let i = 0; i < rockCount; i++) {
      const x = randRange(size * 0.1, size * 0.3);
      const y = randRange(size * 0.7, size * 0.82);
      ctx.beginPath();
      ctx.ellipse(x, y, randRange(8, 15), randRange(6, 11), 0, 0, Math.PI * 2);
      ctx.fill();
    }
    const rockCountRight = Math.floor(randRange(1, 3));
    for (let i = 0; i < rockCountRight; i++) {
      const x = randRange(size * 0.7, size * 0.9);
      const y = randRange(size * 0.7, size * 0.82);
      ctx.beginPath();
      ctx.ellipse(x, y, randRange(9, 16), randRange(6, 11), 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // lotus
  if (rules.lotus) {
    const lx = randRange(size * 0.35, size * 0.65);
    const ly = randRange(size * 0.45, size * 0.6);
    ctx.fillStyle = "rgb(215,150,170)";
    ctx.beginPath();
    ctx.ellipse(lx - 4, ly + 3, 9, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(lx + 4, ly, 9, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(lx, ly - 6, 9, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgb(80,120,80)";
    ctx.beginPath();
    ctx.ellipse(lx + 7, ly + 9, 13, 8, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  

  // frogs
  ctx.fillStyle = "rgb(40,40,40)";
  const frogSize = rules.frogSize === "small" ? 4 : rules.frogSize === "large" ? 8 : 5;
  for (let i = 0; i < rules.frogs; i++) {
    const x = (size/2 - 80*(size/400)) + rand() * (160*(size/400));
    const y = (size/2 - 80*(size/400)) + rand() * (160*(size/400));
    ctx.beginPath();
    ctx.ellipse(x, y, frogSize*(size/400), frogSize*(size/400), 0, 0, Math.PI*2);
    ctx.fill();
  }

  containerEl.innerHTML = "";
  containerEl.appendChild(canvas);
}
