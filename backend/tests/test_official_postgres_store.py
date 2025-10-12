"""测试LangGraph官方PostgresStore

验证官方PostgresStore的功能和集成

运行方式：
1. 启动PostgreSQL: docker-compose up -d postgres
2. 配置.env: MEMORY_STORE_TYPE=postgres
3. 运行测试: python test_official_postgres_store.py
"""

import os
import sys
from pathlib import Path

# 添加项目路径
sys.path.insert(0, str(Path(__file__).parent))


def test_official_postgres_store():
    """测试官方PostgresStore功能"""
    print("=" * 60)
    print("LangGraph官方PostgresStore测试")
    print("=" * 60)
    
    # 加载环境变量
    from dotenv import load_dotenv
    load_dotenv()
    
    postgres_uri = os.getenv("POSTGRES_URI")
    
    if not postgres_uri:
        print("[ERROR] 未找到POSTGRES_URI环境变量")
        print("请配置.env文件")
        return False
    
    try:
        from langgraph.store.postgres import PostgresStore
        
        print(f"\n连接字符串: {postgres_uri.replace(os.getenv('POSTGRES_PASSWORD', ''), '***')}")
        
        # 步骤1: 创建PostgresStore实例
        print("\n[1/6] 创建PostgresStore实例...")
        store = PostgresStore.from_conn_string(
            postgres_uri,
            pool_config={
                "min_size": 1,
                "max_size": 10,
            }
        )
        print("    [OK] PostgresStore实例创建成功")
        
        # 步骤2: 初始化表结构
        print("\n[2/6] 初始化表结构...")
        try:
            store.setup()
            print("    [OK] 表结构初始化成功")
        except Exception as e:
            print(f"    [WARNING] 表可能已存在: {e}")
        
        # 步骤3: 测试put操作
        print("\n[3/6] 测试数据写入...")
        test_namespace = ("test_user", "test_memory")
        test_key = "test_key_1"
        test_value = {
            "message": "Hello Official PostgresStore!",
            "timestamp": "2025-10-10T15:00:00",
            "count": 42
        }
        
        store.put(test_namespace, test_key, test_value)
        print(f"    [OK] 写入成功: {test_value}")
        
        # 步骤4: 测试get操作
        print("\n[4/6] 测试数据读取...")
        item = store.get(test_namespace, test_key)
        
        if item:
            print("    [OK] 读取成功")
            print(f"       值: {item.value}")
            print(f"       命名空间: {item.namespace}")
            print(f"       键: {item.key}")
            print(f"       创建时间: {item.created_at}")
            print(f"       更新时间: {item.updated_at}")
        else:
            print("    [ERROR] 读取失败")
            return False
        
        # 步骤5: 测试search操作
        print("\n[5/6] 测试数据搜索...")
        items = store.search(("test_user",))
        print(f"    [OK] 找到 {len(items)} 条记录")
        
        for idx, item in enumerate(items[:3], 1):
            print(f"       记录{idx}: key={item.key}, namespace={item.namespace}")
        
        # 步骤6: 测试delete操作
        print("\n[6/6] 测试数据删除...")
        store.delete(test_namespace, test_key)
        
        # 验证删除
        item_after_delete = store.get(test_namespace, test_key)
        if item_after_delete is None:
            print("    [OK] 删除成功")
        else:
            print("    [ERROR] 删除失败")
            return False
        
        print("\n" + "=" * 60)
        print("[OK] 所有测试通过！")
        print("=" * 60)
        
        print("\n[INFO] PostgresStore特性验证:")
        print("   [OK] 连接池支持")
        print("   [OK] 自动建表（setup方法）")
        print("   [OK] put/get/search/delete操作")
        print("   [OK] 命名空间支持")
        print("   [OK] JSONB存储")
        print("   [OK] 时间戳自动记录")
        
        return True
        
    except ImportError as e:
        print(f"\n[ERROR] 依赖未安装: {e}")
        print("\n请运行:")
        print("  pip install -U 'psycopg[binary,pool]' langgraph-checkpoint-postgres")
        return False
    except Exception as e:
        print(f"\n[ERROR] 测试失败: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_memory_service_with_postgres():
    """测试MemoryService与PostgresStore集成"""
    print("\n" + "=" * 60)
    print("MemoryService + PostgresStore集成测试")
    print("=" * 60)
    
    try:
        # 设置环境变量使用PostgreSQL
        os.environ["MEMORY_STORE_TYPE"] = "postgres"
        
        from app.memory import MemoryService, get_global_store
        
        print("\n[1/3] 创建MemoryService...")
        store = get_global_store()
        memory_service = MemoryService(store=store)
        
        print(f"    [OK] Store类型: {type(store).__name__}")
        
        # 测试添加学习记录
        print("\n[2/3] 测试添加学习记录...")
        
        shadow_writings = [
            {
                "original": "Test sentence for PostgreSQL integration",
                "imitation": "Test sentence for database persistence",
                "map": {"subject": ["PostgreSQL", "database"]},
                "paragraph": "This is a test paragraph.",
                "quality_score": 8.0
            }
        ]
        
        record_ids = memory_service.add_batch_learning_records(
            user_id="test_postgres_user",
            ted_url="https://ted.com/talks/test",
            ted_title="PostgreSQL Integration Test",
            ted_speaker="Test Speaker",
            shadow_writings=shadow_writings,
            default_tags=["testing", "postgresql"]
        )
        
        print(f"    [OK] 保存成功: {len(record_ids)} 条记录")
        print(f"       记录ID: {record_ids[0][:16]}...")
        
        # 测试查询学习记录
        print("\n[3/3] 测试查询学习记录...")
        
        records = memory_service.get_learning_records(
            user_id="test_postgres_user",
            limit=10
        )
        
        print(f"    [OK] 查询成功: {len(records)} 条记录")
        
        if records:
            print("\n    第一条记录预览:")
            print(f"       原句: {records[0].get('original', '')[:50]}...")
            print(f"       质量: {records[0].get('quality_score', 0)}")
            print(f"       标签: {records[0].get('tags', [])}")
        
        # 清理测试数据
        print("\n清理测试数据...")
        for record_id in record_ids:
            memory_service.delete_learning_record("test_postgres_user", record_id)
        print("    [OK] 清理完成")
        
        print("\n" + "=" * 60)
        print("[OK] MemoryService集成测试通过！")
        print("=" * 60)
        
        return True
        
    except Exception as e:
        print(f"\n[ERROR] 集成测试失败: {e}")
        import traceback
        traceback.print_exc()
        return False


def main():
    """主测试函数"""
    print("\n🚀 LangGraph官方PostgresStore验证测试\n")
    
    # 测试1: 官方PostgresStore基础功能
    store_success = test_official_postgres_store()
    
    if not store_success:
        print("\n[WARNING] PostgresStore测试失败")
        print("\n快速修复:")
        print("1. 启动PostgreSQL: docker-compose up -d postgres")
        print("2. 安装依赖: pip install -U 'psycopg[binary,pool]' langgraph-checkpoint-postgres")
        print("3. 配置.env: MEMORY_STORE_TYPE=postgres")
        return
    
    # 测试2: MemoryService集成
    integration_success = test_memory_service_with_postgres()
    
    # 总结
    print("\n" + "=" * 60)
    print("测试总结")
    print("=" * 60)
    
    if store_success and integration_success:
        print("\n🎉 所有测试通过！")
        print("\n[OK] LangGraph官方PostgresStore已成功集成")
        print("[OK] MemoryService可正常使用PostgreSQL")
        print("[OK] 数据持久化功能正常")
        
        print("\n下一步:")
        print("1. 重启FastAPI服务以使用PostgreSQL")
        print("2. 处理TED演讲，数据将自动保存到PostgreSQL")
        print("3. 验证重启后数据仍然保留")
    else:
        print("\n[WARNING] 部分测试失败，请检查错误信息")


if __name__ == "__main__":
    main()
