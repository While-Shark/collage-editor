# 拼图编辑器 (Collage Editor)

一个高保真、功能丰富的社交媒体网格拼图编辑器。支持 1:1 正方形布局、多种滤镜、贴纸系统以及自定义背景，旨在为用户提供极致的拼图创作体验。

![项目预览](<img width="404" height="678" alt="image" src="https://github.com/user-attachments/assets/0dae41d1-e882-4dd3-b311-aa5c450ab442" />
)

## ✨ 主要功能

- **多样化布局**: 支持 1、2、3、4、6、9 张图片的多种网格布局。
- **高级滤镜系统**: 
  - 内置多种滤镜风格（鲜艳、柔和、复古、黑白等）。
  - 支持滤镜收藏功能，长按即可添加至收藏夹。
  - 实时调整亮度、对比度、饱和度等参数。
- **贴纸系统**: 
  - 支持 Emoji 贴纸。
  - 支持从本地导入图片作为自定义贴纸。
  - 贴纸可自由拖拽、缩放、旋转和删除。
- **背景定制**: 
  - **圆形调色盘**: 使用专业的圆形色盘精准选择自定义颜色。
  - **花纹背景**: 内置波点、网格、星空、繁花等多种艺术花纹。
  - **自定义背景**: 支持导入本地图片作为拼图底版。
- **编辑辅助**: 
  - **撤销/重做 (Undo/Redo)**: 完整的编辑历史记录，随时回溯。
  - **恢复默认**: 一键重置所有编辑效果，保留原始图片。
- **高清导出**: 支持 2160x2160 (4K) 高清 PNG 图片导出，适配各大社交平台。

## 🚀 技术栈

- **前端框架**: React 19 + TypeScript
- **构建工具**: Vite
- **样式处理**: Tailwind CSS
- **状态管理**: Zustand + Zundo (历史记录管理)
- **动画效果**: Framer Motion
- **图标库**: Lucide React
- **颜色选择**: React Color Palette

## 🛠️ 安装与运行

1. **克隆仓库**
   ```bash
   git clone https://github.com/your-username/collage-editor.git
   cd collage-editor
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **启动开发服务器**
   ```bash
   npm run dev
   ```

4. **构建项目**
   ```bash
   npm run build
   ```

## 📸 界面展示

| 布局选择 | 滤镜编辑 | 贴纸与背景 |
| :---: | :---: | :---: |
| ![布局](<img width="362" height="657" alt="image" src="https://github.com/user-attachments/assets/8365e594-ec43-43cf-b26c-43372af361b2" />
) | ![滤镜](<img width="352" height="655" alt="image" src="https://github.com/user-attachments/assets/e639adfb-13cf-46de-9591-515ec6408725" />
) | ![背景](<img width="350" height="643" alt="image" src="https://github.com/user-attachments/assets/ccb28cbf-addd-4400-bb66-24a418b8f160" />
) |

## 📝 开源协议

本项目采用 [MIT](LICENSE) 协议。
