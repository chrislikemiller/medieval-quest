const fs = require('fs');
const path = require('path');

async function mergeComponentFiles(componentFilePath: string) {
    try {
        const componentDir = path.dirname(componentFilePath);
        const componentFileName = path.basename(componentFilePath, path.extname(componentFilePath));

        const htmlFilePath = path.join(componentDir, `${componentFileName}.html`);
        const cssFilePath = path.join(componentDir, `${componentFileName}.scss`);
        console.log(htmlFilePath);
        console.log(cssFilePath);
        let componentContent = fs.readFileSync(componentFilePath, 'utf-8');
        let htmlContent = '';
        let cssContent = '';

        if (fs.existsSync(htmlFilePath)) {
            htmlContent = fs.readFileSync(htmlFilePath, 'utf-8').replace(/[\r\n]+/g, '\n').trim();
        }

        if (fs.existsSync(cssFilePath)) {
            cssContent = fs.readFileSync(cssFilePath, 'utf-8').replace(/[\r\n]+/g, '\n').trim();
        }

        componentContent = componentContent.replace(
            /templateUrl\s*:\s*['"`]([^'"`]*)['"`]/,
            `template: \`${htmlContent}\``
        );

        componentContent = componentContent.replace(
            /styleUrl\s*:\s*['"`]([^'"`]*)['"`]/,
            `styles: [\`${cssContent}\`]`
        );

        fs.writeFileSync(componentFilePath, componentContent, 'utf-8');

        console.log(`Successfully merged files for ${componentFilePath}`);
    } catch (error) {
        console.error(`Error processing ${componentFilePath}:`, error);
    }
}


[
//    "register",
//    "login"
].forEach(folder => {
    const componentFilePath = `../app/auth/${folder}/${folder}.component.ts`;
    mergeComponentFiles(componentFilePath);
});

