---
title: "{{ replaceRE `^\\d{4}-\\d{2}-\\d{2}-` "" .TranslationBaseName | replace "-" " " | title }}"
date: {{ .Date }}
draft: true
share: false
keywords: []
description: ""
tags: []
categories: []
author: "urie"
cover.image: "" # 文章封面图片地址
slug: "{{ .TranslationBaseName }}"
dir: "post" # 搭配 Enveloppe 插件设置文章上传的目录
# You can also close(false) or open(true) something for this content.
# P.S. comment can only be closed
comment: true
toc: true
autoCollapseToc: false
postMetaInFooter: false
hiddenFromHomePage: false
# You can also define another contentCopyright. e.g. contentCopyright: "This is another copyright."
contentCopyright: true
reward: false
mathjax: false
mathjaxEnableSingleDollar: false
mathjaxEnableAutoNumber: false

series: "" # 系列文章
# You unlisted posts you might want not want the header or footer to show
hideHeaderAndFooter: false

# You can enable or disable out-of-date content warning for individual post.
# Comment this out to use the global config.
#enableOutdatedInfoWarning: false

flowchartDiagrams:
  enable: false
  options: ""

sequenceDiagrams: 
  enable: false
  options: ""

---


<!--more-->







# TODO List
```dataview
TASK                                  
WHERE !completed   AND !draft                  
GROUP BY file.link                   
SORT file.name ASC, line ASC          
```

