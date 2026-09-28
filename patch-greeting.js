const fs = require('fs');
let c = fs.readFileSync('src/app/admin/dashboard/dashboard-client.tsx', 'utf8');

const regex = /<p className="text-slate-500 mt-1">[\s\S]*?<\/p>/;
const newP = `<p className="text-slate-500 mt-1 font-medium">
              {kpis.totalAppointments > 0 
                ? \`Hoje você tem \${kpis.totalAppointments} atendimento\${kpis.totalAppointments > 1 ? 's' : ''} agendado\${kpis.totalAppointments > 1 ? 's' : ''}, sendo \${kpis.confirmedCount} confirmado\${kpis.confirmedCount > 1 || kpis.confirmedCount === 0 ? 's' : ''} e \${kpis.pendingCount} pendente\${kpis.pendingCount > 1 || kpis.pendingCount === 0 ? 's' : ''}.\`
                : "Você não tem nenhum atendimento agendado para hoje."}
            </p>`;

c = c.replace(regex, newP);

fs.writeFileSync('src/app/admin/dashboard/dashboard-client.tsx', c);
console.log("Replaced");
