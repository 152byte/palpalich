// ==========================================
// АНИМИРОВАННЫЙ ФОН
// ==========================================
const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');

let particles = [];
let mouse = { x: null, y: null, radius: 150 };

const config = {
    particleCount: 300,
    particleColor: 'rgba(255, 60, 60, 0.5)',
    lineColor: '255, 60, 60',
    maxDistance: 120,
    speed: 0.3
};

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1;
        this.speedX = (Math.random() - 0.5) * config.speed;
        this.speedY = (Math.random() - 0.5) * config.speed;
        this.opacity = Math.random() * 0.5 + 0.2;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;

        if (mouse.x !== null && mouse.y !== null) {
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < mouse.radius) {
                const force = (mouse.radius - distance) / mouse.radius;
                const angle = Math.atan2(dy, dx);
                this.x -= Math.cos(angle) * force * 2;
                this.y -= Math.sin(angle) * force * 2;
            }
        }
    }

    draw() {
        ctx.fillStyle = config.particleColor;
        ctx.globalAlpha = this.opacity;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

function initParticles() {
    particles = [];
    const count = Math.min(config.particleCount, Math.floor((canvas.width * canvas.height) / 15000));
    for (let i = 0; i < count; i++) {
        particles.push(new Particle());
    }
}

function connectParticles() {
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < config.maxDistance) {
                const opacity = (1 - distance / config.maxDistance) * 0.15;
                ctx.strokeStyle = `rgba(${config.lineColor}, ${opacity})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }

        if (mouse.x !== null && mouse.y !== null) {
            const dx = particles[i].x - mouse.x;
            const dy = particles[i].y - mouse.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < mouse.radius) {
                const opacity = (1 - distance / mouse.radius) * 0.3;
                ctx.strokeStyle = `rgba(${config.lineColor}, ${opacity})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(mouse.x, mouse.y);
                ctx.stroke();
            }
        }
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    connectParticles();
    requestAnimationFrame(animate);
}

window.addEventListener('mousemove', (e) => { mouse.x = e.x; mouse.y = e.y; });
window.addEventListener('mouseout', () => { mouse.x = null; mouse.y = null; });
window.addEventListener('resize', () => { resizeCanvas(); initParticles(); });

resizeCanvas();
initParticles();
animate();

// ==========================================
// МОБИЛЬНОЕ МЕНЮ
// ==========================================
const burger = document.querySelector('.burger');
const navLinks = document.querySelector('.nav-links');

burger.addEventListener('click', () => {
    burger.classList.toggle('open');
    navLinks.classList.toggle('open');
});

document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        burger.classList.remove('open');
        navLinks.classList.remove('open');
    });
});

const nav = document.querySelector('.nav');
window.addEventListener('scroll', () => {
    nav.style.background = window.scrollY > 50 
        ? 'rgba(10, 10, 10, 0.95)' 
        : 'rgba(10, 10, 10, 0.6)';
});

// ==========================================
// ЭМОДЗИ
// ==========================================
function parseEmoji(element) {
    if (typeof twemoji !== 'undefined') {
        twemoji.parse(element || document.body);
    }
}

