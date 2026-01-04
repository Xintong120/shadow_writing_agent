// frontend/src/services/taskHistoryStorage.ts
// 任务历史存储服务 - 支持localStorage和Electron本地文件存储

import { TaskHistoryItem, LearningStatus } from '@/types/history'
import { TedTalk } from '@/types/ted'

// 存储接口定义
export interface TaskHistoryStorage {
  saveTask(task: TaskHistoryItem): Promise<void>
  getTasks(userId: string): Promise<TaskHistoryItem[]>
  getTaskByTalk(userId: string, talkId: string): Promise<TaskHistoryItem | null>
  taskExists(userId: string, taskId: string, talkId: string): Promise<boolean>
  updateTaskStatus(taskId: string, talkId: string, status: LearningStatus): Promise<void>
  updateTaskProgress(taskId: string, talkId: string, progress: number): Promise<void>
  updateLastLearnedAt(taskId: string, talkId: string, lastLearnedAt: string): Promise<void>
  addLearningTime(taskId: string, talkId: string, durationSeconds: number): Promise<void>
  deleteTask(taskId: string, talkId: string): Promise<void>
  clearAll(userId: string): Promise<void>
}

// 检测是否为Electron环境
const isElectron = typeof window !== 'undefined' && (window as any).electronAPI

// localStorage实现
export class LocalStorageTaskHistoryStorage implements TaskHistoryStorage {
  getTaskByTalk(userId: string, talkId: string): Promise<TaskHistoryItem | null> {
    throw new Error('Method not implemented.')
  }
  taskExists(userId: string, taskId: string, talkId: string): Promise<boolean> {
    throw new Error('Method not implemented.')
  }
  private getStorageKey(userId: string): string {
    return `task_history_${userId}`
  }

  async saveTask(task: TaskHistoryItem): Promise<void> {
    try {
      const tasks = await this.getTasks(task.userId)
      const existingIndex = tasks.findIndex(t => t.id === task.id)

      if (existingIndex >= 0) {
        tasks[existingIndex] = { ...task }
      } else {
        tasks.push(task)
      }

      localStorage.setItem(this.getStorageKey(task.userId), JSON.stringify(tasks))
    } catch (error) {
      console.error('保存任务历史失败:', error)
      throw error
    }
  }

  async getTasks(userId: string): Promise<TaskHistoryItem[]> {
    try {
      const data = localStorage.getItem(this.getStorageKey(userId))
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error('获取任务历史失败:', error)
      return []
    }
  }

  async getTaskByTalk(userId: string, talkId: string): Promise<TaskHistoryItem | null> {
    try {
      const tasks = await this.getTasks(userId)
      return tasks.find(task => task.talkId === talkId) || null
    } catch (error) {
      console.error('获取任务失败:', error)
      return null
    }
  }

  async taskExists(userId: string, taskId: string, talkId: string): Promise<boolean> {
    const task = await this.getTaskByTalk(userId, talkId)
    return task !== null
  }

  async updateTaskStatus(taskId: string, talkId: string, status: LearningStatus): Promise<void> {
    const taskIdWithTalkId = `${taskId}_${talkId}`

    // 遍历所有可能的用户ID
    for (const userId of ['user_123', 'guest_user']) {
      const tasks = await this.getTasks(userId)
      const task = tasks.find(t => t.id === taskIdWithTalkId)
      if (task) {
        task.status = status
        task.updatedAt = new Date().toISOString()
        await this.saveTask(task)
        break
      }
    }
  }

  async updateTaskProgress(taskId: string, talkId: string, progress: number): Promise<void> {
    const taskIdWithTalkId = `${taskId}_${talkId}`
    for (const userId of ['user_123', 'guest_user']) {
      const tasks = await this.getTasks(userId)
      const task = tasks.find(t => t.id === taskIdWithTalkId)
      if (task) {
        task.progress = progress
        task.updatedAt = new Date().toISOString()
        await this.saveTask(task)
        break
      }
    }
  }

  async updateLastLearnedAt(taskId: string, talkId: string, lastLearnedAt: string): Promise<void> {
    const taskIdWithTalkId = `${taskId}_${talkId}`
    for (const userId of ['user_123', 'guest_user']) {
      const tasks = await this.getTasks(userId)
      const task = tasks.find(t => t.id === taskIdWithTalkId)
      if (task) {
        task.lastLearnedAt = lastLearnedAt
        task.updatedAt = new Date().toISOString()
        await this.saveTask(task)
        break
      }
    }
  }

