export class Logger {
  info(msg: string) {
    console.log(`ℹ️  ${msg}`);
  }

  step(msg: string) {
    console.log(`\n▶️  ${msg}`);
  }

  success(msg: string) {
    console.log(`✅ ${msg}`);
  }

  warn(msg: string) {
    console.log(`⚠️  ${msg}`);
  }

  error(msg: string) {
    console.error(`❌ ${msg}`);
  }

  summary(stats: { total: number; success: number; fail: number; duration: string }) {
    console.log(`\n${'='.repeat(50)}`);
    console.log('📊 执行统计');
    console.log(`   总数: ${stats.total}`);
    console.log(`   成功: ${stats.success}`);
    console.log(`   失败: ${stats.fail}`);
    console.log(`   耗时: ${stats.duration}`);
    console.log('='.repeat(50));
  }
}
