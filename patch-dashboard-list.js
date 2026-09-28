const fs = require('fs');
let c = fs.readFileSync('src/app/admin/dashboard/dashboard-client.tsx', 'utf8');

c = c.replace(
  'import { Calendar, DollarSign, Users, Dog, Clock, UserPlus, Scissors, PlusCircle, CheckCircle2, ChevronRight } from "lucide-react"',
  'import { Calendar, DollarSign, Users, Dog, Clock, UserPlus, Scissors, PlusCircle, CheckCircle2, ChevronRight, UserCircle } from "lucide-react"\\nimport { AgendaQuickStatus } from "../agenda/status-components"'
);

const newList = `<div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto pr-2">
                {appointments.map((app) => (
                  <div key={app.id} className="p-5 flex gap-4 items-start hover:bg-slate-50 transition-colors relative group">
                    <div className="w-16 shrink-0">
                      <div className="text-sm font-black text-slate-800 bg-slate-100/80 px-2 py-1.5 rounded-md text-center border border-slate-200">{app.time}</div>
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <div className="font-bold text-slate-800 truncate text-base">{app.petName} <span className="text-slate-400 font-medium text-xs ml-1">({app.petBreed ? \`\${app.petBreed} - \` : ''}{app.petSpecies})</span></div>
                          <div className="text-xs text-slate-500 font-medium truncate">Tutor: {app.clientName}</div>
                        </div>
                        <div className="shrink-0">
                          <AgendaQuickStatus id={app.id} currentStatus={app.status} petName={app.petName} />
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 items-center mt-1">
                        <div className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-1 rounded-md inline-block truncate max-w-full">
                          {app.servicesText}
                        </div>
                        <div className="text-xs font-semibold text-slate-500 flex items-center gap-1 bg-white border border-slate-200 px-2 py-1 rounded-md">
                          <UserCircle className="w-3.5 h-3.5"/> {app.employeeName}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>`;

c = c.replace(/<div className="divide-y divide-slate-100 max-h-\[350px\] overflow-y-auto">[\s\S]*?<\/div>\s*\) : \(/, newList + '\n              ) : (');

fs.writeFileSync('src/app/admin/dashboard/dashboard-client.tsx', c);
console.log('List replaced');