  async addLearningTime(taskId: string, talkId: string, durationSeconds: number): Promise<void> {
    const taskIdWithTalkId = `${taskId}_${talkId}`
    for (const userId of ['user_123', 'guest_user']) {
      const tasks = await this.getTasks(userId)
      const task = tasks.find(t => t.id === taskIdWithTalkId)
      if (task) {
        task.totalLearningTime += durationSeconds
        task.learningSessions += 1
        task.updatedAt = new Date().toISOString()
        await this.saveTask(task)
        break
      }
    }
  }

  async deleteTask(taskId: string, talkId: string): Promise<void> {
    const taskIdWithTalkId = `${taskId}_${talkId}`
    for (const userId of ['user_123', 'guest_user']) {
      const tasks = await this.getTasks(userId)
      const filteredTasks = tasks.filter(t => t.id !== taskIdWithTalkId)
      if (filteredTasks.length !== tasks.length) {
        localStorage.setItem(this.getStorageKey(userId), JSON.stringify(filteredTasks))
        break
      }
    }
  }

  async clearAll(userId: string): Promise<void> {
    localStorage.removeItem(this.getStorageKey(userId))
  }
}

// Electron文件存储实现（占位符）
export class ElectronTaskHistoryStorage implements TaskHistoryStorage {
  getTaskByTalk(userId: string, talkId: string): Promise<TaskHistoryItem | null> {
    throw new Error('Method not implemented.')
  }
  taskExists(userId: string, taskId: string, talkId: string): Promise<boolean> {
    throw new Error('Method not implemented.')
  }
  // TODO: 实现基于fs的文件存储
  async saveTask(task: TaskHistoryItem): Promise<void> {
    console.log('Electron存储暂未实现，使用localStorage替代')
    const localStorage = new LocalStorageTaskHistoryStorage()
    return localStorage.saveTask(task)
  }

  async getTasks(userId: string): Promise<TaskHistoryItem[]> {
    console.log('Electron存储暂未实现，使用localStorage替代')
    const localStorage = new LocalStorageTaskHistoryStorage()
    return localStorage.getTasks(userId)
  }

  async getTaskByTalk(userId: string, talkId: string): Promise<TaskHistoryItem | null> {
    console.log('Electron存储暂未实现，使用localStorage替代')
    const localStorage = new LocalStorageTaskHistoryStorage()
    return localStorage.getTaskByTalk(userId, talkId)
  }

  async taskExists(userId: string, taskId: string, talkId: string): Promise<boolean> {
    console.log('Electron存储暂未实现，使用localStorage替代')
    const localStorage = new LocalStorageTaskHistoryStorage()
    return localStorage.taskExists(userId, taskId, talkId)
  }

  async updateTaskStatus(taskId: string, talkId: string, status: LearningStatus): Promise<void> {
    console.log('Electron存储暂未实现，使用localStorage替代')
    const localStorage = new LocalStorageTaskHistoryStorage()
    return localStorage.updateTaskStatus(taskId, talkId, status)
  }

  async updateTaskProgress(taskId: string, talkId: string, progress: number): Promise<void> {
    console.log('Electron存储暂未实现，使用localStorage替代')
    const localStorage = new LocalStorageTaskHistoryStorage()
    return localStorage.updateTaskProgress(taskId, talkId, progress)
  }

  async updateLastLearnedAt(taskId: string, talkId: string, lastLearnedAt: string): Promise<void> {
    console.log('Electron存储暂未实现，使用localStorage替代')
    const localStorage = new LocalStorageTaskHistoryStorage()
    return localStorage.updateLastLearnedAt(taskId, talkId, lastLearnedAt)
  }

  async addLearningTime(taskId: string, talkId: string, durationSeconds: number): Promise<void> {
    console.log('Electron存储暂未实现，使用localStorage替代')
    const localStorage = new LocalStorageTaskHistoryStorage()
    return localStorage.addLearningTime(taskId, talkId, durationSeconds)
  }

  async deleteTask(taskId: string, talkId: string): Promise<void> {
    console.log('Electron存储暂未实现，使用localStorage替代')
    const localStorage = new LocalStorageTaskHistoryStorage()
    return localStorage.deleteTask(taskId, talkId)
  }

  async clearAll(userId: string): Promise<void> {
    console.log('Electron存储暂未实现，使用localStorage替代')
    const localStorage = new LocalStorageTaskHistoryStorage()
    return localStorage.clearAll(userId)
  }
}

// 全局存储实例
export const taskHistoryStorage: TaskHistoryStorage = isElectron
  ? new ElectronTaskHistoryStorage()
  : new LocalStorageTaskHistoryStorage()