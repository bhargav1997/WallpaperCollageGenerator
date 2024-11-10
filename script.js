class WallpaperGenerator {
    constructor() {
        // Initialize properties
        this.uploadedImages = [];
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.hasGeneratedWallpaper = false;
        this.backgroundImageData = null;

        // Add to existing properties
        this.resolutions = {
            desktop: { width: 3840, height: 2160 },
            mobile: { width: 1080, height: 1920 }
        };

        // Initialize elements and events after DOM is loaded
        this.initializeElements();
        this.initializeEvents();
    }

    initializeElements() {
        // Get upload elements
        this.uploadZone = document.getElementById('upload-zone');
        this.fileInput = document.getElementById('file-input');
        
        // Get buttons
        this.generateBtn = document.getElementById('generate-btn');
        this.downloadBtn = document.getElementById('download-btn');
        
        // Get background controls
        this.backgroundColor = document.getElementById('background-color');
        this.backgroundImage = document.getElementById('background-image');
        this.clearBackgroundBtn = document.getElementById('clear-background');
        
        // Get layout controls
        this.layoutSelect = document.getElementById('layout-select');
        this.frameColor = document.getElementById('frame-color');
        this.frameStyle = document.getElementById('frame-style');
        this.borderWidth = document.getElementById('border-width');

        // Add to existing elements
        this.resolutionSelect = document.getElementById('resolution-select');

        // Set initial states
        if (this.downloadBtn) {
            this.downloadBtn.disabled = true;
        }
    }

    initializeEvents() {
        // Initialize background controls
        if (this.backgroundColor) {
            this.backgroundColor.addEventListener('input', () => {
                if (this.hasGeneratedWallpaper) {
                    this.generateWallpaper();
                }
            });
        }

        if (this.backgroundImage) {
            this.backgroundImage.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file && file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        const img = new Image();
                        img.onload = () => {
                            this.backgroundImageData = img;
                            if (this.hasGeneratedWallpaper) {
                                this.generateWallpaper();
                            }
                        };
                        img.src = event.target.result;
                    };
                    reader.readAsDataURL(file);
                }
            });
        }

        if (this.clearBackgroundBtn) {
            this.clearBackgroundBtn.addEventListener('click', () => {
                this.backgroundImageData = null;
                if (this.backgroundImage) {
                    this.backgroundImage.value = '';
                }
                if (this.hasGeneratedWallpaper) {
                    this.generateWallpaper();
                }
            });
        }

        // Initialize upload zone
        if (this.uploadZone && this.fileInput) {
            this.uploadZone.addEventListener('click', () => this.fileInput.click());
            this.fileInput.addEventListener('change', (e) => this.handleFiles(e.target.files));
            this.initializeDragAndDrop();
        }

        // Initialize buttons
        if (this.generateBtn) {
            this.generateBtn.addEventListener('click', () => this.generateWallpaper());
        }
        if (this.downloadBtn) {
            this.downloadBtn.addEventListener('click', () => this.downloadWallpaper());
        }
    }

    initializeDragAndDrop() {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            this.uploadZone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            this.uploadZone.addEventListener(eventName, () => {
                this.uploadZone.classList.add('drag-over');
            });
        });

        ['dragleave', 'drop'].forEach(eventName => {
            this.uploadZone.addEventListener(eventName, () => {
                this.uploadZone.classList.remove('drag-over');
            });
        });

        this.uploadZone.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            this.handleFiles(files);
        });
    }

    handleFiles(files) {
        Array.from(files).forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = new Image();
                    img.src = e.target.result;
                    img.onload = () => {
                        this.uploadedImages.push(img);
                        this.updatePreview();
                    };
                };
                reader.readAsDataURL(file);
            }
        });
    }

    drawBackground() {
        const ctx = this.ctx;
        const canvas = this.canvas;

        // Clear canvas first
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Fill with background color
        ctx.fillStyle = this.backgroundColor ? this.backgroundColor.value : '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw background image if exists
        if (this.backgroundImageData) {
            try {
                // Calculate dimensions to cover the entire canvas while maintaining aspect ratio
                const imgRatio = this.backgroundImageData.width / this.backgroundImageData.height;
                const canvasRatio = canvas.width / canvas.height;
                
                let width, height, x, y;
                
                if (imgRatio > canvasRatio) {
                    // Image is wider than canvas
                    height = canvas.height;
                    width = height * imgRatio;
                    x = (canvas.width - width) / 2;
                    y = 0;
                } else {
                    // Image is taller than canvas
                    width = canvas.width;
                    height = width / imgRatio;
                    x = 0;
                    y = (canvas.height - height) / 2;
                }

                ctx.save();
                ctx.globalAlpha = 0.15; // Make background more subtle
                ctx.drawImage(this.backgroundImageData, x, y, width, height);
                ctx.restore();
            } catch (error) {
                console.error('Error drawing background image:', error);
            }
        }
    }

    generateWallpaper() {
        if (this.uploadedImages.length === 0) {
            alert('Please upload some images first!');
            return;
        }

        const resolution = this.resolutionSelect ? 
            this.resolutionSelect.value : 'desktop';
        
        // Set canvas size based on selected resolution
        this.canvas.width = this.resolutions[resolution].width;
        this.canvas.height = this.resolutions[resolution].height;

        // Draw background
        this.drawBackground();

        // Generate layout based on selected option
        const layout = this.layoutSelect ? this.layoutSelect.value : 'grid';
        switch (layout) {
            case 'grid':
                this.generateGridLayout(resolution);
                break;
            case 'masonry':
                this.generateMasonryLayout(resolution);
                break;
            case 'random':
                this.generateRandomLayout(resolution);
                break;
            default:
                this.generateGridLayout(resolution);
        }

        this.hasGeneratedWallpaper = true;
        if (this.downloadBtn) {
            this.downloadBtn.disabled = false;
        }
        this.showWallpaperPreview();
    }

    generateGridLayout(resolution = 'desktop') {
        const isMobile = resolution === 'mobile';
        const padding = isMobile ? 30 : 60;
        const topMargin = isMobile ? this.canvas.height * 0.15 : this.canvas.height * 0.12;
        const images = [...this.uploadedImages];
        
        // Calculate optimal grid dimensions based on number of images
        let rows, cols;
        const imageCount = images.length;
        
        if (isMobile) {
            if (imageCount <= 2) {
                rows = 2; cols = 1;
            } else if (imageCount <= 4) {
                rows = 2; cols = 2;
            } else if (imageCount <= 6) {
                rows = 3; cols = 2;
            } else if (imageCount <= 8) {
                rows = 4; cols = 2;
            } else {
                rows = Math.ceil(imageCount / 2);
                cols = 2;
            }
        } else {
            if (imageCount <= 3) {
                rows = 1; cols = 3;
            } else if (imageCount <= 6) {
                rows = 2; cols = 3;
            } else if (imageCount <= 8) {
                rows = 2; cols = 4;
            } else if (imageCount <= 9) {
                rows = 3; cols = 3;
            } else if (imageCount <= 12) {
                rows = 3; cols = 4;
            } else {
                // Calculate optimal grid for more images
                cols = Math.ceil(Math.sqrt(imageCount));
                rows = Math.ceil(imageCount / cols);
            }
        }

        const cellWidth = (this.canvas.width - (padding * (cols + 1))) / cols;
        const cellHeight = (this.canvas.height - topMargin - (padding * (rows + 1))) / rows;

        // Calculate positions for all images
        const positions = images.map((img, index) => {
            const row = Math.floor(index / cols);
            const col = index % cols;
            
            // Smaller random offsets for better alignment
            const randomX = (Math.random() - 0.5) * padding * 0.3;
            const randomY = Math.random() * padding * 0.15;
            
            return {
                x: padding + (col * (cellWidth + padding)) + randomX,
                y: topMargin + (row * (cellHeight + padding)) + randomY,
                rotation: (Math.random() - 0.5) * 2, // Reduced rotation
                img: img
            };
        });

        // Sort by Y position for proper layering
        positions.sort((a, b) => a.y - b.y);

        // Draw each image
        positions.forEach(pos => {
            const borderRadius = Math.min(cellWidth, cellHeight) * 0.1;
            const shadowBlur = padding * 0.4;
            const borderWidth = this.borderWidth ? parseInt(this.borderWidth.value) : 8;
            const frameColor = this.frameColor ? 
                this.adjustFrameOpacity(this.frameColor.value, 0.85) : 
                'rgba(255, 255, 255, 0.85)';

            this.ctx.save();
            
            // Apply subtle rotation
            this.ctx.translate(pos.x + cellWidth/2, pos.y + cellHeight/2);
            this.ctx.rotate(pos.rotation * Math.PI / 180);
            this.ctx.translate(-(pos.x + cellWidth/2), -(pos.y + cellHeight/2));

            // Add shadow
            this.ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
            this.ctx.shadowBlur = shadowBlur;
            this.ctx.shadowOffsetX = 0;
            this.ctx.shadowOffsetY = shadowBlur * 0.3;

            // Draw frame
            this.ctx.fillStyle = frameColor;
            this.roundRect(
                this.ctx,
                pos.x - borderWidth,
                pos.y - borderWidth,
                cellWidth + borderWidth * 2,
                cellHeight + borderWidth * 2,
                borderRadius + borderWidth
            );
            this.ctx.fill();

            this.ctx.shadowColor = 'transparent';
            
            // Clip for image
            this.ctx.beginPath();
            this.roundRect(this.ctx, pos.x, pos.y, cellWidth, cellHeight, borderRadius);
            this.ctx.clip();

            // Calculate image dimensions with top alignment
            const imgRatio = pos.img.height / pos.img.width;
            const cellRatio = cellHeight / cellWidth;
            let drawWidth, drawHeight, drawX, drawY;

            if (imgRatio > cellRatio) {
                // Portrait image - maintain top alignment
                drawWidth = cellWidth;
                drawHeight = drawWidth * imgRatio;
                drawX = pos.x;
                drawY = pos.y;
            } else {
                // Landscape image - center horizontally, align to top
                drawHeight = cellHeight;
                drawWidth = drawHeight / imgRatio;
                drawX = pos.x + (cellWidth - drawWidth) / 2;
                drawY = pos.y;
            }

            // Draw image
            this.ctx.drawImage(
                pos.img,
                drawX,
                drawY,
                drawWidth,
                drawHeight
            );

            // Add subtle vignette
            const gradient = this.ctx.createRadialGradient(
                pos.x + cellWidth/2, pos.y + cellHeight/2, 0,
                pos.x + cellWidth/2, pos.y + cellHeight/2, cellWidth * 0.8
            );
            gradient.addColorStop(0, 'rgba(0,0,0,0)');
            gradient.addColorStop(1, 'rgba(0,0,0,0.12)');
            this.ctx.fillStyle = gradient;
            this.ctx.fill();

            this.ctx.restore();
        });
    }

    generateMasonryLayout(resolution = 'desktop') {
        const padding = resolution === 'mobile' ? 20 : 40;
        const images = [...this.uploadedImages];
        const cols = resolution === 'mobile' ? 2 : 4;
        
        const colWidth = (this.canvas.width - (padding * (cols + 1))) / cols;
        let colHeights = new Array(cols).fill(padding);
        
        images.forEach((img) => {
            const shortestCol = colHeights.indexOf(Math.min(...colHeights));
            const imgRatio = img.height / img.width;
            const height = colWidth * imgRatio;
            
            const x = padding + (shortestCol * (colWidth + padding));
            const y = colHeights[shortestCol];
            
            this.drawImageInCell(img, x, y, colWidth, height);
            colHeights[shortestCol] += height + padding;
        });
    }

    generateRandomLayout(resolution = 'desktop') {
        const padding = resolution === 'mobile' ? 20 : 40;
        const minDistance = resolution === 'mobile' ? 50 : 100;
        const images = [...this.uploadedImages];
        const placedImages = [];
        
        const minSize = resolution === 'mobile' ? 150 : 300;
        const sizeRange = resolution === 'mobile' ? 150 : 300;
        
        images.forEach((img) => {
            let attempts = 0;
            let validPosition = false;
            let x, y, width, height;
            
            while (!validPosition && attempts < 50) {
                width = Math.random() * sizeRange + minSize;
                height = width * (img.height / img.width);
                
                x = padding + Math.random() * (this.canvas.width - width - padding * 2);
                y = padding + Math.random() * (this.canvas.height - height - padding * 2);
                
                validPosition = true;
                for (const placed of placedImages) {
                    const distance = Math.sqrt(
                        Math.pow((x + width/2) - (placed.x + placed.width/2), 2) +
                        Math.pow((y + height/2) - (placed.y + placed.height/2), 2)
                    );
                    
                    if (distance < Math.max(width, height) + minDistance) {
                        validPosition = false;
                        break;
                    }
                }
                
                attempts++;
            }
            
            if (validPosition) {
                placedImages.push({ x, y, width, height });
                
                this.ctx.save();
                this.ctx.translate(x + width/2, y + height/2);
                this.ctx.rotate((Math.random() * 6 - 3) * Math.PI / 180);
                this.ctx.translate(-(x + width/2), -(y + height/2));
                
                this.drawImageInCell(img, x, y, width, height);
                this.ctx.restore();
            }
        });
    }

    drawImageInCell(img, x, y, cellWidth, cellHeight) {
        const ctx = this.ctx;
        const borderRadius = 8;
        const borderWidth = parseInt(this.borderWidth ? this.borderWidth.value : 1);

        try {
            // Calculate image dimensions to maintain aspect ratio
            const imgRatio = img.height / img.width;
            const cellRatio = cellHeight / cellWidth;
            
            let drawWidth = cellWidth - (borderWidth * 2);
            let drawHeight = cellHeight - (borderWidth * 2);
            let drawX = x + borderWidth;
            let drawY = y + borderWidth;

            if (imgRatio > cellRatio) {
                // Image is taller
                drawWidth = drawHeight / imgRatio;
                drawX = x + ((cellWidth - drawWidth) / 2);
            } else {
                // Image is wider
                drawHeight = drawWidth * imgRatio;
                drawY = y + ((cellHeight - drawHeight) / 2);
            }

            // Draw the image
            ctx.save();
            
            // Create clipping path for rounded corners
            ctx.beginPath();
            ctx.moveTo(x + borderRadius, y);
            ctx.lineTo(x + cellWidth - borderRadius, y);
            ctx.quadraticCurveTo(x + cellWidth, y, x + cellWidth, y + borderRadius);
            ctx.lineTo(x + cellWidth, y + cellHeight - borderRadius);
            ctx.quadraticCurveTo(x + cellWidth, y + cellHeight, x + cellWidth - borderRadius, y + cellHeight);
            ctx.lineTo(x + borderRadius, y + cellHeight);
            ctx.quadraticCurveTo(x, y + cellHeight, x, y + cellHeight - borderRadius);
            ctx.lineTo(x, y + borderRadius);
            ctx.quadraticCurveTo(x, y, x + borderRadius, y);
            ctx.closePath();
            ctx.clip();

            // Draw the actual image
            ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

            // Draw border if needed
            if (borderWidth > 0) {
                ctx.strokeStyle = this.frameColor ? this.frameColor.value : '#e0e0e0';
                ctx.lineWidth = borderWidth;
                ctx.stroke();
            }

            ctx.restore();

        } catch (error) {
            console.error('Error drawing image:', error, img);
        }
    }

    roundRect(ctx, x, y, width, height, radius) {
        if (width < 2 * radius) radius = width / 2;
        if (height < 2 * radius) radius = height / 2;
        
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.arcTo(x + width, y, x + width, y + height, radius);
        ctx.arcTo(x + width, y + height, x, y + height, radius);
        ctx.arcTo(x, y + height, x, y, radius);
        ctx.arcTo(x, y, x + width, y, radius);
        ctx.closePath();
        ctx.fill();
        return ctx;
    }

    updatePreview() {
        const preview = document.getElementById('wallpaper-preview');
        preview.innerHTML = ''; // Clear previous preview
        
        const previewContainer = document.createElement('div');
        previewContainer.className = 'preview-container';
        
        this.uploadedImages.forEach((img, index) => {
            const imgPreview = document.createElement('div');
            imgPreview.className = 'preview-image fade-in';
            imgPreview.style.animationDelay = `${index * 0.1}s`;
            
            const imgElement = document.createElement('img');
            imgElement.src = img.src;
            imgElement.alt = `Preview ${index + 1}`;
            
            // Add remove button
            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-image';
            removeBtn.innerHTML = '×';
            removeBtn.onclick = (e) => {
                e.stopPropagation();
                this.uploadedImages.splice(index, 1);
                this.updatePreview();
                this.hasGeneratedWallpaper = false;
                if (this.downloadBtn) {
                    this.downloadBtn.disabled = true;
                }
            };
            
            imgPreview.appendChild(imgElement);
            imgPreview.appendChild(removeBtn);
            previewContainer.appendChild(imgPreview);
        });
        
        preview.appendChild(previewContainer);
    }

    showWallpaperPreview() {
        const preview = document.getElementById('wallpaper-preview');
        if (!preview) {
            console.error('Preview element not found');
            return;
        }

        preview.innerHTML = '';
        
        const previewImg = document.createElement('img');
        previewImg.src = this.canvas.toDataURL('image/png');
        previewImg.className = 'wallpaper-preview-img';
        previewImg.style.width = '100%';
        previewImg.style.height = 'auto';
        previewImg.style.borderRadius = '8px';
        previewImg.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
        
        preview.appendChild(previewImg);
    }

    downloadWallpaper() {
        if (!this.hasGeneratedWallpaper) {
            alert('Please generate wallpaper first!');
            return;
        }

        const link = document.createElement('a');
        link.download = 'wallpaper.png';
        link.href = this.canvas.toDataURL('image/png');
        link.click();
    }

    // Helper function to adjust frame opacity
    adjustFrameOpacity(color, opacity) {
        const r = parseInt(color.substr(1,2), 16);
        const g = parseInt(color.substr(3,2), 16);
        const b = parseInt(color.substr(5,2), 16);
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
}

// Initialize the wallpaper generator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new WallpaperGenerator();
});
