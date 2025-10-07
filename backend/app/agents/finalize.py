from app.state import Shadow_Writing_State

def finalize_agent(state: Shadow_Writing_State) -> Shadow_Writing_State:
    """最终化节点"""
    quality_chunks = state.get("quality_shadow_chunks", [])
    corrected_chunks = state.get("corrected_shadow_chunks", [])
    
    print(f"\n[FINALIZE NODE] 最终处理")
    
    # 优先使用修正后的语块，否则使用质量检查通过的语块
    if corrected_chunks:
        final_chunks = corrected_chunks
        print(f"   使用修正后的语块: {len(final_chunks)} 个")
    else:
        final_chunks = quality_chunks
        print(f"   使用质量检查通过的语块: {len(final_chunks)} 个")
    
    return {
        "final_shadow_chunks": final_chunks,
        "processing_logs": [f"最终化节点: 生成 {len(final_chunks)} 个最终语块"]
    }