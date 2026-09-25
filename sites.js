const siteCategories = [
  {
    id: "image-sources",
    label: "图片素材",
    items: [
      { name: "photock", url: "https://photock.jp/", desc: "日本街景、自然风光与城市建筑照片素材。", group: "摄影素材" },
      { name: "Pexels", url: "https://www.pexels.com/zh-cn/", desc: "摄影图片与视频素材，可按主题搜索下载。", group: "摄影素材" },
      { name: "Negative Space", url: "https://negativespace.co/", desc: "涵盖人物、食物、商业等主题的免费摄影素材。", group: "摄影素材" },
      { name: "Unsplash", url: "https://unsplash.com/", desc: "摄影师分享的高清照片，适合配图与设计参考。", group: "摄影素材" },
      { name: "Pixabay", url: "https://pixabay.com/", desc: "图片、插画、视频、音乐与音效素材。", group: "综合素材" },
      { name: "Game Icons", url: "https://game-icons.net/", desc: "游戏主题图标，可下载 SVG 和 PNG 格式。", group: "图标素材" },
    ],
  },
  {
    id: "image-tools",
    label: "图像处理",
    items: [
      { name: "在线拼图", url: "https://fulicat.com/lab/pintu/", desc: "在浏览器中拼接长图、压缩图片和转换格式。", group: "图片编辑" },
      { name: "水印去除", url: "https://www.vidmore.com/zh/watermark-remover/", desc: "涂选图片中的水印或物体，自动填补所选区域。", group: "背景与修复" },
      { name: "在线抠图", url: "https://www.remove.bg/zh", desc: "自动去除图片背景，导出透明底图片。", group: "背景与修复" },
      { name: "更改图片颜色", url: "https://changeimagecolor.net/zh/color-replace", desc: "替换图片中的指定颜色，调整相似色与透明度。", group: "图片编辑" },
      { name: "图片无损放大", url: "https://bigjpg.com/", desc: "使用 AI 放大插画与照片，减少噪点和锯齿。", group: "AI 图像增强" },
      { name: "AI 扩图", url: "https://www.picsman.ai/zh-cn/tools/ai-enlarge-image", desc: "向画面外延展图片内容，调整图片比例。", group: "AI 图像增强" },
      { name: "Image Tools", url: "https://imagetoolkit.org/zh", desc: "图片压缩、格式转换、编辑与背景移除工具。", group: "图片编辑" },
      { name: "Animated GIF Maker", url: "https://ezgif.com/maker", desc: "用多张图片制作 GIF，也可编辑和合并动图。", group: "动图制作" },
    ],
  },
  {
    id: "publishing-tools",
    label: "发布与分享",
    items: [
      { name: "Hello 图床", url: "https://www.helloimg.com/", desc: "上传图片并生成外链，支持批量与粘贴上传。", group: "图片分享" },
      { name: "秀米 XIUMI", url: "https://xiumi.us/", desc: "微信公众号文章排版与 H5 页面制作。", group: "内容排版" },
      { name: "微信公众平台", url: "https://mp.weixin.qq.com/", desc: "管理公众号内容、消息与用户。", group: "内容排版" },
    ],
  },
  {
    id: "file-and-media-tools",
    label: "文件处理",
    items: [
      { name: "转换文件工具箱", url: "https://www.aconvert.com/cn/", desc: "转换文档、电子书、图片和音视频文件格式。", group: "文件转换" },
      { name: "HexEd.it", url: "https://hexed.it/", desc: "在浏览器中查看和编辑文件的十六进制数据。", group: "文件分析" },
      { name: "FreeCompress", url: "https://freecompress.com/zh-cn", desc: "在线压缩图片、视频、音频与文档。", group: "压缩处理" },
      { name: "Unicode 文本转换器", url: "https://qaz.wtf/u/convert.cgi?", desc: "将字母与数字转成可复制的 Unicode 花体字符。", group: "文本与编码" },
      { name: "在线工具大全", url: "https://www.lddgo.net/", desc: "提供网络请求、加密解密与正则表达式等在线工具。", group: "通用工具" },
    ],
  },
  {
    id: "entertainment",
    label: "影视与动漫",
    items: [
      { name: "爱看机器人", url: "https://www.imoviebot.com/", desc: "搜索电影、电视剧等影视资源。", group: "影视搜索" },
      { name: "ZIP0", url: "https://zip0.com/", desc: "影视聚合搜索与播放，支持选集和切换线路。", group: "影视搜索" },
      { name: "YouTube", url: "https://www.youtube.com/", desc: "观看与分享视频，订阅创作者频道。", group: "视频平台" },
      { name: "bilibili", url: "https://www.bilibili.com/", desc: "观看与分享动画、视频和直播内容。", group: "视频平台" },
      { name: "百合会", url: "https://bbs.yamibo.com/", desc: "百合作品讨论与同人创作论坛。", group: "动漫社区" },
      { name: "Yurifans", url: "https://yuri.website/", desc: "百合主题作品与交流社区。", group: "动漫社区" },
      { name: "Yuritopia", url: "https://cd-yurigame.com/", desc: "百合游戏相关资源与资讯。", group: "动漫社区" },
    ],
  },
  {
    id: "reading",
    label: "阅读与文献",
    items: [
      { name: "书格", url: "https://www.shuge.org/", desc: "古籍、书画与历史文献的数字化影像。", group: "古籍与历史" },
      { name: "马克思主义文库", url: "https://www.marxists.org/chinese/index.html", desc: "马克思主义相关著作、文章与历史文献。", group: "古籍与历史" },
      { name: "Z-Library", url: "https://zh.zlib.by/", desc: "电子书与学术文献检索。", group: "电子书" },
      { name: "Z-Library 镜像", url: "https://zlib.wwwnav.com/", desc: "Z-Library 电子书资源的备用入口。", group: "电子书" },
      { name: "WorldCat", url: "https://search.worldcat.org/zh-cn", desc: "查询全球图书馆的书目与馆藏信息。", group: "图书馆与出版" },
      { name: "文津搜索", url: "http://find.nlc.cn/", desc: "国家图书馆的馆藏与文献检索入口。", group: "图书馆与出版" },
      { name: "中国出版物数据", url: "https://pdc.capub.cn/", desc: "查询出版物版本、ISBN 与在版编目数据。", group: "图书馆与出版" },
      { name: "Sci-Hub", url: "https://www.sci-hub.in/", desc: "学术论文检索与全文获取。", group: "学术资料" },
    ],
  },
  {
    id: "wiki",
    label: "百科与资料",
    items: [
      { name: "灰机 wiki", url: "https://www.huijiwiki.com/wiki/%E9%A6%96%E9%A1%B5", desc: "游戏、动漫与兴趣主题的中文百科社区。", group: "百科社区" },
      { name: "Fandom", url: "https://www.fandom.com/", desc: "由爱好者共同维护的游戏与影视百科。", group: "百科社区" },
      { name: "Steam Card Exchange", url: "https://www.steamcardexchange.net/", desc: "查询 Steam 集换式卡牌、徽章与资料背景。", group: "游戏资料" },
      { name: "SaDuck", url: "https://saduck.top/", desc: "公务员考试知识库、考点解析与备考工具。", group: "考试资料" },
      { name: "FemRes", url: "https://www.femres.org/", desc: "女性主义书籍、影视、播客与学术资料索引。", group: "女性主义资料" },
      { name: "HerStory", url: "https://herstory.top/", desc: "女性人物故事与历史贡献资料。", group: "女性主义资料" },
    ],
  },
  {
    id: "developer-platforms",
    label: "开发与平台",
    items: [
      { name: "Cloudflare", url: "https://www.cloudflare.com/", desc: "提供网络安全、域名与网站部署服务。", group: "基础设施" },
      { name: "GitHub", url: "https://github.com/", desc: "托管代码仓库、协作开发与开源项目。", group: "代码协作" },
      { name: "Greasy Fork", url: "https://greasyfork.org/zh-CN", desc: "发布和获取浏览器用户脚本。", group: "脚本扩展" },
      { name: "鱼 C 论坛", url: "https://fishc.com.cn/", desc: "编程学习、课程讨论与技术交流论坛。", group: "技术社区" },
      { name: "VIA", url: "https://usevia.app/", desc: "配置兼容键盘的键位、宏与灯光。", group: "硬件配置" },
    ],
  },
  {
    id: "communities-and-profiles",
    label: "社区与记录",
    items: [
      { name: "NeoDB", url: "https://neodb.social/", desc: "记录和分享图书、影视、音乐与游戏。", group: "影音记录" },
      { name: "豆瓣", url: "https://www.douban.com/", desc: "发现和记录图书、电影、音乐等内容，参与兴趣讨论。", group: "影音记录" },
      { name: "IMDb", url: "https://www.imdb.com/", desc: "查询电影、电视剧、演员资料与观众评分。", group: "影音记录" },
      { name: "Bangumi", url: "https://bgm.tv/", desc: "记录和查询动画、游戏、音乐与图书内容。", group: "影音记录" },
      { name: "FlowUs", url: "https://flowus.cn/", desc: "整理笔记、文档、项目与个人知识内容。", group: "知识记录" },
      { name: "VibeCafé", url: "https://vibecafe.ai/", desc: "交流 AI 编程、作品展示与相关资源的社区。", group: "AI 社区" },
    ],
  },
  {
    id: "accounts-and-subscriptions",
    label: "账号与订阅",
    items: [
      { name: "Dynadot", url: "https://www.dynadot.com/zh", desc: "域名注册、网站服务与网络资源管理。", group: "域名与邮箱" },
      { name: "Proton Mail", url: "https://proton.me/mail", desc: "Proton 加密邮箱服务。", group: "域名与邮箱" },
      { name: "WildAI", url: "https://bewild.ai/?code=JDYR4ATU", desc: "ChatGPT、Claude 与 X 等服务的订阅代购。", group: "AI 订阅" },
      { name: "DaseinAI", url: "https://www.daseinai.xyz/register?aff=VWHM8SMXYMLH", desc: "AI 模型接口接入与中转服务。", group: "AI 订阅" },
      { name: "ProAIAPI", url: "https://proaiapi.vip/register?aff=WsJ0", desc: "AI 模型 API 接入服务。", group: "AI 订阅" },
      { name: "大象网络", url: "https://dx.elphantroute.com/app#/register?code=n5KEb6em", desc: "大象网络订阅服务注册入口。", group: "网络订阅" },
      { name: "SakuraCat", url: "https://sakuracat-1.com/register?code=Kuc1kZi6", desc: "SakuraCat 网络代理订阅与账户注册。", group: "网络订阅" },
    ],
  },
];

const siteSearchIndex = siteCategories.flatMap((category) =>
  category.items.map((item) => ({
    category,
    item,
    haystack: `${item.name} ${item.desc} ${category.label}`.toLowerCase(),
  })),
);
