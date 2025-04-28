import os
import shutil
import sys


def copy_all_files(src_dir, dst_dir):
    """递归复制 src_dir 下的所有文件和子目录到 dst_dir（覆盖现有内容）"""
    for item in os.listdir(src_dir):
        src_path = os.path.join(src_dir, item)
        dst_path = os.path.join(dst_dir, item)

        # 如果是文件，直接复制（覆盖）
        if os.path.isfile(src_path):
            shutil.copy2(src_path, dst_path)
            print(f"复制文件: {src_path} -> {dst_path}")

        # 如果是目录，递归复制
        elif os.path.isdir(src_path):
            if os.path.exists(dst_path):
                shutil.rmtree(dst_path)  # 删除目标目录（确保干净覆盖）
            shutil.copytree(src_path, dst_path)
            print(f"复制目录: {src_path} -> {dst_path}")


def main():
    # 获取当前脚本所在目录的上一级目录中的 dist 文件夹
    current_dir = os.path.dirname(os.path.abspath(__file__))
    dist_dir = os.path.join(os.path.dirname(current_dir), "dist")

    # 目标目录（SiYuan插件目录）
    target_dir = r"C:\Users\xiaoqi\SiYuan\data\plugins\mouse-events-plugin"

    # 检查 dist 目录是否存在
    if not os.path.exists(dist_dir):
        print(f"错误：dist 目录不存在！({dist_dir})")
        input("按 Enter 退出...")
        sys.exit(1)

    # 检查目标目录是否存在（不存在则创建）
    os.makedirs(target_dir, exist_ok=True)

    print(f"正在从 {dist_dir} 复制所有内容到 {target_dir}...")

    try:
        # 清空目标目录（可选，确保完全覆盖）
        for item in os.listdir(target_dir):
            item_path = os.path.join(target_dir, item)
            if os.path.isfile(item_path):
                os.unlink(item_path)
            elif os.path.isdir(item_path):
                shutil.rmtree(item_path)

        # 复制 dist 下的所有内容到目标目录
        copy_all_files(dist_dir, target_dir)
        print("复制完成！所有文件和子目录已覆盖。")

    except Exception as e:
        print(f"复制失败: {e}")
        sys.exit(1)

    input("按 Enter 退出...")


if __name__ == "__main__":
    main()