// ==========================================
// СЛАЙДЕР 
// ==========================================
function loadComparison() {
    const grid = document.getElementById('comparisonGrid');
    const data = typeof PORTFOLIO_VIDEOS !== 'undefined' ? PORTFOLIO_VIDEOS : {};
    const pairs = data.comparison || [];
    
    if (!grid) return;
    
    if (pairs.length === 0) {
        grid.innerHTML = `
            <div class="comparison-empty">
                🔄 Пока нет примеров До/После<br>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = pairs.map((pair, idx) => `
        <div class="comparison-item">
            <div class="compare" data-compare="${idx}">
                <video class="after" muted loop playsinline autoplay preload="auto">
                    <source src="${pair.after}" type="video/mp4">
                    <source src="${pair.after}" type="video/quicktime">
                </video>
                <video class="before" muted loop playsinline preload="metadata">
                    <source src="${pair.before}" type="video/mp4">
                    <source src="${pair.before}" type="video/quicktime">
                </video>
                <span class="label label-before">До</span>
                <span class="label label-after">После</span>
                <div class="handle"><div class="handle-circle">‹ ›</div></div>
            </div>
        </div>
    `).join('');
    
    document.querySelectorAll('.compare').forEach(compare => {
        const beforeVideo = compare.querySelector('.before');
        const afterVideo = compare.querySelector('.after');
        let dragging = false;
        
        afterVideo.addEventListener('play', () => {
            beforeVideo.play().catch(() => {});
        });
        
        function setPos(clientX) {
            const rect = compare.getBoundingClientRect();
            let p = ((clientX - rect.left) / rect.width) * 100;
            p = Math.max(0, Math.min(100, p));
            compare.style.setProperty('--pos', p + '%');
        }
        
        compare.addEventListener('pointerdown', e => {
            dragging = true;
            compare.setPointerCapture(e.pointerId);
            setPos(e.clientX);
        });
        compare.addEventListener('pointermove', e => {
            if (dragging) setPos(e.clientX);
        });
        compare.addEventListener('pointerup', () => dragging = false);
        compare.addEventListener('pointercancel', () => dragging = false);
        
        afterVideo.addEventListener('timeupdate', () => {
            beforeVideo.currentTime = afterVideo.currentTime;
        });
    });
    
    parseEmoji();
}

// ==========================================
// ПОРТФОЛИО
// ==========================================
function loadPortfolio() {
    const data = typeof PORTFOLIO_VIDEOS !== 'undefined' ? PORTFOLIO_VIDEOS : {};
    const categories = ['experts', 'motion', 'vlog', 'gaming'];
    
    categories.forEach(categoryKey => {
        const category = data[categoryKey];
        const grid = document.querySelector(`[data-grid="${categoryKey}"]`);
        const countEl = document.querySelector(`[data-count="${categoryKey}"]`);
        const section = document.getElementById(`category-${categoryKey}`);
        
        if (!grid) return;
        
        const videos = category?.videos || [];
        
        if (countEl) {
            countEl.textContent = videos.length > 0 ? `${videos.length} видео` : '';
        }
        
        if (videos.length === 0) {
            if (section) section.style.display = 'none';
            return;
        }
        
        const isVertical = category?.orientation === 'vertical';
        
        grid.innerHTML = videos.map(video => `
            <div class="${isVertical ? 'reel-card' : 'gaming-card'}" 
                 data-src="${video.src}" 
                 data-orientation="${category.orientation}">
                <video muted preload="metadata">
                    <source src="${video.src}" type="video/mp4">
                    <source src="${video.src}" type="video/quicktime">
                </video>
                <div class="${isVertical ? 'reel-card-overlay' : 'gaming-card-overlay'}">
                    <div class="${isVertical ? 'reel-play' : 'gaming-play'}">▶</div>
                </div>
                <div class="${isVertical ? 'reel-name' : 'gaming-name'}">${video.name}</div>
            </div>
        `).join('');
        
        grid.querySelectorAll('[data-src]').forEach(card => {
            card.addEventListener('click', () => {
                openModal(card.dataset.src, card.dataset.orientation);
            });
            
            const video = card.querySelector('video');
            card.addEventListener('mouseenter', () => video.play().catch(() => {}));
            card.addEventListener('mouseleave', () => {
                video.pause();
                video.currentTime = 0;
            });
        });
    });
    
    parseEmoji();
}
// ==========================================
// МОДАЛКА
// ==========================================
const modal = document.getElementById('videoModal');
const modalVideo = modal.querySelector('.modal-video');
const modalClose = modal.querySelector('.modal-close');
const modalContent = modal.querySelector('.modal-content');

function openModal(src, orientation = 'horizontal') {
    modalVideo.src = src;
    modalVideo.muted = false;
    
    if (orientation === 'vertical') {
        modalContent.classList.add('vertical');
    } else {
        modalContent.classList.remove('vertical');
    }
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    modal.classList.remove('active');
    modalVideo.pause();
    modalVideo.src = '';
    document.body.style.overflow = '';
}

modalClose.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

// ==========================================
// SCROLL АНИМАЦИИ
// ==========================================
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.section-header, .about-text, .principle, .contact-wrapper, .portfolio-category').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
    observer.observe(el);
});

// ==========================================
// ИНИЦИАЛИЗАЦИЯ
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    loadPortfolio();
    loadComparison();
    parseEmoji();
});