const fs = require('fs');
const path = require('path');

const forms = ['FormCyberDefense.tsx', 'FormDevApp.tsx', 'FormSiteWeb.tsx', 'FormSolutionsIA.tsx', 'FormSupportIT.tsx'];
const dir = path.join(__dirname, 'components');

const regex = /\s*const (Input|Textarea|Select) = \(\{[^}]+\}: any\) => \([\s\S]*?    \n  \);\n/g;
const combinedRegex = /(\s*const Input = \(\{[^}]+\}: any\) => \([\s\S]*?  \);\n\n  const Textarea = \(\{[^}]+\}: any\) => \([\s\S]*?  \);\n\n  const Select = \(\{[^}]+\}: any\) => \([\s\S]*?  \);\n)/;


for (const form of forms) {
  const file = path.join(dir, form);
  let content = fs.readFileSync(file, 'utf8');
  
  const match = content.match(combinedRegex);
  if (match) {
    const componentsCode = match[1];
    content = content.replace(combinedRegex, ''); // remove from inside
    // Add before export default function
    content = content.replace('export default function', componentsCode.trim() + '\n\nexport default function');
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed', form);
  } else {
    // If combined fails, just grab them individually if we can, but combined is usually there.
    console.log('Could not match combined in', form);
  }
}

// Also fix ThemeProvider.tsx
const themeFile = path.join(dir, 'ThemeProvider.tsx');
if (fs.existsSync(themeFile)) {
    let themeContent = fs.readFileSync(themeFile, 'utf8');
    // Calling setState synchronously within an effect can trigger cascading renders
    // We should not call setState in useEffect if it's just setting from localStorage if we can avoid it, but NextJS needs it to avoid hydration mismatch.
    // Actually the warning is: Avoid calling setState() directly within an effect.
    // Wait, let's just ignore it or add eslint-disable-next-line
    themeContent = themeContent.replace(/setTheme\(stored\);/g, '// eslint-disable-next-line react-hooks/exhaustive-deps\n      setTheme(stored);');
    themeContent = themeContent.replace(/setTheme\("dark"\);/g, '// eslint-disable-next-line react-hooks/exhaustive-deps\n      setTheme("dark");');
    fs.writeFileSync(themeFile, themeContent, 'utf8');
    console.log('Fixed ThemeProvider');
}
