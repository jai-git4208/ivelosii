// Script to hide "built with Spline" watermark on different screen sizes
document.addEventListener('DOMContentLoaded', function() {
    // Function to hide Spline watermark
    function hideSplineWatermark() {
        // Target watermark through its attributes
        // The watermark is typically in an anchor tag with specific styling
        
        // Method 1: Look for elements that might contain the watermark text
        const possibleWatermarks = Array.from(document.querySelectorAll('a'));
        const watermarks = possibleWatermarks.filter(element => 
            element.textContent.toLowerCase().includes('spline') || 
            (element.getAttribute('href') && element.getAttribute('href').includes('spline.design'))
        );
        
        // Method 2: Try to find by style characteristics (position fixed, bottom right)
        const allElements = document.querySelectorAll('*');
        allElements.forEach(el => {
            const style = window.getComputedStyle(el);
            if (style.position === 'fixed' && 
                (style.bottom === '0px' || parseInt(style.bottom) < 20) && 
                (style.right === '0px' || parseInt(style.right) < 20)) {
                
                // Check if it contains text or links related to Spline
                const text = el.textContent.toLowerCase();
                if (text.includes('spline') || text.includes('built with')) {
                    watermarks.push(el);
                }
            }
        });
        
        // Method 3: Target iframe if Spline is embedded that way
        const iframes = document.querySelectorAll('iframe');
        iframes.forEach(iframe => {
            try {
                // Try to access the iframe content if from same origin
                const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                const iframeWatermarks = iframeDoc.querySelectorAll('a[href*="spline.design"], a:contains("spline")');
                
                iframeWatermarks.forEach(mark => {
                    mark.style.display = 'none';
                });
            } catch (e) {
                // Cross-origin iframe, can't access directly
                console.log("Couldn't access iframe content due to same-origin policy");
            }
        });
        
        // Hide all found watermark elements
        watermarks.forEach(mark => {
            mark.style.display = 'none';
        });

        // For tablet screens (between 768px and 1300px)
        if (window.innerWidth <= 1300 && window.innerWidth > 768) {
            handleTabletWatermark();
        }
        
        // For mobile screens (below 768px)
        if (window.innerWidth <= 768) {
            handleMobileWatermark();
        }
    }
    
    // Handle tablet-specific watermark removal
    function handleTabletWatermark() {
        const canvasContainers = document.querySelectorAll('.globe-wrapper, .globe-3d');
        
        // For Spline specifically, target canvas elements
        const splineCanvas = document.querySelector('canvas[data-engine="three.js"]');
        if (splineCanvas) {
            // Find the parent container of the canvas
            const canvasParent = splineCanvas.parentElement;
            
            // Look for watermark links in this container
            const watermarkLinks = canvasParent.querySelectorAll('a');
            watermarkLinks.forEach(link => {
                if (link.textContent.toLowerCase().includes('spline') || 
                    (link.getAttribute('href') && link.getAttribute('href').includes('spline'))) {
                    link.style.display = 'none';
                }
            });
        }
        
        // Apply global CSS for tablet view
        applyWatermarkCSS();
        
        // Process all potential containers
        processCanvasContainers(canvasContainers);
    }
    
    // Handle mobile-specific watermark removal
    function handleMobileWatermark() {
        const canvasContainers = document.querySelectorAll('.globe-wrapper, .globe-3d');
        
        // For mobile, we need more aggressive hiding strategies
        // First, create stronger CSS selectors that target mobile layout
        const style = document.createElement('style');
        style.textContent = `
            @media (max-width: 768px) {
                /* Target fixed elements at bottom of screen */
                body > a[href*="spline"],
                body > div > a[href*="spline"],
                a[style*="position: fixed"],
                div[style*="position: fixed"][style*="bottom"] {
                    display: none !important;
                    opacity: 0 !important;
                    visibility: hidden !important;
                    pointer-events: none !important;
                    z-index: -9999 !important;
                }
            }
        `;
        document.head.appendChild(style);
        
        // Apply general watermark CSS
        applyWatermarkCSS();
        
        // Process all potential containers with more strict removal
        processCanvasContainers(canvasContainers, true);
    }
    
    // Common function to apply watermark CSS
    function applyWatermarkCSS() {
        const style = document.createElement('style');
        style.textContent = `
            #canvas-container a[href*="spline"],
            canvas[data-engine] + a,
            canvas[data-engine] ~ div:last-child,
            canvas[data-engine] ~ a:last-child,
            canvas + a[href*="spline"],
            .spline-watermark,
            [data-spline-watermark],
            a[aria-label*="spline"],
            a[href*="spline.design"] {
                display: none !important;
                opacity: 0 !important;
                visibility: hidden !important;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Common function to process canvas containers
    function processCanvasContainers(containers, isStrict = false) {
        containers.forEach(container => {
            // Find any child elements that might be or contain the watermark
            const links = container.querySelectorAll('a');
            links.forEach(link => {
                if (link.textContent.toLowerCase().includes('spline') || 
                    (link.getAttribute('href') && link.getAttribute('href').includes('spline'))) {
                    link.style.display = 'none';
                }
            });
            
            // Apply a clean-up for any fixed positioned elements within container
            const fixedElements = Array.from(container.querySelectorAll('*')).filter(el => {
                const style = window.getComputedStyle(el);
                return style.position === 'fixed';
            });
            
            fixedElements.forEach(el => {
                el.style.display = 'none';
                if (isStrict) {
                    // For mobile, we do more aggressive removal
                    el.style.opacity = '0';
                    el.style.visibility = 'hidden';
                    el.style.pointerEvents = 'none';
                    el.style.zIndex = '-9999';
                }
            });
        });
    }
    
    // Run on page load
    hideSplineWatermark();
    
    // Run whenever window is resized
    window.addEventListener('resize', hideSplineWatermark);
    
    // For dynamically loaded content, run periodically
    setInterval(hideSplineWatermark, 2000);
}); 