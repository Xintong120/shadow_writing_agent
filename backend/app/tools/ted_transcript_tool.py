"""TED Transcript提取工具

包装 ted-transcript-extractor 包，从 TED URL 提取完整 transcript
"""

from typing import Optional
from ted_extractor import TEDTranscriptExtractor
from app.models import TedTxt


class TEDTranscriptTool:
    """
    TED Transcript提取工具类
    
    封装 ted-transcript-extractor 包，提供便捷的 TED 演讲 transcript 提取功能
    """
    
    def __init__(self):
        self.extractor = TEDTranscriptExtractor(
            delay_between_requests=2.0,  # 请求间隔 2 秒，避免被封
            timeout=30,  # 超时时间 30 秒
            max_retries=3  # 最大重试次数
        )
    
    def extract_transcript(self, url: str) -> Optional[TedTxt]:
        """
        从 TED URL 提取完整 transcript
        
        Args:
            url: TED演讲URL
            
        Returns:
            TedTxt对象，失败返回None
        """
        try:
            print(f"[TED EXTRACTOR] 开始爬取: {url}")
            
            # 使用 ted-transcript-extractor 包提取
            talk = self.extractor.extract_single(url)
            
            if not talk.success:
                print(f"[ERROR] 提取失败: {talk.error_message}")
                return None
            
            # 转换为 TedTxt 格式
            ted_data = TedTxt(
                title=talk.title,
                speaker=talk.speaker,
                url=talk.url,
                duration=self._format_duration(talk.duration),
                views=talk.views if hasattr(talk, 'views') else 0,
                transcript=talk.transcript
            )
            
            print(f"[SUCCESS] 提取成功")
            print(f"  标题: {ted_data.title}")
            print(f"  演讲者: {ted_data.speaker}")
            print(f"  时长: {ted_data.duration}")
            print(f"  Transcript长度: {len(ted_data.transcript)} 字符\n")
            
            return ted_data
            
        except Exception as e:
            print(f"[ERROR] 提取异常: {e}")
            return None
    
    def _format_duration(self, seconds: int) -> str:
        """
        将秒转换为 MM:SS 格式
        
        Args:
            seconds: 秒数
            
        Returns:
            格式化后的时长字符串
        """
        if not seconds or seconds < 0:
            return "0:00"
        
        minutes = seconds // 60
        remaining_seconds = seconds % 60
        return f"{minutes}:{remaining_seconds:02d}"


# 导出便捷函数
def extract_ted_transcript(url: str) -> Optional[TedTxt]:
    """
    便捷函数：提取 TED transcript
    
    Args:
        url: TED演讲URL
        
    Returns:
        TedTxt对象，失败返回None
    
    Example:
        >>> ted_data = extract_ted_transcript(
        ...     "https://www.ted.com/talks/brene_brown_the_power_of_vulnerability"
        ... )
        >>> if ted_data:
        ...     print(ted_data.title)
    """
    tool = TEDTranscriptTool()
    return tool.extract_transcript(url)
