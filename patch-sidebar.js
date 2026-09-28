const fs = require('fs');

function patchSidebar(filename) {
  let c = fs.readFileSync(filename, 'utf8');

  const target = `<h1 className="text-xl font-bold">
            Univet
          </h1>`;
  
  const replacement = `<h1 className="text-xl font-bold flex items-center">
            Univet
            {process.env.NEXT_PUBLIC_APP_ENV === 'staging' && (
              <span className="ml-2 text-[10px] bg-yellow-500/20 text-yellow-300 font-bold px-2 py-0.5 rounded-full uppercase border border-yellow-500/30">Staging</span>
            )}
          </h1>`;
  
  c = c.replace(target, replacement);
  fs.writeFileSync(filename, c);
}

patchSidebar('src/components/layout/sidebar.tsx');
patchSidebar('src/components/layout/colaborador-sidebar.tsx');
console.log('Sidebars patched with staging badge.');
