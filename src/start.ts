import { Scheduler } from './scheduler';

const scheduler = new Scheduler();

process.on('SIGINT', () => {
  console.log('\n收到停止信号...');
  scheduler.stop();
  process.exit(0);
});

scheduler.start();
