---
title: Hugo+Github+Obsidian的博客工作流
date: 2025-06-10T00:28:28+08:00
draft: false
share: true
keywords:
  - Hugo
  - blog
  - Obsidian
  - 博客
description: ""
tags:
  - 博客
  - blog
  - Hugo
  - Github
  - Obsidian
  - 工作流
  - 自动化
categories:
  - 折腾
author: urie
cover:
 image: 
slug: 2025-06-10-Hugo+Github+Obsidian的博客工作流
dir: post
comment: true
toc: true
autoCollapseToc: false
postMetaInFooter: true
hiddenFromHomePage: false
contentCopyright: true
reward: false
mathjax: false
mathjaxEnableSingleDollar: false
mathjaxEnableAutoNumber: false
series: ""
hideHeaderAndFooter: false
flowchartDiagrams:
  enable: false
  options: ""
sequenceDiagrams:
  enable: false
  options: ""
---

是不是每一个博客的第一篇博客都是教你如何搭建博客（笑

<!--more-->

# 序言

其实很久之前已经搭过一个博客，但已经年久失修了。这次因为又起了记录和整理知识以及分享一下生活的心思，重新搭了一个博客，也许会一直更下去，也许今天之后就不会更了.....  :-D

# 前期准备

我使用Hugo搭建静态博客，并将其通过GitHub Action部署到我的云服务器上，通过Cloudflare启用域名解析和CDN。

在本地通过Obsidian来编辑和推送博客。

故你需要：
1. 一个GitHub账号
2. 一个云服务器，并安装Nginx
3. 一个Cloudflare账号和一个域名
4. Obsidian

# 开始搭建

## 安装Hugo

我的本地操作系统为Arch，通过`pacman -S hugo`安装Hugo，注意，由于我使用的主题需要用到Hugo Pipes特性，故需要安装Hugo extend，通过pacman安装的Hugo默认已经启用了extend。

