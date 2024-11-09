class WallpaperGenerator {
    constructor() {
        // Initialize properties
        this.uploadedImages = [];
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.hasGeneratedWallpaper = false;
        this.backgroundImageData = null;

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

        console.log('Generating wallpaper with', this.uploadedImages.length, 'images'); // Debug log

        // Set canvas size for 4K resolution
        this.canvas.width = 3840;
        this.canvas.height = 2160;

        // Draw background
        this.drawBackground();

        // Generate layout based on selected option
        const layout = this.layoutSelect ? this.layoutSelect.value : 'grid';
        switch (layout) {
            case 'grid':
                this.generateGridLayout();
                break;
            case 'masonry':
                this.generateMasonryLayout();
                break;
            case 'random':
                this.generateRandomLayout();
                break;
            default:
                this.generateGridLayout();
        }

        this.hasGeneratedWallpaper = true;
        if (this.downloadBtn) {
            this.downloadBtn.disabled = false;
        }
        this.showWallpaperPreview();
    }

    generateGridLayout() {
        console.log('Generating grid layout');
        
        const padding = 40; // Increased padding for better spacing
        const images = [...this.uploadedImages];
        
        // Fixed grid dimensions: 4x3 grid
        const rows = 3;
        const cols = 4;

        const cellWidth = (this.canvas.width - (padding * (cols + 1))) / cols;
        const cellHeight = (this.canvas.height - (padding * (rows + 1))) / rows;

        console.log(`Grid dimensions: ${cols}x${rows}, Cell size: ${cellWidth}x${cellHeight}`);

        // Draw each image
        images.forEach((img, index) => {
            if (index < rows * cols) { // Limit to 12 images
                const row = Math.floor(index / cols);
                const col = index % cols;
                
                const x = padding + (col * (cellWidth + padding));
                const y = padding + (row * (cellHeight + padding));

                console.log(`Drawing image ${index} at ${x},${y}`);

                // Draw the image
                this.drawImageInCell(img, x, y, cellWidth, cellHeight);
            }
        });
    }

    generateMasonryLayout() {
        const padding = 40;
        const images = [...this.uploadedImages];
        const cols = 4;
        
        // Calculate initial column widths
        const colWidth = (this.canvas.width - (padding * (cols + 1))) / cols;
        let colHeights = new Array(cols).fill(padding);
        
        images.forEach((img, index) => {
            // Find shortest column
            const shortestCol = colHeights.indexOf(Math.min(...colHeights));
            
            // Calculate image height maintaining aspect ratio
            const imgRatio = img.height / img.width;
            const height = colWidth * imgRatio;
            
            // Draw image
            const x = padding + (shortestCol * (colWidth + padding));
            const y = colHeights[shortestCol];
            
            this.drawImageInCell(img, x, y, colWidth, height);
            
            // Update column height
            colHeights[shortestCol] += height + padding;
        });
    }

    generateRandomLayout() {
        const padding = 40;
        const minDistance = 100; // Minimum distance between images
        const images = [...this.uploadedImages];
        const placedImages = []; // Keep track of placed images
        
        images.forEach((img) => {
            let attempts = 0;
            let validPosition = false;
            let x, y, width, height;
            
            // Try to find a valid position up to 50 attempts
            while (!validPosition && attempts < 50) {
                // Random size between 300 and 600 pixels
                width = Math.random() * 300 + 300;
                height = width * (img.height / img.width);
                
                // Random position (avoiding edges)
                x = padding + Math.random() * (this.canvas.width - width - padding * 2);
                y = padding + Math.random() * (this.canvas.height - height - padding * 2);
                
                // Check distance from all other images
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
                // Store the placed image information
                placedImages.push({ x, y, width, height });
                
                // Random rotation (reduced from -10/10 to -5/5 degrees for subtlety)
                this.ctx.save();
                this.ctx.translate(x + width/2, y + height/2);
                this.ctx.rotate((Math.random() * 10 - 5) * Math.PI / 180);
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
}

// Initialize the wallpaper generator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new WallpaperGenerator();
});
