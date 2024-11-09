class WallpaperGenerator {
    constructor() {
        this.uploadZone = document.getElementById('upload-zone');
        this.fileInput = document.getElementById('file-input');
        this.preview = document.getElementById('wallpaper-preview');
        this.generateBtn = document.getElementById('generate-btn');
        this.downloadBtn = document.getElementById('download-btn');
        
        this.uploadedImages = [];
        
        // Add new control elements
        this.layoutSelect = document.getElementById('layout-select');
        this.frameColor = document.getElementById('frame-color');
        this.frameStyle = document.getElementById('frame-style');
        
        this.currentLayout = 'grid';
        this.currentFrameColor = '#ffffff';
        this.currentFrameStyle = 'classic';
        
        // Add new controls
        this.borderWidth = document.getElementById('border-width');
        this.backgroundColor = document.getElementById('background-color');
        this.backgroundImage = document.getElementById('background-image');
        
        this.currentBorderWidth = '8px';
        this.currentBackgroundColor = '#ffffff';
        this.currentBackgroundImage = null;
        
        // Add drag state tracking
        this.draggedImage = null;
        this.draggedElement = null;
        
        // Create and maintain a single canvas instance
        this.canvas = document.createElement('canvas');
        this.canvas.width = 1920;
        this.canvas.height = 1080;
        this.ctx = this.canvas.getContext('2d');
        
        // Add canvas to preview initially
        this.preview.appendChild(this.canvas);
        this.canvas.style.maxWidth = '100%';
        this.canvas.style.height = 'auto';

        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // File input change
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));

        // Drag and drop
        this.uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.uploadZone.classList.add('drag-over');
        });

        this.uploadZone.addEventListener('dragleave', () => {
            this.uploadZone.classList.remove('drag-over');
        });

        this.uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            this.uploadZone.classList.remove('drag-over');
            const files = e.dataTransfer.files;
            this.handleFiles(files);
        });

        // Generate and Download buttons
        this.generateBtn.addEventListener('click', () => this.generateWallpaper());
        this.downloadBtn.addEventListener('click', () => this.downloadWallpaper());

        // Control listeners
        this.layoutSelect.addEventListener('change', (e) => {
            this.currentLayout = e.target.value;
            this.updateCanvas();
        });

        this.frameColor.addEventListener('input', (e) => {
            this.currentFrameColor = e.target.value;
            this.updateCanvas();
        });

        this.frameStyle.addEventListener('change', (e) => {
            this.currentFrameStyle = e.target.value;
            this.updateCanvas();
        });

        // Add new control listeners
        this.borderWidth.addEventListener('input', (e) => {
            this.currentBorderWidth = `${e.target.value}px`;
            this.updateCanvas();
        });

        this.backgroundColor.addEventListener('input', (e) => {
            this.currentBackgroundColor = e.target.value;
            this.updateCanvas();
        });

        this.backgroundImage.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.currentBackgroundImage = e.target.result;
                    this.updateCanvas();
                };
                reader.readAsDataURL(file);
            }
        });
    }

    handleFileSelect(event) {
        const files = event.target.files;
        this.handleFiles(files);
    }

    handleFiles(files) {
        Array.from(files).forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.uploadedImages.push(e.target.result);
                    this.updateCanvas();
                };
                reader.readAsDataURL(file);
            }
        });
    }

    updateCanvas() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw background
        this.ctx.fillStyle = this.currentBackgroundColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.currentBackgroundImage) {
            const bgImg = new Image();
            bgImg.onload = () => {
                // Draw background with effects
                this.ctx.globalAlpha = 0.15;
                this.ctx.filter = 'blur(3px)';
                
                const pattern = this.ctx.createPattern(bgImg, 'repeat');
                this.ctx.fillStyle = pattern;
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                
                // Add gradient overlay
                const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
                gradient.addColorStop(0, 'rgba(0,0,0,0.2)');
                gradient.addColorStop(0.5, 'rgba(0,0,0,0)');
                gradient.addColorStop(1, 'rgba(0,0,0,0.3)');
                this.ctx.fillStyle = gradient;
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                
                // Reset for image drawing
                this.ctx.globalAlpha = 1;
                this.ctx.filter = 'none';
                
                this.drawImages();
            };
            bgImg.src = this.currentBackgroundImage;
        } else {
            this.drawImages();
        }
    }

    drawImages() {
        if (this.uploadedImages.length === 0) return;

        // Calculate grid layout
        const totalImages = this.uploadedImages.length;
        let rows, cols;
        if (totalImages <= 3) {
            rows = 1;
            cols = totalImages;
        } else if (totalImages <= 6) {
            rows = 2;
            cols = Math.ceil(totalImages / 2);
        } else if (totalImages <= 9) {
            rows = 3;
            cols = 3;
        } else {
            rows = Math.ceil(Math.sqrt(totalImages));
            cols = Math.ceil(totalImages / rows);
        }

        const spacing = 20; // Increased spacing
        const padding = 40; // Added padding from edges
        const cellWidth = (this.canvas.width - (2 * padding) - (spacing * (cols - 1))) / cols;
        const cellHeight = (this.canvas.height - (2 * padding) - (spacing * (rows - 1))) / rows;
        const frameWidth = parseInt(this.currentBorderWidth);

        // Load and draw all images
        this.uploadedImages.forEach((src, index) => {
            const img = new Image();
            img.onload = () => {
                const row = Math.floor(index / cols);
                const col = index % cols;
                
                const x = padding + (col * (cellWidth + spacing));
                const y = padding + (row * (cellHeight + spacing));
                
                // Draw frame
                this.ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
                this.ctx.shadowBlur = 25;
                this.ctx.shadowOffsetX = 0;
                this.ctx.shadowOffsetY = 8;
                
                // Frame gradient
                const frameGradient = this.ctx.createLinearGradient(x, y, x, y + cellHeight);
                frameGradient.addColorStop(0, this.adjustColor(this.currentFrameColor, 20));
                frameGradient.addColorStop(1, this.adjustColor(this.currentFrameColor, -20));
                this.ctx.fillStyle = frameGradient;
                
                // Draw rounded frame
                this.roundRect(this.ctx, x, y, cellWidth, cellHeight, 12);
                
                // Reset shadow
                this.ctx.shadowColor = 'transparent';
                
                // Calculate image dimensions while maintaining aspect ratio
                const imgRatio = img.width / img.height;
                const frameRatio = cellWidth / cellHeight;
                let drawWidth, drawHeight, imgX, imgY;
                
                // Calculate dimensions to fit inside frame while maintaining aspect ratio
                const availableWidth = cellWidth - (frameWidth * 2);
                const availableHeight = cellHeight - (frameWidth * 2);
                
                if (imgRatio > frameRatio) {
                    // Image is wider than frame
                    drawWidth = availableWidth;
                    drawHeight = drawWidth / imgRatio;
                    imgX = x + frameWidth;
                    imgY = y + frameWidth + (availableHeight - drawHeight) / 2;
                } else {
                    // Image is taller than frame
                    drawHeight = availableHeight;
                    drawWidth = drawHeight * imgRatio;
                    imgX = x + frameWidth + (availableWidth - drawWidth) / 2;
                    imgY = y + frameWidth;
                }
                
                // Draw image with clipping
                this.ctx.save();
                this.ctx.beginPath();
                this.roundRect(this.ctx, x + frameWidth, y + frameWidth, 
                             cellWidth - (frameWidth * 2), 
                             cellHeight - (frameWidth * 2), 8);
                this.ctx.clip();
                this.ctx.drawImage(img, imgX, imgY, drawWidth, drawHeight);
                
                // Add vignette effect
                const vignette = this.ctx.createRadialGradient(
                    imgX + drawWidth/2, imgY + drawHeight/2, 0,
                    imgX + drawWidth/2, imgY + drawHeight/2, drawWidth/1.5
                );
                vignette.addColorStop(0, 'rgba(0,0,0,0)');
                vignette.addColorStop(1, 'rgba(0,0,0,0.25)');
                this.ctx.fillStyle = vignette;
                this.ctx.fill();
                this.ctx.restore();
            };
            img.src = src;
        });
    }

    // Helper method for rounded rectangles
    roundRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.fill();
    }

    // Helper method to adjust color brightness
    adjustColor(color, amount) {
        const hex = color.replace('#', '');
        const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount));
        const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount));
        const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount));
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }

    downloadWallpaper() {
        const canvas = this.preview.querySelector('canvas');
        if (!canvas) {
            alert('Please generate a wallpaper first!');
            return;
        }

        const link = document.createElement('a');
        link.download = 'wallpaper.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new WallpaperGenerator();
});