其余操作系统可在[这个界面](https://gohugo.io/installation/)查看如何安装。

执行`hugo new site my-blog`  创建一个新站点。，为了将Hugo备份至GitHub，并使用其同步功能，需要执行：
```bash
git init 
```
将其初始化为一个仓库。

## 安装Hugo 主题

我使用的是[Even主题](https://github.com/olOwOlo/hugo-theme-even)，它的干净和简洁深得我心。

具体的安装步骤可以在其README界面查看，不过为了避免各位不想去看README，我将关键步骤整理如下。

先进入站点根目录，执行：
```bash
git submodule add https://github.com/olOwOlo/hugo-theme-even themes/even
```

然后将主题提供的配置文件复制到站点根目录：
```bash
cp themes/even/config.toml ./hugo.toml
```

根据自己的需求修改配置文件。

> **注意:** 对于这个主题，你应该使用 **post** 而不是 **posts**，即 `hugo new post/some-content.md`


[TODO::  [多语言支持](https://github.com/olOwOlo/hugo-theme-even/blob/master/README-zh.md#language-support)]


# GitHub 同步推送至服务器

当在本地编辑完博客并推送至远程仓库后，会触发GitHub Action，自动编译Hugo网站，并使用rsync同步至服务器，GitHub Action的配置如下所示：
```yaml
# .github/workflows/deploy.yml

name: Build and Deploy Hugo Site to Server

# 触发条件：当 main 分支有 push 操作时触发
on:
  push:
    branches:
      - main

jobs:
  build-and-deploy:
    # 运行环境：使用最新的 Ubuntu 系统
    runs-on: ubuntu-latest

    steps:
      # 第一步：检出代码
      # 拉取你的 Hugo 博客仓库代码
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          submodules: true  # 确保拉取主题子模块 (themes/even)
          fetch-depth: 0    # 拉取所有 git 历史，以便 enableGitInfo 能正常工作

      # 第二步：设置 Hugo 环境
      # 安装 Hugo CLI
      - name: Setup Hugo
        uses: peaceiris/actions-hugo@v2
        with:
          hugo-version: 'latest' 
          extended: true         

      # 第三步：构建网站
      # 运行 hugo 命令生成静态文件到 public 目录
      - name: Build Hugo site
        env:
          # 注入环境变量，将 GitHub Secrets 的值传递给 Hugo
          GITALK_CLIENT_ID: ${{ secrets.GITALK_CLIENT_ID }}
          GITALK_CLIENT_SECRET: ${{ secrets.GITALK_CLIENT_SECRET }}
        run: |
          sed -i "s/__GITALK_CLIENT_ID__/${GITALK_CLIENT_ID}/g" hugo.toml
          sed -i "s/__GITALK_CLIENT_SECRET__/${GITALK_CLIENT_SECRET}/g" hugo.toml
          hugo --minify 
        

      - name: Deploy to Server via Rsync
        uses: burnett01/rsync-deployments@6.0.0
        with:
          # -a: 归档模式, 相当于 -rlptgoD, 保持文件原有属性
          # -v: 详细模式, 显示传输过程
          # -z: 压缩传输
          # -r: 递归同步 (其实 -a 已经包含了 -r)
          # --delete: 删除服务器上存在但本地 public 目录中不存在的文件，保持完全同步
          switches: -avz --delete 
          
          # 本地源路径：hugo 构建好的 public 目录
          path: public/
          
          # 远程服务器配置：从 GitHub Secrets 中读取
          remote_path: ${{ secrets.TARGET_DIR }}
          remote_host: ${{ secrets.SSH_HOST }}
          remote_user: ${{ secrets.SSH_USER }}
          remote_key: ${{ secrets.SSH_PRIVATE_KEY }}
          
          remote_port: ${{ secrets.SSH_PORT }}
```


这里需要添加一些Repository secrets：
* TARGET_DIR：为服务器网站根目录
* SSH_HOST
* SSH_USER
* SSH_PRIVATE_KEY
* GITALK_CLIENT_ID和GITALK_CLIENT_SECRET：如果使用Gitalk作为评论系统需要配置


# 本地Obsidian工作流

需要用到`Enveloppe`和`QuickAdd`插件：`Enveloppe`用来提交和推送博客，并将Obsidian格式的Markdown文件转成Hugo格式；`QuickAdd`插件用来快速创建一个新博客模板。

`Enveloppe`配置如下：

```json
{
  "github": {
    "branch": "main",
    "automaticallyMergePR": true,
    "dryRun": {
      "enable": false,
      "folderName": "enveloppe"
    },
    "api": {
      "tiersForApi": "Github Free/Pro/Team (default)",
      "hostname": ""
    },
    "workflow": {
      "commitMessage": "[PUBLISHER] Merge",
      "name": ""
    },
    "verifiedRepo": true
  },
  "upload": {
    "behavior": "fixed",
    "defaultName": "content/post",
    "rootFolder": "",
    "yamlFolderKey": "",
    "frontmatterTitle": {
      "enable": true,
      "key": "dir"
    },
    "replaceTitle": [],
    "replacePath": [],
    "autoclean": {
      "includeAttachments": true,
      "enable": false,
      "excluded": []
    },
    "folderNote": {
      "enable": false,
      "rename": "index.md",
      "addTitle": {
        "enable": false,
        "key": "title"
      }
    },
    "metadataExtractorPath": ""
  },
  "conversion": {
    "hardbreak": false,
    "dataview": true,
    "censorText": [
      {
        "entry": "/\\[(.*?)\\]\\((?!https?:\\/\\/|\\/)(.*?\\.md(?:#.*?)?)\\)/",
        "replace": "[$1]({把我删掉{< relref \"$2\" >}})",
        "flags": "",
        "after": true
      },
      {
        "entry": "fm=jpg",
        "replace": "auto=format",
        "flags": "",
        "after": true
      },
      {
        "entry": "/cover\\.image/",
        "replace": "cover:\\n image",
        "flags": "",
        "after": true
      }
    ],
    "tags": {
      "inline": true,
      "exclude": [],
      "fields": []
    },
    "links": {
      "internal": true,
      "unshared": false,
      "wiki": true,
      "slugify": "lower",
      "unlink": true,
      "relativePath": true,
      "textPrefix": "/"
    }
  },
  "embed": {
    "attachments": false,
    "overrideAttachments": [],
    "keySendFile": [],
    "notes": false,
    "folder": "",
    "convertEmbedToLinks": "keep",
    "charConvert": "->",
    "unHandledObsidianExt": [],
    "sendSimpleLinks": false,
    "forcePush": true
  },
  "plugin": {
    "shareKey": "share",
    "excludedFolder": [],
    "copyLink": {
      "enable": false,
      "links": "",
      "removePart": [],
      "addCmd": false,
      "transform": {
        "toUri": true,
        "slugify": "lower",
        "applyRegex": []
      }
    },
    "setFrontmatterKey": "Set"
  }
}
```

> 请把上面的json配置文件中`conversion.censorText[0].replace`中的“把我删掉”这四个字删掉



`QuickAdd`脚本可以在[GitHub仓库](https://github.com/jlz52z/hellourie/blob/main/obs_sctipts/NewBlog.js)中查看




{{< info >}}以下为仍待施工的博客内容{{< /info >}}

- [2025-06-10-Hugo+Github+Obsidian的博客工作流]({{< relref "post.md" >}}): [多语言支持](https://github.com/olOwOlo/hugo-theme-even/blob/master/README-zh.md#language-support)


