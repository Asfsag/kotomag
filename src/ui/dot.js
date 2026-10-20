const d = document.getElementById('d');
window.dotApi.onDot((p) => { d.style.left = p.x + 'px'; d.style.top = p.y + 'px'; });
