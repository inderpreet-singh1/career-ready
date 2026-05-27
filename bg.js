document.addEventListener("DOMContentLoaded", function () {
    if (window.VANTA) {
        VANTA.WAVES({
            el: "body",
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.00,
            minWidth: 200.00,
            scale: 1.00,
            scaleMobile: 1.00,
            color: 0x0f172a, // Very Dark Slate waves
            waveHeight: 20.00,
            waveSpeed: 0.80,
            zoom: 0.85
        });
        
        // Ensure body background is styled appropriately for waves
        document.body.style.backgroundColor = "#020617";
    }
});