const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'components');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

const replacements = [
  { regex: /(?<!dark:)bg-white/g, replacement: 'bg-white dark:bg-gray-900' },
  { regex: /(?<!dark:)bg-gray-50(?!\/)/g, replacement: 'bg-gray-50 dark:bg-gray-950' },
  { regex: /(?<!dark:)bg-gray-50\/50/g, replacement: 'bg-gray-50/50 dark:bg-gray-900/50' },
  { regex: /(?<!dark:)bg-gray-50\/80/g, replacement: 'bg-gray-50/80 dark:bg-gray-900/80' },
  { regex: /(?<!dark:)text-gray-900/g, replacement: 'text-gray-900 dark:text-white' },
  { regex: /(?<!dark:)text-gray-800/g, replacement: 'text-gray-800 dark:text-gray-200' },
  { regex: /(?<!dark:)text-gray-700/g, replacement: 'text-gray-700 dark:text-gray-300' },
  { regex: /(?<!dark:)text-gray-600/g, replacement: 'text-gray-600 dark:text-gray-400' },
  { regex: /(?<!dark:)text-gray-500/g, replacement: 'text-gray-500 dark:text-gray-400' },
  { regex: /(?<!dark:)border-gray-100/g, replacement: 'border-gray-100 dark:border-gray-800' },
  { regex: /(?<!dark:)border-gray-200/g, replacement: 'border-gray-200 dark:border-gray-800' },
  { regex: /(?<!dark:)divide-gray-100/g, replacement: 'divide-gray-100 dark:divide-gray-800' },
  { regex: /border-b(?!\s*border-)/g, replacement: 'border-b dark:border-gray-800' },
  { regex: /border-t(?!\s*border-)/g, replacement: 'border-t dark:border-gray-800' },
  { regex: /(?<!dark:)hover:bg-gray-50/g, replacement: 'hover:bg-gray-50 dark:hover:bg-gray-800' },
  { regex: /(?<!dark:)hover:bg-gray-100/g, replacement: 'hover:bg-gray-100 dark:hover:bg-gray-800' },
  // Specific cases for badges which might look bad in dark mode if kept white/light:
  { regex: /(?<!dark:)bg-emerald-50/g, replacement: 'bg-emerald-50 dark:bg-emerald-900/30' },
  { regex: /(?<!dark:)text-emerald-700/g, replacement: 'text-emerald-700 dark:text-emerald-400' },
  { regex: /(?<!dark:)border-emerald-100/g, replacement: 'border-emerald-100 dark:border-emerald-800' },
  { regex: /(?<!dark:)bg-blue-50/g, replacement: 'bg-blue-50 dark:bg-blue-900/30' },
  { regex: /(?<!dark:)text-blue-700/g, replacement: 'text-blue-700 dark:text-blue-400' },
  { regex: /(?<!dark:)border-blue-100/g, replacement: 'border-blue-100 dark:border-blue-800' },
  { regex: /(?<!dark:)bg-orange-50/g, replacement: 'bg-orange-50 dark:bg-orange-900/30' },
  { regex: /(?<!dark:)text-orange-700/g, replacement: 'text-orange-700 dark:text-orange-400' },
  { regex: /(?<!dark:)border-orange-100/g, replacement: 'border-orange-100 dark:border-orange-800' },
  { regex: /(?<!dark:)bg-purple-50/g, replacement: 'bg-purple-50 dark:bg-purple-900/30' },
  { regex: /(?<!dark:)text-purple-700/g, replacement: 'text-purple-700 dark:text-purple-400' },
  { regex: /(?<!dark:)border-purple-100/g, replacement: 'border-purple-100 dark:border-purple-800' },
  // Inputs and textareas
  { regex: /(?<!dark:)bg-transparent/g, replacement: 'bg-transparent dark:text-white' }, // ensure text is white in inputs if bg is transparent
  { regex: /className="w-full p-2.5 border rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500"/g, replacement: 'className="w-full p-2.5 border dark:border-gray-700 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"' }
];

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  let originalContent = content;
  
  // First, we must ensure we don't duplicate existing dark classes
  for (const { regex, replacement } of replacements) {
    // A trick: if the file already contains the exact replacement string, it might be safe to skip or just let it replace since negative lookbehind (?<!dark:) prevents re-matching the base class.
    // Wait, negative lookbehind works. Let's just run it.
    content = content.replace(regex, replacement);
  }

  // inputs and selects and textareas might have different classNames
  // Let's globally add dark styling for form elements if they don't have it
  content = content.replace(/className="([^"]*?border[^"]*?rounded-[a-z]+[^"]*?)"/g, (match, classes) => {
    if (!classes.includes('dark:border') && !classes.includes('border-transparent')) {
      classes = classes.replace('border', 'border dark:border-gray-700');
    }
    if (!classes.includes('dark:bg-') && (classes.includes('bg-white') || !classes.includes('bg-'))) {
        if (!classes.includes('bg-white')) classes += ' bg-white';
        classes = classes.replace('bg-white', 'bg-white dark:bg-gray-800');
    }
    if (!classes.includes('dark:text-') && !classes.includes('text-gray-') && !classes.includes('text-white')) {
       classes += ' text-gray-900 dark:text-white';
    }
    return `className="${classes}"`;
  });

  if (content !== originalContent) {
    // cleanup potential duplicates like "bg-white dark:bg-gray-900 dark:bg-gray-900"
    content = content.replace(/dark:bg-gray-900 dark:bg-gray-900/g, 'dark:bg-gray-900');
    content = content.replace(/dark:bg-gray-950 dark:bg-gray-950/g, 'dark:bg-gray-950');
    content = content.replace(/dark:text-white dark:text-white/g, 'dark:text-white');
    content = content.replace(/dark:border-gray-800 dark:border-gray-800/g, 'dark:border-gray-800');
    content = content.replace(/dark:border-gray-700 dark:border-gray-700/g, 'dark:border-gray-700');

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated theme classes in ${file}`);
  }
}
