// 引入必要的 Node.js 模块
const util = require('util');
const child_process = require('child_process');
const exec = util.promisify(child_process.exec);

/**
 * 格式化日期为 YYYY-MM-DD 的字符串
 * @returns {string} e.g., "2023-10-27"
 */
function getFormattedDate() {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 这是我们将要导出的主函数
// 注意：这次我们不再需要 'params' 参数了
module.exports = async () => {
    // 直接从全局 app 对象中获取 QuickAdd 插件的 API
    // 这是更直接、更不容易出错的方式
    const quickAddApi = app.plugins.plugins.quickadd.api;

    // 检查 QuickAdd API 是否可用
    if (!quickAddApi) {
        new Notice("QuickAdd API not available. Is the plugin enabled?", 5000);
        return;
    }

    // 弹出输入框，让用户输入文章的核心名称
    const customName = await quickAddApi.inputPrompt("Post Title (e.g., my-first-post)");

    // 检查用户是否取消了输入
    if (!customName) {
        new Notice("Operation cancelled.");
        return;
    }

    // 拼接日期前缀和用户输入
    const datePrefix = getFormattedDate();
    const fileName = `${datePrefix}-${customName}`;
    const fullFileName = fileName + ".md";

    // 定义 Hugo 项目中 post 文件夹的相对路径
    const postFolderPath = 'content/post';
    const hugoFilePath = `${postFolderPath}/${fullFileName}`;

    try {
        // 执行 hugo new 命令
        // 使用全局 app 对象获取 vault 路径
        const { stdout, stderr } = await exec(`hugo new ${hugoFilePath}`, {
            cwd: app.fileManager.vault.adapter.basePath
        });

        if (stderr) {
            console.error('Stderr:', stderr);
            new Notice("Warning/Error creating post. Check console.", 5000);
        }

        if (stdout) {
            console.log('Stdout:', stdout);
            new Notice(`New Blog Created: ${fullFileName}`, 5000);
            
            // 自动打开新创建的文件
            const newFile = app.vault.getAbstractFileByPath(hugoFilePath);
            if (newFile) {
                // 确保在新标签页中打开
                const leaf = app.workspace.getLeaf('tab');
                await leaf.openFile(newFile);
            } else {
                // 如果文件因为某些原因没找到，给一个提示
                new Notice(`Could not find the new file at: ${hugoFilePath}`, 5000);
            }
        }

    } catch (error) {
        console.error('Failed to execute command:', error);
        new Notice("Failed to create post. Is Hugo installed and in PATH?", 10000);
    }
}

