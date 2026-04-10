const fs = require('fs');
const content = fs.readFileSync('app/admin/plans/[id]/edit/page.tsx', 'utf8');
const fixed = content.replace(/updatePlan\(/g, 'updatePlanData(');
fs.writeFileSync('app/admin/plans/[id]/edit/page.tsx', fixed);
console.log('Fixed updatePlan -> updatePlanData');
