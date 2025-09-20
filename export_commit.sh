#!/bin/bash

# 读取 commit id
read -p "请输入 commit id: " commit_id
if [ -z "$commit_id" ]; then
  echo "❌ commit id 不能为空"
  exit 1
fi

# 读取导出目录
read -p "请输入导出文件夹路径 (默认: ./archive): " target_dir
if [ -z "$target_dir" ]; then
  target_dir="./archive"
fi

mkdir -p "$target_dir"

# 获取 commit 改动的文件列表（只要文件名，不要状态）
changed_files=$(git diff-tree --no-commit-id --name-only -r "$commit_id")

if [ -z "$changed_files" ]; then
  echo "⚠️ 该 commit 没有改动文件"
  exit 0
fi

# 导出改动过的文件
for file in $changed_files; do
  # 确保目标子目录存在
  mkdir -p "$target_dir/$(dirname "$file")"
  # 从 commit 中恢复该文件内容
  git show "$commit_id:$file" > "$target_dir/$file" 2>/dev/null || true
done

# 获取 commit 日期和信息
commit_date=$(git show -s --format=%ci "$commit_id")
commit_msg=$(git show -s --format=%s "$commit_id")

# 生成说明文件
info_file="$target_dir/export_info.txt"
{
  echo "导出目录: $target_dir"
  echo "Commit ID: $commit_id"
  echo "Commit 日期: $commit_date"
  echo "Commit 信息: $commit_msg"
  echo ""
  echo "改动文件列表:"
  echo "$changed_files"
} > "$info_file"

echo "✅ 导出完成：只包含改动文件"
echo "ℹ️ 说明文件: $info_file"
