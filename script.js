// Common JavaScript functions

// Function to navigate to a page
function navigateTo(page) {
    window.location.href = page;
}

// Function to show alert
function showAlert(message) {
    alert(message);
}

// Function to calculate skill match percentage
function calculateMatch(userSkills, jobSkills) {
    let match = 0;
    jobSkills.forEach(skill => {
        if (userSkills.includes(skill)) {
            match++;
        }
    });
    return Math.round((match / jobSkills.length) * 100);
}

// Function to render pie chart (Doughnut style)
function renderPieChart(canvasId, data, labels) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    if (window._matchChartInstance) window._matchChartInstance.destroy();
    window._matchChartInstance = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: ['#3b82f6', '#8b5cf6', '#38bdf8', '#6366f1', '#0ea5e9', '#6366f1'],
                borderWidth: 0,
                hoverOffset: 15
            }]
        },
        options: {
            responsive: true,
            
            animation: {
                animateScale: true,
                animateRotate: true,
                duration: 2000,
                easing: 'easeOutQuart'
            },
            plugins: {
                legend: {
                    position: 'bottom',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ' + context.parsed + '%';
                        }
                    }
                }
            }
        }
    });
}

// Function to render bar chart
function renderBarChart(canvasId, data, labels, datasetLabel = 'Proficiency Level') {
    const ctx = document.getElementById(canvasId).getContext('2d');
    if (window._skillChartInstance) window._skillChartInstance.destroy();
    window._skillChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: datasetLabel,
                data: data,
                backgroundColor: ['#3b82f6', '#8b5cf6', '#38bdf8', '#6366f1', '#0ea5e9', '#6366f1'],
                borderRadius: 8,
                borderWidth: 0,
                hoverBackgroundColor: '#f1f5f9'
            }]
        },
        options: {
            responsive: true,
            animation: {
                duration: 2000,
                easing: 'easeOutQuart'
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + context.parsed.y + '%';
                        }
                    }
                }
            }
        }
    });
}