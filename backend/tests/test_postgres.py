"""测试PostgreSQL配置和连接

运行方式：
1. 启动PostgreSQL: docker-compose up -d postgres
2. 配置.env文件
3. 运行测试: python test_postgres.py
"""

import os
import sys
from pathlib import Path

# 添加项目路径
sys.path.insert(0, str(Path(__file__).parent))

def test_postgres_connection():
    """测试PostgreSQL连接"""
    print("=" * 60)
    print("PostgreSQL连接测试")
    print("=" * 60)
    
    # 加载环境变量
    from dotenv import load_dotenv
    load_dotenv()
    
    postgres_uri = os.getenv("POSTGRES_URI")
    
    if not postgres_uri:
        print("[ERROR] 未找到POSTGRES_URI环境变量")
        print("\n请确保：")
        print("1. 已创建.env文件（参考.env.example）")
        print("2. 已配置POSTGRES_URI")
        return False
    
    print(f"\n连接字符串: {postgres_uri.replace(os.getenv('POSTGRES_PASSWORD', ''), '***')}")
    
    # 测试连接
    try:
        # 使用psycopg3（官方PostgresStore要求）
        try:
            from psycopg import Connection
            print("\n[1/4] 尝试连接PostgreSQL（使用psycopg3）...")
            with Connection.connect(postgres_uri) as conn:
                print("    [OK] 连接成功（psycopg3）")
        except ImportError:
            print("    [WARNING] psycopg3未安装，尝试psycopg2...")
            # 降级到psycopg2
            try:
                import psycopg2
                print("\n[1/4] 尝试连接PostgreSQL（使用psycopg2）...")
                conn = psycopg2.connect(postgres_uri)
                print("    [OK] 连接成功（psycopg2）")
                print("    [WARNING] 建议安装psycopg3: pip install 'psycopg[binary,pool]'")
            except ImportError:
                print("    [ERROR] psycopg2也未安装")
                raise
        
        # 测试查询
        print("\n[2/4] 执行测试查询...")
        with conn.cursor() as cur:
            cur.execute("SELECT version();")
            version = cur.fetchone()[0]
            print(f"    [OK] PostgreSQL版本: {version.split(',')[0]}")
        
        # 测试创建表
        print("\n[3/4] 测试表创建...")
        with conn.cursor() as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS test_table (
                    id SERIAL PRIMARY KEY,
                    data JSONB
                );
            """)
            conn.commit()
            print("    [OK] 测试表创建成功")
            
            # 清理
            cur.execute("DROP TABLE test_table;")
            conn.commit()
        
        conn.close()
        print("    [OK] 连接关闭")
        
        return True
        
    except ImportError:
        print("[ERROR] psycopg2未安装")
        print("\n请运行: pip install psycopg2-binary")
        return False
    except Exception as e:
        print(f"[ERROR] 连接失败: {e}")
        print("\n可能的原因：")
        print("1. PostgreSQL服务未启动")
        print("   运行: docker-compose up -d postgres")
        print("2. 连接字符串配置错误")
        print("3. 网络连接问题")
        print("4. Python依赖未安装")
        print("   运行: pip install -U 'psycopg[binary,pool]' langgraph-checkpoint-postgres")
        return False


def test_memory_store():
    """测试Memory Store配置"""
    print("\n" + "=" * 60)
    print("Memory Store配置测试")
    print("=" * 60)
    
    try:
        from app.memory import get_global_store
        
        print("\n[4/4] 测试Memory Store...")
        
        # 设置环境变量使用PostgreSQL
        os.environ["MEMORY_STORE_TYPE"] = "postgres"
        
        # 获取Store实例
        store = get_global_store()
        
        print(f"    [OK] Store类型: {type(store).__name__}")
        
        # 测试基本操作
        print("\n测试基本操作...")
        
        # Put操作
        test_namespace = ("test_user", "test_memory")
        test_key = "test_key"
        test_value = {"message": "Hello PostgreSQL!", "count": 123}
        
        print(f"    - 写入数据: {test_value}")
        store.put(test_namespace, test_key, test_value)
        print("    [OK] 写入成功")
        
        # Get操作
        print("    - 读取数据...")
        item = store.get(test_namespace, test_key)
        if item and item.value == test_value:
            print(f"    [OK] 读取成功: {item.value}")
        else:
            print("    [ERROR] 读取失败")
            return False
        
        # Search操作
        print("    - 搜索数据...")
        items = store.search(("test_user",))
        print(f"    [OK] 找到 {len(items)} 条记录")
        
        # Delete操作
        print("    - 删除数据...")
        store.delete(test_namespace, test_key)
        
        # 验证删除
        item_after_delete = store.get(test_namespace, test_key)
        if item_after_delete is None:
            print("    [OK] 删除成功")
        else:
            print("    [ERROR] 删除失败")
            return False
        
        print("\n[OK] Memory Store测试通过")
        return True
        
    except Exception as e:
        print(f"[ERROR] Memory Store测试失败: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_docker_compose():
    """检查Docker Compose状态"""
    print("\n" + "=" * 60)
    print("Docker Compose状态检查")
    print("=" * 60)
    
    import subprocess
    
    try:
        result = subprocess.run(
            ["docker-compose", "ps"],
            capture_output=True,
            text=True,
            timeout=5
        )
        
        if result.returncode == 0:
            print("\n[OK] Docker Compose运行正常\n")
            print(result.stdout)
            return True
        else:
            print("[WARNING] Docker Compose未运行或配置错误")
            return False
            
    except FileNotFoundError:
        print("[WARNING] docker-compose命令未找到")
        print("   请确保已安装Docker和Docker Compose")
        return False
    except Exception as e:
        print(f"[WARNING] 检查失败: {e}")
        return False


def main():
    """主测试函数"""
    print("\n🚀 Shadow Writing Agent - PostgreSQL配置测试\n")
    
    # 检查Docker Compose
    test_docker_compose()
    
    # 测试PostgreSQL连接
    pg_success = test_postgres_connection()
    
    if not pg_success:
        print("\n" + "=" * 60)
        print("快速设置指南")
        print("=" * 60)
        print("\n1. 启动PostgreSQL容器:")
        print("   docker-compose up -d postgres")
        print("\n2. 创建.env文件（参考.env.example）:")
        print("   cp .env.example .env")
        print("\n3. 修改.env中的配置:")
        print("   MEMORY_STORE_TYPE=postgres")
        print("   POSTGRES_PASSWORD=your_secure_password")
        print("\n4. 安装Python依赖:")
        print("   pip install psycopg2-binary python-dotenv")
        print("\n5. 重新运行测试:")
        print("   python test_postgres.py")
        return
    
    # 测试Memory Store
    store_success = test_memory_store()
    
    # 总结
    print("\n" + "=" * 60)
    print("测试总结")
    print("=" * 60)
    
    if pg_success and store_success:
        print("\n🎉 所有测试通过！PostgreSQL配置成功")
        print("\n下一步：")
        print("1. 重启FastAPI服务以使用PostgreSQL")
        print("2. 处理TED演讲，数据将自动保存到PostgreSQL")
        print("3. 重启服务后数据仍然保留")
    else:
        print("\n[WARNING] 部分测试失败，请检查错误信息")


if __name__ == "__main__":
    main()
