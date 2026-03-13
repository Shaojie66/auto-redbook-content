import { runPipeline } from './pipeline';

async function main() {
  console.log('=== 手动执行一次 ===\n');
  
  try {
    await runPipeline();
    console.log('\n✅ 执行完成');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ 执行失败:', error);
    process.exit(1);
  }
}

main();
