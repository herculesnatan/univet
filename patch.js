const fs = require('fs');

function addRequireAdmin(file) {
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes('requireAdmin')) {
    content = content.replace(
      'import { revalidatePath } from "next/cache"',
      'import { revalidatePath } from "next/cache"\nimport { requireAdmin } from "@/lib/server-auth"'
    );
  }
  content = content.replace(/export async function ([a-zA-Z0-9_]+)\((.*?)\)\s*\{/g, (match, name, args) => {
    if (name === 'getColaboradorAgendaData' || name === 'updateAppointmentStatus') {
      return match;
    }
    return `${match}\n  await requireAdmin();`;
  });
  fs.writeFileSync(file, content);
  console.log('Patched', file);
}

const files = [
  'src/app/actions/clients.ts',
  'src/app/actions/pets.ts',
  'src/app/actions/services.ts',
  'src/app/actions/employees.ts',
  'src/app/actions/dashboard.ts',
  'src/app/actions/agenda.ts',
];

files.forEach(addRequireAdmin);
