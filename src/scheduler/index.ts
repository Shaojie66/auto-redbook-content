import * as cron from 'node-cron';
import { runPipeline } from '../pipeline';
import { config } from '../config';

export class Scheduler {
  private task: cron.ScheduledTask | null = null;

  start() {
    if (!config.schedule.enabled) {
      console.log('⏸️  定时任务未启用 (SCHEDULE_ENABLED=false)');
      return;
    }

    if (!cron.validate(config.schedule.cron)) {
      throw new Error(`无效的 cron 表达式: ${config.schedule.cron}`);
    }

    console.log(`⏰ 启动定时任务: ${config.schedule.cron}`);
    console.log(`   下次执行: ${this.getNextRun()}\n`);

    this.task = cron.schedule(config.schedule.cron, async () => {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`⏰ 定时任务触发 - ${new Date().toLocaleString('zh-CN')}`);
      console.log('='.repeat(60));
      
      try {
        await runPipeline();
      } catch (error) {
        console.error('❌ 定时任务执行失败:', error);
      }
      
      console.log(`\n下次执行: ${this.getNextRun()}\n`);
    });

    console.log('✅ 定时任务已启动，按 Ctrl+C 停止\n');
  }

  stop() {
    if (this.task) {
      this.task.stop();
      console.log('⏹️  定时任务已停止');
    }
  }

  private getNextRun(): string {
    // 简单估算下次执行时间
    return '根据 cron 表达式计算';
  }
}
