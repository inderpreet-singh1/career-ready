const fs = require('fs');

// 1. Update style.css to align charts symmetrically with gaps
let css = fs.readFileSync('style.css', 'utf-8');

// Ensure charts-grid and charts-row have exactly the same symmetric layout
const symmetricGridCSS = `{
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 3rem;
    align-items: center;
    width: 100%;
    max-width: 100%;
    margin: 2rem auto;
}`;

css = css.replace(/\.charts-row\s*\{[^}]+\}/g, `.charts-row ${symmetricGridCSS}`);

if (css.includes('.charts-grid')) {
    css = css.replace(/\.charts-grid\s*\{[^}]+\}/g, `.charts-grid ${symmetricGridCSS}`);
} else {
    css += `\n.charts-grid ${symmetricGridCSS}\n`;
}

fs.writeFileSync('style.css', css);

// 2. Update results.html pie chart logic
let resultsHtml = fs.readFileSync('results.html', 'utf-8');
// Original: renderPieChart('matchChart', [matchPercentage, 100 - matchPercentage], ['Matched', 'Not Matched']);
// Move pie chart rendering below category logic and use category data
resultsHtml = resultsHtml.replace(/renderPieChart\('matchChart', \[matchPercentage, 100 - matchPercentage\], \['Matched', 'Not Matched'\]\);/g, '');

const barChartRegexResults = /renderBarChart\('skillChart', categoryScores, categoryLabels, 'Skill Distribution by Domain \(%\)'\);/g;
resultsHtml = resultsHtml.replace(barChartRegexResults, 
    `renderPieChart('matchChart', categoryScores, categoryLabels);
                renderBarChart('skillChart', categoryScores, categoryLabels, 'Skill Distribution by Domain (%)');`);

fs.writeFileSync('results.html', resultsHtml);

// 3. Update dashboard.html pie chart logic
let dashboardHtml = fs.readFileSync('dashboard.html', 'utf-8');
// Original: renderPieChart('progressChart', [quizScore, 100 - quizScore], ['Completed', 'Remaining']);
dashboardHtml = dashboardHtml.replace(/renderPieChart\('progressChart', \[quizScore, 100 - quizScore\], \['Completed', 'Remaining'\]\);/g, '');

const barChartRegexDashboard = /renderBarChart\('distributionChart', distributionScores, distributionLabels, 'Profile Distribution \(%\)'\);/g;
dashboardHtml = dashboardHtml.replace(barChartRegexDashboard, 
    `renderPieChart('progressChart', distributionScores, distributionLabels);
            renderBarChart('distributionChart', distributionScores, distributionLabels, 'Profile Distribution (%)');`);

fs.writeFileSync('dashboard.html', dashboardHtml);

console.log('Fixed alignments and updated pie charts to match bar charts criteria.');
